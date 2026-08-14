import type { ChatMessage } from '@/types/chat'

export interface MessageBubbleProps {
  message: ChatMessage
  onSuggestionSelect: (question: string) => void
  isSuggestionDisabled: boolean
}
