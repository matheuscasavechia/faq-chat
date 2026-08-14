import { memo } from 'react'
import { styles } from './styles'
import type { KpiCardProps } from './types'

const KpiCardComponent = ({
  label,
  value,
  hint,
  tone = 'neutral',
  isRefreshing = false,
}: KpiCardProps): React.JSX.Element => (
  <article className={styles.card(isRefreshing)}>
    <h3 className={styles.label}>{label}</h3>
    <p className={styles.value(tone)}>{value}</p>
    {hint ? <p className={styles.hint}>{hint}</p> : null}
  </article>
)

export const KpiCard = memo(KpiCardComponent)
