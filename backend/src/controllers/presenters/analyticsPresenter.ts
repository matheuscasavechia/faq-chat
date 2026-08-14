import type { AnalyticsPeriod } from '../../constants/analytics'
import type { TimelineGranularity } from '../../domain/analytics/AnalyticsPeriodRange'
import type { DashboardAnalyticsOutput } from '../../useCases/GetDashboardAnalyticsUseCase'

export interface DashboardAnalyticsResponse {
  period: AnalyticsPeriod
  range: { from: string; to: string }
  granularity: TimelineGranularity
  overview: {
    totalQueries: number
    answeredQueries: number
    unansweredQueries: number
    answerRate: number
    uniqueSessions: number
    averageSimilarity: number | null
  }
  topQuestions: Array<{
    faqId: string
    question: string
    categoryName: string
    total: number
    share: number
    lastAskedAt: string
  }>
  unansweredQuestions: Array<{
    question: string
    total: number
    lastAskedAt: string
  }>
  categoryDistribution: Array<{
    categoryId: string
    categoryName: string
    categorySlug: string
    total: number
    share: number
  }>
  timeline: Array<{
    bucketStart: string
    total: number
    answered: number
    unanswered: number
  }>
}

export const toDashboardAnalyticsResponse = (
  output: DashboardAnalyticsOutput,
): DashboardAnalyticsResponse => ({
  period: output.period,
  range: {
    from: output.range.from.toISOString(),
    to: output.range.to.toISOString(),
  },
  granularity: output.granularity,
  overview: output.overview,
  topQuestions: output.topQuestions.map((question) => ({
    ...question,
    lastAskedAt: question.lastAskedAt.toISOString(),
  })),
  unansweredQuestions: output.unansweredQuestions.map((question) => ({
    ...question,
    lastAskedAt: question.lastAskedAt.toISOString(),
  })),
  categoryDistribution: output.categoryDistribution,
  timeline: output.timeline.map((point) => ({
    ...point,
    bucketStart: point.bucketStart.toISOString(),
  })),
})
