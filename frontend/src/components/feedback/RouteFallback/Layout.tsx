import { Skeleton } from '@/components/feedback/Skeleton'
import { styles } from './styles'

export const RouteFallback = (): React.JSX.Element => (
  <div className={styles.wrapper} role="status" aria-label="Loading page">
    <Skeleton height="2rem" width="14rem" />
    <Skeleton height="10rem" />
    <Skeleton height="10rem" />
  </div>
)
