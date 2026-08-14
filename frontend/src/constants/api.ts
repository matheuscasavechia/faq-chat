const DEFAULT_BASE_URL = 'http://localhost:3333/api/v1'
const DEFAULT_TIMEOUT_MS = 15_000

const withoutTrailingSlash = (value: string): string => value.replace(/\/+$/, '')

const parsedTimeout = Number(import.meta.env.VITE_API_TIMEOUT_MS)

export const API_BASE_URL = withoutTrailingSlash(
  import.meta.env.VITE_API_BASE_URL ?? DEFAULT_BASE_URL,
)

export const API_TIMEOUT_MS =
  Number.isFinite(parsedTimeout) && parsedTimeout > 0 ? parsedTimeout : DEFAULT_TIMEOUT_MS

export const API_ENDPOINTS = {
  chatQuery: '/chat/query',
  dashboardAnalytics: '/analytics/dashboard',
  faqs: '/faqs',
  categories: '/categories',
  health: '/health',
} as const
