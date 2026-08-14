import type { AssistantChatMessage, ChatAnswer, ChatMessage, UserChatMessage } from '@/types/chat'
import { createMessageId } from './chatSession'

export const createUserMessage = (text: string, createdAt: Date = new Date()): UserChatMessage => ({
  id: createMessageId('user'),
  author: 'user',
  text,
  status: 'sending',
  createdAt,
})

export const createAssistantMessage = (answer: ChatAnswer): AssistantChatMessage => ({
  id: createMessageId('assistant'),
  author: 'assistant',
  answer,
  createdAt: answer.createdAt,
})

export const markMessageStatus = (
  messages: ChatMessage[],
  messageId: string,
  status: UserChatMessage['status'],
): ChatMessage[] =>
  messages.map((message) =>
    message.author === 'user' && message.id === messageId ? { ...message, status } : message,
  )

export const appendMessage = (messages: ChatMessage[], message: ChatMessage): ChatMessage[] => [
  ...messages,
  message,
]
