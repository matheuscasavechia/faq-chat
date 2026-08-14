import { styles } from './styles'
import type { SkeletonListProps, SkeletonProps } from './types'

export const Skeleton = ({
  height = '1rem',
  width = '100%',
  radius = 'var(--radius-sm)',
  label,
}: SkeletonProps): React.JSX.Element => (
  <div
    className={styles.block}
    style={{ height, width, borderRadius: radius }}
    role={label ? 'status' : undefined}
    aria-label={label}
  />
)

export const SkeletonList = ({
  rows,
  rowHeight = '2.5rem',
  label,
}: SkeletonListProps): React.JSX.Element => (
  <div className={styles.list} role="status" aria-label={label}>
    {Array.from({ length: rows }, (_, index) => (
      <Skeleton key={index} height={rowHeight} />
    ))}
  </div>
)
