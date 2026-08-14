import {
  ALL_TIME_MINIMUM_WINDOW_DAYS,
  ANALYTICS_PERIOD_DAYS,
  type AnalyticsPeriod,
} from '../../constants/analytics'

export type TimelineGranularity = 'day' | 'week' | 'month'

export interface AnalyticsPeriodRange {
  period: AnalyticsPeriod
  from: Date
  to: Date
  granularity: TimelineGranularity
}

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

const subtractDays = (reference: Date, days: number): Date =>
  new Date(reference.getTime() - days * MILLISECONDS_PER_DAY)

const granularityFor = (spanInDays: number): TimelineGranularity => {
  if (spanInDays <= 31) return 'day'
  if (spanInDays <= 120) return 'week'
  return 'month'
}

export interface ResolvePeriodRangeInput {
  period: AnalyticsPeriod
  now: Date
  earliestInteractionAt: Date | null
}

export const resolveAnalyticsPeriodRange = ({
  period,
  now,
  earliestInteractionAt,
}: ResolvePeriodRangeInput): AnalyticsPeriodRange => {
  if (period !== 'all') {
    const days = ANALYTICS_PERIOD_DAYS[period]
    return {
      period,
      from: subtractDays(now, days - 1),
      to: now,
      granularity: granularityFor(days),
    }
  }

  const fallbackFrom = subtractDays(now, ALL_TIME_MINIMUM_WINDOW_DAYS - 1)
  const from =
    earliestInteractionAt && earliestInteractionAt < fallbackFrom
      ? earliestInteractionAt
      : fallbackFrom
  const spanInDays = Math.max(1, Math.ceil((now.getTime() - from.getTime()) / MILLISECONDS_PER_DAY))

  return {
    period,
    from,
    to: now,
    granularity: granularityFor(spanInDays),
  }
}
