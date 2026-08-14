import type { ChatAnswerDto } from '../dto/chatDto'
import type { ChatAnswer } from '@/types/chat'

export const toChatAnswer = (dto: ChatAnswerDto): ChatAnswer => ({
  interactionId: dto.interactionId,
  answered: dto.answered,
  answer: dto.answer,
  matchedQuestion: dto.matchedFaq?.question ?? null,
  categoryName: dto.matchedFaq?.category.name ?? null,
  confidence: dto.similarity,
  suggestions: dto.suggestions.map((suggestion) => ({
    faqId: suggestion.faqId,
    question: suggestion.question,
  })),
  createdAt: new Date(dto.createdAt),
})
