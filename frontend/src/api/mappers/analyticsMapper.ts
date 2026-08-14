import { ANALYTICS_PERIOD_LABELS } from '@/constants/analytics'
import type { DashboardAnalytics, TimelineGranularity, TimelinePoint } from '@/types/analytics'
import type { DashboardAnalyticsDto } from '../dto/analyticsDto'

const dayFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'short',
  timeZone: 'UTC',
})
const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: '2-digit',
  timeZone: 'UTC',
})

const formatBucketLabel = (isoDate: string, granularity: TimelineGranularity): string => {
  const date = new Date(isoDate)

  if (granularity === 'month') return monthFormatter.format(date)
  if (granularity === 'week') return `week of ${dayFormatter.format(date)}`

  return dayFormatter.format(date)
}

const toTimeline = (
  points: DashboardAnalyticsDto['timeline'],
  granularity: TimelineGranularity,
): TimelinePoint[] =>
  points.map((point) => ({
    isoDate: point.bucketStart,
    label: formatBucketLabel(point.bucketStart, granularity),
    total: point.total,
    answered: point.answered,
    unanswered: point.unanswered,
  }))

export const toDashboardAnalytics = (dto: DashboardAnalyticsDto): DashboardAnalytics => ({
  period: dto.period,
  granularity: dto.granularity,
  rangeLabel: ANALYTICS_PERIOD_LABELS[dto.period],
  overview: dto.overview,
  topQuestions: dto.topQuestions.map((question) => ({
    faqId: question.faqId,
    question: question.question,
    categoryName: question.categoryName,
    total: question.total,
    share: question.share,
    lastAskedAt: new Date(question.lastAskedAt),
  })),
  unansweredQuestions: dto.unansweredQuestions.map((question) => ({
    question: question.question,
    total: question.total,
    lastAskedAt: new Date(question.lastAskedAt),
  })),
  categoryDistribution: dto.categoryDistribution.map((slice) => ({
    categoryId: slice.categoryId,
    categoryName: slice.categoryName,
    total: slice.total,
    share: slice.share,
  })),
  timeline: toTimeline(dto.timeline, dto.granularity),
  isEmpty: dto.overview.totalQueries === 0,
})
