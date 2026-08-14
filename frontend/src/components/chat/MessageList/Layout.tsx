import { MessageBubble } from '@/components/chat/MessageBubble'
import { styles } from './styles'
import type { MessageListLayoutProps } from './types'

export const MessageListLayout = ({
  messages,
  isSending,
  onSuggestionSelect,
  scrollAnchorRef,
}: MessageListLayoutProps): React.JSX.Element => (
  <ul className={styles.list} aria-live="polite" aria-label="Conversation">
    {messages.map((message) => (
      <MessageBubble
        key={message.id}
        message={message}
        onSuggestionSelect={onSuggestionSelect}
        isSuggestionDisabled={isSending}
      />
    ))}

    {isSending ? (
      <li className={styles.typing}>
        <span className={styles.dots} aria-hidden="true">
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </span>
        Searching the knowledge base…
      </li>
    ) : null}

    <div ref={scrollAnchorRef} className={styles.anchor} />
  </ul>
)
