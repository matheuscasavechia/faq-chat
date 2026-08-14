import { useScrollToLatestMessage } from './hooks/useScrollToLatestMessage'
import { MessageListLayout } from './Layout'
import type { MessageListProps } from './types'

export const MessageList = ({
  messages,
  isSending,
  onSuggestionSelect,
}: MessageListProps): React.JSX.Element => {
  const scrollAnchorRef = useScrollToLatestMessage(`${messages.length}:${String(isSending)}`)

  return (
    <MessageListLayout
      messages={messages}
      isSending={isSending}
      onSuggestionSelect={onSuggestionSelect}
      scrollAnchorRef={scrollAnchorRef}
    />
  )
}
