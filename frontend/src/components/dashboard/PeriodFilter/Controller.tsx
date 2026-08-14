import { ANALYTICS_PERIODS } from '@/constants/analytics'
import { useAnalyticsPeriod } from './hooks/useAnalyticsPeriod'
import { PeriodFilterLayout } from './Layout'

export interface PeriodFilterProps {
  isDisabled?: boolean
}

export const PeriodFilter = ({ isDisabled = false }: PeriodFilterProps): React.JSX.Element => {
  const { period, selectPeriod } = useAnalyticsPeriod()

  return (
    <PeriodFilterLayout
      options={ANALYTICS_PERIODS}
      selected={period}
      isDisabled={isDisabled}
      onSelect={selectPeriod}
    />
  )
}
