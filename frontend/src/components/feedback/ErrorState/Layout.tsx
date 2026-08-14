import { StateMessage } from '@/components/feedback/StateMessage'
import { Button } from '@/components/ui/Button'
import { styles } from './styles'
import type { ErrorStateProps } from './types'

export const ErrorState = ({
  title = 'Something went wrong',
  message,
  onRetry,
  isRetrying = false,
  compact = false,
}: ErrorStateProps): React.JSX.Element => (
  <StateMessage
    tone="error"
    icon="⚠"
    title={title}
    description={message}
    compact={compact}
    action={
      onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry} isLoading={isRetrying}>
          {styles.retryLabel}
        </Button>
      ) : undefined
    }
  />
)
