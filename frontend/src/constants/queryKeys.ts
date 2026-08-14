import type { AnalyticsPeriod } from './analytics'

export const QUERY_KEYS = {
  analytics: {
    all: ['analytics'] as const,
    dashboard: (period: AnalyticsPeriod) => ['analytics', 'dashboard', period] as const,
  },
  faqs: {
    all: ['faqs'] as const,
    list: (params: { page: number; pageSize: number; category?: string }) =>
      ['faqs', 'list', params] as const,
  },
  categories: {
    all: ['categories'] as const,
  },
} as const
