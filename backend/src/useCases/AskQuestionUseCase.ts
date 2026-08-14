import { FALLBACK_ANSWER } from '../constants/chat'
import type { CategorySummary } from '../domain/faq/Faq'
import {
  resolveFaqMatch,
  type FaqMatchStrategy,
  type FaqSuggestion,
} from '../domain/faq/resolveFaqMatch'
import { normalizeQuestion } from '../domain/question/normalizeQuestion'
import { DomainError } from '../domain/errors'
import type { FaqRepository } from '../repositories/FaqRepository'
import type { InteractionRepository } from '../repositories/InteractionRepository'

export interface AskQuestionInput {
  question: string
  sessionId: string | null
}

export interface AskQuestionOutput {
  interactionId: string
  question: string
  answered: boolean
  answer: string
  similarity: number | null
  matchStrategy: FaqMatchStrategy | null
  matchedFaq: {
    id: string
    question: string
    category: CategorySummary
  } | null
  suggestions: FaqSuggestion[]
  createdAt: Date
}

export interface AskQuestionSettings {
  similarityThreshold: number
  suggestionThreshold: number
  maxCandidates: number
}

export class AskQuestionUseCase {
  constructor(
    private readonly faqRepository: FaqRepository,
    private readonly interactionRepository: InteractionRepository,
    private readonly settings: AskQuestionSettings,
  ) {}

  async execute({ question, sessionId }: AskQuestionInput): Promise<AskQuestionOutput> {
    const normalizedQuestion = normalizeQuestion(question)

    if (normalizedQuestion.length === 0) {
      throw new DomainError('The question must contain at least one letter or number.')
    }

    const exactMatch = await this.faqRepository.findByNormalizedQuestion(normalizedQuestion)
    const candidates = exactMatch
      ? []
      : await this.faqRepository.findMostSimilar(normalizedQuestion, {
          limit: this.settings.maxCandidates + 1,
        })

    const match = resolveFaqMatch({
      exactMatch,
      candidates,
      answerThreshold: this.settings.similarityThreshold,
      suggestionThreshold: this.settings.suggestionThreshold,
      maxSuggestions: this.settings.maxCandidates,
    })

    const interaction = await this.interactionRepository.create({
      question: question.trim(),
      normalizedQuestion,
      matchedFaqId: match.answered ? match.faq.id : null,
      similarityScore: match.answered ? match.similarity : match.bestSimilarity,
      answered: match.answered,
      categoryId: match.answered ? match.faq.category.id : null,
      sessionId,
    })

    if (!match.answered) {
      return {
        interactionId: interaction.id,
        question: question.trim(),
        answered: false,
        answer: FALLBACK_ANSWER,
        similarity: match.bestSimilarity,
        matchStrategy: null,
        matchedFaq: null,
        suggestions: match.suggestions,
        createdAt: interaction.createdAt,
      }
    }

    return {
      interactionId: interaction.id,
      question: question.trim(),
      answered: true,
      answer: match.faq.answer,
      similarity: match.similarity,
      matchStrategy: match.strategy,
      matchedFaq: {
        id: match.faq.id,
        question: match.faq.question,
        category: match.faq.category,
      },
      suggestions: match.suggestions,
      createdAt: interaction.createdAt,
    }
  }
}
