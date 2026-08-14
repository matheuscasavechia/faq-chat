import type { FaqMatchStrategy } from '../../domain/faq/resolveFaqMatch'
import type { AskQuestionOutput } from '../../useCases/AskQuestionUseCase'

export interface ChatAnswerResponse {
  interactionId: string
  question: string
  answered: boolean
  answer: string
  similarity: number | null
  matchStrategy: FaqMatchStrategy | null
  matchedFaq: {
    id: string
    question: string
    category: { id: string; name: string; slug: string }
  } | null
  suggestions: Array<{ faqId: string; question: string; similarity: number }>
  createdAt: string
}

export const toChatAnswerResponse = (output: AskQuestionOutput): ChatAnswerResponse => ({
  interactionId: output.interactionId,
  question: output.question,
  answered: output.answered,
  answer: output.answer,
  similarity: output.similarity,
  matchStrategy: output.matchStrategy,
  matchedFaq: output.matchedFaq,
  suggestions: output.suggestions,
  createdAt: output.createdAt.toISOString(),
})
