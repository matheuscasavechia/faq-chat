import { memo } from 'react'
import { StateMessage } from '@/components/feedback/StateMessage'
import { formatInteger } from '@/utils/formatters'
import { styles } from './styles'
import type { RankedQuestionListProps } from './types'

const toWidth = (share: number): string => `${Math.max(2, Math.round(share * 100))}%`

const RankedQuestionListComponent = ({
  items,
  tone = 'accent',
  emptyMessage,
}: RankedQuestionListProps): React.JSX.Element => {
  if (items.length === 0) {
    return <StateMessage compact title="Nothing to show yet" description={emptyMessage} />
  }

  return (
    <ol className={styles.list}>
      {items.map((item) => (
        <li key={item.id} className={styles.item}>
          <div className={styles.header}>
            <span className={styles.question}>{item.question}</span>
            <span className={styles.total}>{formatInteger(item.total)}</span>
          </div>
          <div
            className={styles.track}
            role="meter"
            aria-valuenow={item.total}
            aria-valuemin={0}
            aria-label={`${item.question}: ${String(item.total)} queries`}
          >
            <div className={styles.fill(tone)} style={{ width: toWidth(item.share) }} />
          </div>
          <span className={styles.meta}>{item.meta}</span>
        </li>
      ))}
    </ol>
  )
}

export const RankedQuestionList = memo(RankedQuestionListComponent)
