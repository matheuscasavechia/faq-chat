import type { TimelineGranularity } from '../domain/analytics/AnalyticsPeriodRange'

export interface AnalyticsWindow {
  from: Date
  to: Date
}

export interface InteractionTotals {
  totalQueries: number
  answeredQueries: number
  unansweredQueries: number
  uniqueSessions: number
  averageSimilarity: number | null
}

export interface TopQuestionRow {
  faqId: string
  question: string
  categoryName: string
  total: number
  lastAskedAt: Date
}

export interface UnansweredQuestionRow {
  normalizedQuestion: string
  question: string
  total: number
  lastAskedAt: Date
}

export interface CategoryDistributionRow {
  categoryId: string
  categoryName: string
  categorySlug: string
  total: number
}

export interface TimelineBucketRow {
  bucketStart: Date
  total: number
  answered: number
  unanswered: number
}

export interface AnalyticsRepository {
  getInteractionTotals(window: AnalyticsWindow): Promise<InteractionTotals>
  getTopQuestions(window: AnalyticsWindow, limit: number): Promise<TopQuestionRow[]>
  getUnansweredQuestions(window: AnalyticsWindow, limit: number): Promise<UnansweredQuestionRow[]>
  getCategoryDistribution(window: AnalyticsWindow): Promise<CategoryDistributionRow[]>
  getTimeline(
    window: AnalyticsWindow,
    granularity: TimelineGranularity,
  ): Promise<TimelineBucketRow[]>
  getEarliestInteractionDate(): Promise<Date | null>
}
