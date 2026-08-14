import type { AnalyticsPeriod } from '@/constants/analytics'

export type TimelineGranularity = 'day' | 'week' | 'month'

export interface AnalyticsOverview {
  totalQueries: number
  answeredQueries: number
  unansweredQueries: number
  answerRate: number
  uniqueSessions: number
  averageSimilarity: number | null
}

export interface TopQuestion {
  faqId: string
  question: string
  categoryName: string
  total: number
  share: number
  lastAskedAt: Date
}

export interface UnansweredQuestion {
  question: string
  total: number
  lastAskedAt: Date
}

export interface CategorySlice {
  categoryId: string
  categoryName: string
  total: number
  share: number
}

export interface TimelinePoint {
  isoDate: string
  label: string
  total: number
  answered: number
  unanswered: number
}

export interface DashboardAnalytics {
  period: AnalyticsPeriod
  granularity: TimelineGranularity
  rangeLabel: string
  overview: AnalyticsOverview
  topQuestions: TopQuestion[]
  unansweredQuestions: UnansweredQuestion[]
  categoryDistribution: CategorySlice[]
  timeline: TimelinePoint[]
  isEmpty: boolean
}
