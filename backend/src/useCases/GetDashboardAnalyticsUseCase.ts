import {
  TOP_QUESTIONS_LIMIT,
  UNANSWERED_QUESTIONS_LIMIT,
  type AnalyticsPeriod,
} from '../constants/analytics'
import {
  resolveAnalyticsPeriodRange,
  type TimelineGranularity,
} from '../domain/analytics/AnalyticsPeriodRange'
import { calculateAnswerRate, calculateShare } from '../domain/analytics/metrics'
import type { AnalyticsRepository } from '../repositories/AnalyticsRepository'

export interface DashboardAnalyticsInput {
  period: AnalyticsPeriod
  now?: Date
}

export interface DashboardOverview {
  totalQueries: number
  answeredQueries: number
  unansweredQueries: number
  answerRate: number
  uniqueSessions: number
  averageSimilarity: number | null
}

export interface DashboardTopQuestion {
  faqId: string
  question: string
  categoryName: string
  total: number
  share: number
  lastAskedAt: Date
}

export interface DashboardUnansweredQuestion {
  question: string
  total: number
  lastAskedAt: Date
}

export interface DashboardCategorySlice {
  categoryId: string
  categoryName: string
  categorySlug: string
  total: number
  share: number
}

export interface DashboardTimelinePoint {
  bucketStart: Date
  total: number
  answered: number
  unanswered: number
}

export interface DashboardAnalyticsOutput {
  period: AnalyticsPeriod
  range: { from: Date; to: Date }
  granularity: TimelineGranularity
  overview: DashboardOverview
  topQuestions: DashboardTopQuestion[]
  unansweredQuestions: DashboardUnansweredQuestion[]
  categoryDistribution: DashboardCategorySlice[]
  timeline: DashboardTimelinePoint[]
}

export class GetDashboardAnalyticsUseCase {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async execute({
    period,
    now = new Date(),
  }: DashboardAnalyticsInput): Promise<DashboardAnalyticsOutput> {
    const earliestInteractionAt =
      period === 'all' ? await this.analyticsRepository.getEarliestInteractionDate() : null

    const range = resolveAnalyticsPeriodRange({ period, now, earliestInteractionAt })
    const window = { from: range.from, to: range.to }

    const [totals, topQuestions, unansweredQuestions, categoryDistribution, timeline] =
      await Promise.all([
        this.analyticsRepository.getInteractionTotals(window),
        this.analyticsRepository.getTopQuestions(window, TOP_QUESTIONS_LIMIT),
        this.analyticsRepository.getUnansweredQuestions(window, UNANSWERED_QUESTIONS_LIMIT),
        this.analyticsRepository.getCategoryDistribution(window),
        this.analyticsRepository.getTimeline(window, range.granularity),
      ])

    const categorizedTotal = categoryDistribution.reduce((sum, row) => sum + row.total, 0)

    return {
      period: range.period,
      range: { from: range.from, to: range.to },
      granularity: range.granularity,
      overview: {
        totalQueries: totals.totalQueries,
        answeredQueries: totals.answeredQueries,
        unansweredQueries: totals.unansweredQueries,
        answerRate: calculateAnswerRate(totals.totalQueries, totals.answeredQueries),
        uniqueSessions: totals.uniqueSessions,
        averageSimilarity: totals.averageSimilarity,
      },
      topQuestions: topQuestions.map((row) => ({
        faqId: row.faqId,
        question: row.question,
        categoryName: row.categoryName,
        total: row.total,
        share: calculateShare(totals.totalQueries, row.total),
        lastAskedAt: row.lastAskedAt,
      })),
      unansweredQuestions: unansweredQuestions.map((row) => ({
        question: row.question,
        total: row.total,
        lastAskedAt: row.lastAskedAt,
      })),
      categoryDistribution: categoryDistribution.map((row) => ({
        categoryId: row.categoryId,
        categoryName: row.categoryName,
        categorySlug: row.categorySlug,
        total: row.total,
        share: calculateShare(categorizedTotal, row.total),
      })),
      timeline,
    }
  }
}
