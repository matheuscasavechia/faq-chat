export type ChatMessageAuthor = 'user' | 'assistant'

export type ChatMessageStatus = 'sending' | 'sent' | 'failed'

export interface FaqSuggestion {
  faqId: string
  question: string
}

export interface ChatAnswer {
  interactionId: string
  answered: boolean
  answer: string
  matchedQuestion: string | null
  categoryName: string | null
  confidence: number | null
  suggestions: FaqSuggestion[]
  createdAt: Date
}

interface ChatMessageBase {
  id: string
  createdAt: Date
}

export interface UserChatMessage extends ChatMessageBase {
  author: 'user'
  text: string
  status: ChatMessageStatus
}

export interface AssistantChatMessage extends ChatMessageBase {
  author: 'assistant'
  answer: ChatAnswer
}

export type ChatMessage = UserChatMessage | AssistantChatMessage
