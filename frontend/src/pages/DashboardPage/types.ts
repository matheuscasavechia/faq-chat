import type { RankedQuestionItem } from '@/components/dashboard/RankedQuestionList'
import type { AnalyticsPeriod } from '@/constants/analytics'
import type { CategorySlice, TimelinePoint } from '@/types/analytics'

export interface KpiViewModel {
  label: string
  value: string
  hint: string
  tone: 'neutral' | 'positive' | 'attention'
}

export interface DashboardViewModel {
  period: AnalyticsPeriod
  rangeLabel: string
  isInitialLoading: boolean
  isRefreshing: boolean
  hasData: boolean
  isEmpty: boolean
  errorMessage: string | null
  lastUpdatedLabel: string | null
  kpis: KpiViewModel[]
  timeline: TimelinePoint[]
  categoryDistribution: CategorySlice[]
  topQuestions: RankedQuestionItem[]
  unansweredQuestions: RankedQuestionItem[]
  onRetry: () => void
}

export type DashboardPageLayoutProps = DashboardViewModel
