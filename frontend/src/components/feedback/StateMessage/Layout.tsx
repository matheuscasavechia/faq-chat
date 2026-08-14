import { styles } from './styles'
import type { StateMessageProps } from './types'

export const StateMessage = ({
  tone = 'neutral',
  title,
  description,
  icon,
  action,
  compact = false,
}: StateMessageProps): React.JSX.Element => (
  <div
    className={styles.wrapper(tone, compact)}
    role={tone === 'error' ? 'alert' : 'status'}
    aria-live={tone === 'error' ? 'assertive' : 'polite'}
  >
    {icon ? (
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
    ) : null}
    <p className={styles.title}>{title}</p>
    {description ? <p className={styles.description}>{description}</p> : null}
    {action ? <div className={styles.action}>{action}</div> : null}
  </div>
)
