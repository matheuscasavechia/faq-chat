import { ANALYTICS_PERIOD_LABELS, ANALYTICS_PERIOD_SHORT_LABELS } from '@/constants/analytics'
import { styles } from './styles'
import type { PeriodFilterLayoutProps } from './types'

export const PeriodFilterLayout = ({
  options,
  selected,
  isDisabled,
  onSelect,
}: PeriodFilterLayoutProps): React.JSX.Element => (
  <div className={styles.group} role="group" aria-label="Analytics period">
    {options.map((option) => (
      <button
        key={option}
        type="button"
        className={styles.option(option === selected)}
        aria-pressed={option === selected}
        disabled={isDisabled}
        title={ANALYTICS_PERIOD_LABELS[option]}
        onClick={() => onSelect(option)}
      >
        {ANALYTICS_PERIOD_SHORT_LABELS[option]}
      </button>
    ))}
  </div>
)
