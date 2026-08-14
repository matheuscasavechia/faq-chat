export const ROUTES = {
  chat: '/',
  dashboard: '/dashboard',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]

export const NAVIGATION_ITEMS: Array<{ to: AppRoute; label: string; description: string }> = [
  { to: ROUTES.chat, label: 'Assistant', description: 'Ask the knowledge base' },
  { to: ROUTES.dashboard, label: 'Dashboard', description: 'Usage analytics' },
]
