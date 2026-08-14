import { API_ENDPOINTS } from '@/constants/api'
import type { ChatAnswer } from '@/types/chat'
import { apiClient } from './client'
import { chatAnswerDtoSchema } from './dto/chatDto'
import { toChatAnswer } from './mappers/chatMapper'

export interface AskQuestionPayload {
  question: string
  sessionId?: string
}

export const askQuestion = async (
  payload: AskQuestionPayload,
  signal?: AbortSignal,
): Promise<ChatAnswer> => {
  const response = await apiClient.post(
    API_ENDPOINTS.chatQuery,
    payload,
    chatAnswerDtoSchema,
    signal ? { signal } : {},
  )

  return toChatAnswer(response.data)
}
