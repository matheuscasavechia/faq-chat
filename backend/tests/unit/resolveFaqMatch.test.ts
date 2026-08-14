import { describe, expect, it } from 'vitest'
import { resolveFaqMatch } from '../../src/domain/faq/resolveFaqMatch'
import { buildFaq } from '../support/fixtures'

const answerThreshold = 0.35
const suggestionThreshold = 0.15
const maxSuggestions = 3

const resolve = (
  input: Partial<Parameters<typeof resolveFaqMatch>[0]> & {
    candidates: Parameters<typeof resolveFaqMatch>[0]['candidates']
  },
) =>
  resolveFaqMatch({
    exactMatch: null,
    answerThreshold,
    suggestionThreshold,
    maxSuggestions,
    ...input,
  })

describe('resolveFaqMatch', () => {
  it('prefers the exact match and reports full similarity', () => {
    const exactMatch = buildFaq()

    const result = resolve({
      exactMatch,
      candidates: [{ faq: buildFaq({ id: 'other' }), similarity: 0.9 }],
    })

    expect(result.answered).toBe(true)
    if (!result.answered) throw new Error('expected an answered match')
    expect(result.faq.id).toBe(exactMatch.id)
    expect(result.similarity).toBe(1)
    expect(result.strategy).toBe('exact')
  })

  it('answers with the best candidate above the threshold', () => {
    const best = buildFaq({ id: 'faq-best' })

    const result = resolve({
      candidates: [
        { faq: buildFaq({ id: 'faq-weak' }), similarity: 0.2 },
        { faq: best, similarity: 0.62 },
      ],
    })

    expect(result.answered).toBe(true)
    if (!result.answered) throw new Error('expected an answered match')
    expect(result.faq.id).toBe('faq-best')
    expect(result.similarity).toBe(0.62)
    expect(result.strategy).toBe('similarity')
  })

  it('treats a score exactly on the threshold as answered', () => {
    const result = resolve({
      candidates: [{ faq: buildFaq(), similarity: answerThreshold }],
    })

    expect(result.answered).toBe(true)
  })

  it('returns unanswered when every candidate is below the threshold', () => {
    const result = resolve({
      candidates: [{ faq: buildFaq(), similarity: 0.34 }],
    })

    expect(result.answered).toBe(false)
    if (result.answered) throw new Error('expected an unanswered match')
    expect(result.bestSimilarity).toBe(0.34)
  })

  it('returns unanswered with no best similarity when there are no candidates', () => {
    const result = resolve({ candidates: [] })

    expect(result.answered).toBe(false)
    if (result.answered) throw new Error('expected an unanswered match')
    expect(result.bestSimilarity).toBeNull()
  })

  it('suggests near matches above the suggestion threshold and excludes the answered FAQ', () => {
    const best = buildFaq({ id: 'faq-best' })

    const result = resolve({
      candidates: [
        { faq: best, similarity: 0.7 },
        { faq: buildFaq({ id: 'faq-second' }), similarity: 0.3 },
        { faq: buildFaq({ id: 'faq-noise' }), similarity: 0.05 },
      ],
    })

    if (!result.answered) throw new Error('expected an answered match')
    expect(result.suggestions.map((suggestion) => suggestion.faqId)).toEqual(['faq-second'])
  })

  it('caps the number of suggestions', () => {
    const result = resolve({
      candidates: [
        { faq: buildFaq({ id: 'faq-1' }), similarity: 0.31 },
        { faq: buildFaq({ id: 'faq-2' }), similarity: 0.3 },
        { faq: buildFaq({ id: 'faq-3' }), similarity: 0.29 },
        { faq: buildFaq({ id: 'faq-4' }), similarity: 0.28 },
      ],
      maxSuggestions: 2,
    })

    expect(result.suggestions).toHaveLength(2)
  })
})
