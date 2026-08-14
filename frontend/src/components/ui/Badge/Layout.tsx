import { styles } from './styles'
import type { BadgeProps } from './types'

export const Badge = ({ tone = 'neutral', children, title }: BadgeProps): React.JSX.Element => (
  <span className={styles.badge(tone)} title={title}>
    {children}
  </span>
)
