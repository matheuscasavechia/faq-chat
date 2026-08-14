import type { ChatMessage } from '@/types/chat'
import type { CategoryOption } from '@/types/catalog'

export interface ChatViewModel {
  messages: ChatMessage[]
  inputValue: string
  isSending: boolean
  canSubmit: boolean
  errorMessage: string | null
  canRetry: boolean
  onInputChange: (value: string) => void
  onSubmit: () => void
  onRetry: () => void
  onSuggestionSelect: (question: string) => void
  onDismissError: () => void
}

export interface ChatPageLayoutProps extends ChatViewModel {
  starterQuestions: string[]
  categories: CategoryOption[]
  isCatalogLoading: boolean
}
