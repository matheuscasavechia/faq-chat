export const ANALYTICS_PERIODS = ['7d', '30d', '90d', 'all'] as const

export type AnalyticsPeriod = (typeof ANALYTICS_PERIODS)[number]

export const DEFAULT_ANALYTICS_PERIOD: AnalyticsPeriod = '30d'

export const ANALYTICS_PERIOD_DAYS: Record<Exclude<AnalyticsPeriod, 'all'>, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
}

export const ALL_TIME_MINIMUM_WINDOW_DAYS = 30

export const TOP_QUESTIONS_LIMIT = 8
export const UNANSWERED_QUESTIONS_LIMIT = 8
