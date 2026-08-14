import { memo } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatPercent, formatTime } from '@/utils/formatters'
import { styles } from './styles'
import type { MessageBubbleProps } from './types'

const MessageBubbleComponent = ({
  message,
  onSuggestionSelect,
  isSuggestionDisabled,
}: MessageBubbleProps): React.JSX.Element => {
  if (message.author === 'user') {
    return (
      <li className={styles.row(true)}>
        <p className={styles.userBubble(message.status === 'failed')}>{message.text}</p>
        <span className={styles.meta}>
          You · {formatTime(message.createdAt)}
          {message.status === 'failed' ? ' · not delivered' : ''}
        </span>
      </li>
    )
  }

  const { answer } = message

  return (
    <li className={styles.row(false)}>
      <div className={styles.assistantBubble(!answer.answered)}>
        {answer.answer}

        {answer.answered ? (
          <div className={styles.answerFooter}>
            {answer.categoryName ? <Badge tone="accent">{answer.categoryName}</Badge> : null}
            {answer.confidence !== null ? (
              <Badge
                tone="positive"
                title="How closely your question matched the registered question"
              >
                match {formatPercent(answer.confidence)}
              </Badge>
            ) : null}
            {answer.matchedQuestion ? (
              <span className={styles.suggestionsLabel}>
                Registered as: “{answer.matchedQuestion}”
              </span>
            ) : null}
          </div>
        ) : null}

        {answer.suggestions.length > 0 ? (
          <div className={styles.suggestions}>
            <span className={styles.suggestionsLabel}>
              {answer.answered ? 'Related questions' : 'Did you mean one of these?'}
            </span>
            <div className={styles.suggestionList}>
              {answer.suggestions.map((suggestion) => (
                <Button
                  key={suggestion.faqId}
                  variant="ghost"
                  size="sm"
                  disabled={isSuggestionDisabled}
                  onClick={() => onSuggestionSelect(suggestion.question)}
                >
                  {suggestion.question}
                </Button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <span className={styles.meta}>
        Assistant · {formatTime(message.createdAt)}
        {answer.answered ? '' : ' · no registered answer'}
      </span>
    </li>
  )
}

export const MessageBubble = memo(MessageBubbleComponent)
