import { beforeEach, describe, expect, it } from 'vitest'
import { FALLBACK_ANSWER } from '../../src/constants/chat'
import { DomainError } from '../../src/domain/errors'
import { AskQuestionUseCase } from '../../src/useCases/AskQuestionUseCase'
import {
  InMemoryFaqRepository,
  InMemoryInteractionRepository,
} from '../support/inMemoryRepositories'
import { buildFaqCatalog } from '../support/fixtures'

const settings = { similarityThreshold: 0.35, suggestionThreshold: 0.15, maxCandidates: 3 }

describe('AskQuestionUseCase', () => {
  let faqRepository: InMemoryFaqRepository
  let interactionRepository: InMemoryInteractionRepository
  let useCase: AskQuestionUseCase

  beforeEach(() => {
    faqRepository = new InMemoryFaqRepository(buildFaqCatalog())
    interactionRepository = new InMemoryInteractionRepository()
    useCase = new AskQuestionUseCase(faqRepository, interactionRepository, settings)
  })

  it('answers a question registered with the same wording', async () => {
    const result = await useCase.execute({
      question: 'How do I reset my password?',
      sessionId: 's1',
    })

    expect(result.answered).toBe(true)
    expect(result.answer).toContain('Forgot password')
    expect(result.matchStrategy).toBe('exact')
    expect(result.similarity).toBe(1)
    expect(result.matchedFaq?.category.slug).toBe('password')
  })

  it('answers a question written differently but above the similarity threshold', async () => {
    faqRepository.forceSimilarity('faq-reset-password', 0.58)

    const result = await useCase.execute({
      question: 'i need to reset the password of my account',
      sessionId: 's1',
    })

    expect(result.answered).toBe(true)
    expect(result.matchStrategy).toBe('similarity')
    expect(result.similarity).toBe(0.58)
  })

  it('falls back gracefully when the closest FAQ is below the threshold', async () => {
    faqRepository.forceSimilarity('faq-reset-password', 0.2)
    faqRepository.forceSimilarity('faq-update-card', 0.1)
    faqRepository.forceSimilarity('faq-invoices', 0.05)

    const result = await useCase.execute({
      question: 'do you support single sign on with okta',
      sessionId: 's1',
    })

    expect(result.answered).toBe(false)
    expect(result.answer).toBe(FALLBACK_ANSWER)
    expect(result.matchedFaq).toBeNull()
    expect(result.similarity).toBe(0.2)
  })

  it('records every answered interaction with its matched FAQ and category', async () => {
    await useCase.execute({ question: 'How do I reset my password?', sessionId: 'session-42' })

    expect(interactionRepository.created).toHaveLength(1)
    expect(interactionRepository.created[0]).toMatchObject({
      normalizedQuestion: 'how do i reset my password',
      matchedFaqId: 'faq-reset-password',
      answered: true,
      similarityScore: 1,
      categoryId: 'category-password',
      sessionId: 'session-42',
    })
  })

  it('records unanswered interactions so they show up in analytics', async () => {
    faqRepository.forceSimilarity('faq-reset-password', 0.1)
    faqRepository.forceSimilarity('faq-update-card', 0.08)
    faqRepository.forceSimilarity('faq-invoices', 0.02)

    await useCase.execute({ question: 'can I pay with crypto', sessionId: null })

    expect(interactionRepository.created[0]).toMatchObject({
      answered: false,
      matchedFaqId: null,
      categoryId: null,
      sessionId: null,
      similarityScore: 0.1,
    })
  })

  it('returns near matches as suggestions when the question is unanswered', async () => {
    faqRepository.forceSimilarity('faq-reset-password', 0.3)
    faqRepository.forceSimilarity('faq-update-card', 0.2)
    faqRepository.forceSimilarity('faq-invoices', 0.01)

    const result = await useCase.execute({ question: 'password card', sessionId: null })

    expect(result.answered).toBe(false)
    expect(result.suggestions.map((suggestion) => suggestion.faqId)).toEqual([
      'faq-reset-password',
      'faq-update-card',
    ])
  })

  it('rejects questions that carry no searchable content', async () => {
    await expect(useCase.execute({ question: '???', sessionId: null })).rejects.toBeInstanceOf(
      DomainError,
    )
    expect(interactionRepository.created).toHaveLength(0)
  })

  it('skips the similarity search when an exact match exists', async () => {
    faqRepository.forceSimilarity('faq-update-card', 0.99)

    const result = await useCase.execute({
      question: '  How do I RESET my password?  ',
      sessionId: null,
    })

    expect(result.matchedFaq?.id).toBe('faq-reset-password')
    expect(result.suggestions).toHaveLength(0)
  })
})
