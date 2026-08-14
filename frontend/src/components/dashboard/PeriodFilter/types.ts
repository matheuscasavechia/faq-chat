import type { AnalyticsPeriod } from '@/constants/analytics'

export interface PeriodFilterLayoutProps {
  options: readonly AnalyticsPeriod[]
  selected: AnalyticsPeriod
  isDisabled: boolean
  onSelect: (period: AnalyticsPeriod) => void
}
