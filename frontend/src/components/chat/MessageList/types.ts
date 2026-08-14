import type { RefObject } from 'react'
import type { ChatMessage } from '@/types/chat'

export interface MessageListProps {
  messages: ChatMessage[]
  isSending: boolean
  onSuggestionSelect: (question: string) => void
}

export interface MessageListLayoutProps extends MessageListProps {
  scrollAnchorRef: RefObject<HTMLDivElement | null>
}
