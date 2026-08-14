import { ChatComposer } from '@/components/chat/ChatComposer'
import { MessageList } from '@/components/chat/MessageList'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SkeletonList } from '@/components/feedback/Skeleton'
import { CHAT_WELCOME_MESSAGE, MAX_QUESTION_LENGTH } from '@/constants/chat'
import { styles } from './styles'
import type { ChatPageLayoutProps } from './types'

const HOW_IT_WORKS = [
  'Questions are matched against the registered knowledge base using trigram similarity.',
  'Different wording still finds the right answer when it is close enough.',
  'When confidence is too low the assistant says so instead of guessing.',
  'Every question is recorded and feeds the analytics dashboard.',
]

export const ChatPageLayout = ({
  messages,
  inputValue,
  isSending,
  canSubmit,
  errorMessage,
  canRetry,
  starterQuestions,
  categories,
  isCatalogLoading,
  onInputChange,
  onSubmit,
  onRetry,
  onSuggestionSelect,
}: ChatPageLayoutProps): React.JSX.Element => (
  <div>
    <div className={styles.intro}>
      <h1 className={styles.title}>FAQ assistant</h1>
      <p className={styles.description}>
        Ask a question in your own words. The assistant searches the registered knowledge base and
        answers only when it finds a close enough match.
      </p>
    </div>

    <div className={styles.page}>
      <section className={styles.conversationCard} aria-label="Chat with the FAQ assistant">
        <div className={styles.conversation}>
          {messages.length === 0 ? (
            <div className={styles.welcome}>
              <p className={styles.welcomeTitle}>Hi! What can I help you with?</p>
              <p className={styles.welcomeText}>{CHAT_WELCOME_MESSAGE}</p>
              <div className={styles.suggestions}>
                {starterQuestions.map((question) => (
                  <Button
                    key={question}
                    variant="secondary"
                    size="sm"
                    disabled={isSending}
                    onClick={() => onSuggestionSelect(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <MessageList
              messages={messages}
              isSending={isSending}
              onSuggestionSelect={onSuggestionSelect}
            />
          )}
        </div>

        <div className={styles.composerArea}>
          {errorMessage ? (
            <ErrorState
              compact
              title="The question could not be sent"
              message={errorMessage}
              {...(canRetry ? { onRetry } : {})}
              isRetrying={isSending}
            />
          ) : null}

          <ChatComposer
            value={inputValue}
            isSending={isSending}
            canSubmit={canSubmit}
            maxLength={MAX_QUESTION_LENGTH}
            onChange={onInputChange}
            onSubmit={onSubmit}
          />
        </div>
      </section>

      <aside className={styles.sidebar}>
        <Card
          title="Knowledge base"
          subtitle="Topics currently covered by the assistant"
          as="article"
        >
          {isCatalogLoading ? (
            <SkeletonList rows={3} rowHeight="1.5rem" label="Loading categories" />
          ) : (
            <ul className={styles.categoryList}>
              {categories.map((category) => (
                <li key={category.id}>
                  <Badge tone="neutral" title={`${String(category.faqCount)} registered questions`}>
                    {category.name} · {category.faqCount}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="How it works" as="article">
          <ul className={styles.tipList}>
            {HOW_IT_WORKS.map((tip) => (
              <li key={tip} className={styles.tipItem}>
                <span className={styles.tipMarker} aria-hidden="true">
                  →
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </Card>
      </aside>
    </div>
  </div>
)
