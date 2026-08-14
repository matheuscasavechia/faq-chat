export const ANALYTICS_PERIODS = ['7d', '30d', '90d', 'all'] as const

export type AnalyticsPeriod = (typeof ANALYTICS_PERIODS)[number]

export const DEFAULT_ANALYTICS_PERIOD: AnalyticsPeriod = '30d'

export const ANALYTICS_PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  all: 'All time',
}

export const ANALYTICS_PERIOD_SHORT_LABELS: Record<AnalyticsPeriod, string> = {
  '7d': '7d',
  '30d': '30d',
  '90d': '90d',
  all: 'All',
}
