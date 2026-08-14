import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { RouteFallback } from '@/components/feedback/RouteFallback'
import { ROUTES } from '@/constants/routes'

const ChatPage = lazy(() => import('@/pages/ChatPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))

const withSuspense = (element: React.JSX.Element): React.JSX.Element => (
  <Suspense fallback={<RouteFallback />}>{element}</Suspense>
)

export const router = createBrowserRouter([
  {
    path: ROUTES.chat,
    element: <AppShell />,
    children: [
      { index: true, element: withSuspense(<ChatPage />) },
      { path: 'dashboard', element: withSuspense(<DashboardPage />) },
      { path: '*', element: <Navigate to={ROUTES.chat} replace /> },
    ],
  },
])
