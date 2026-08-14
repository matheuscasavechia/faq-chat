import { EXACT_MATCH_SIMILARITY } from '../../constants/chat'
import type { Faq, FaqSimilarityCandidate } from './Faq'

export type FaqMatchStrategy = 'exact' | 'similarity'

export interface FaqSuggestion {
  faqId: string
  question: string
  similarity: number
}

export interface AnsweredFaqMatch {
  answered: true
  faq: Faq
  similarity: number
  strategy: FaqMatchStrategy
  suggestions: FaqSuggestion[]
}

export interface UnansweredFaqMatch {
  answered: false
  bestSimilarity: number | null
  suggestions: FaqSuggestion[]
}

export type FaqMatchResult = AnsweredFaqMatch | UnansweredFaqMatch

export interface ResolveFaqMatchInput {
  exactMatch: Faq | null
  candidates: FaqSimilarityCandidate[]
  answerThreshold: number
  suggestionThreshold: number
  maxSuggestions: number
}

const byDescendingSimilarity = (
  first: FaqSimilarityCandidate,
  second: FaqSimilarityCandidate,
): number => second.similarity - first.similarity

const toSuggestions = (
  candidates: FaqSimilarityCandidate[],
  {
    excludeFaqId,
    suggestionThreshold,
    maxSuggestions,
  }: {
    excludeFaqId: string | null
    suggestionThreshold: number
    maxSuggestions: number
  },
): FaqSuggestion[] =>
  candidates
    .filter(
      (candidate) =>
        candidate.faq.id !== excludeFaqId && candidate.similarity >= suggestionThreshold,
    )
    .slice(0, maxSuggestions)
    .map((candidate) => ({
      faqId: candidate.faq.id,
      question: candidate.faq.question,
      similarity: candidate.similarity,
    }))

export const resolveFaqMatch = ({
  exactMatch,
  candidates,
  answerThreshold,
  suggestionThreshold,
  maxSuggestions,
}: ResolveFaqMatchInput): FaqMatchResult => {
  const ranked = [...candidates].sort(byDescendingSimilarity)

  if (exactMatch) {
    return {
      answered: true,
      faq: exactMatch,
      similarity: EXACT_MATCH_SIMILARITY,
      strategy: 'exact',
      suggestions: toSuggestions(ranked, {
        excludeFaqId: exactMatch.id,
        suggestionThreshold,
        maxSuggestions,
      }),
    }
  }

  const best = ranked[0]

  if (best && best.similarity >= answerThreshold) {
    return {
      answered: true,
      faq: best.faq,
      similarity: best.similarity,
      strategy: 'similarity',
      suggestions: toSuggestions(ranked.slice(1), {
        excludeFaqId: best.faq.id,
        suggestionThreshold,
        maxSuggestions,
      }),
    }
  }

  return {
    answered: false,
    bestSimilarity: best ? best.similarity : null,
    suggestions: toSuggestions(ranked, {
      excludeFaqId: null,
      suggestionThreshold,
      maxSuggestions,
    }),
  }
}
