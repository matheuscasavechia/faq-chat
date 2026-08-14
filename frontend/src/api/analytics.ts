import { API_ENDPOINTS } from '@/constants/api'
import type { AnalyticsPeriod } from '@/constants/analytics'
import type { DashboardAnalytics } from '@/types/analytics'
import { apiClient } from './client'
import { dashboardAnalyticsDtoSchema } from './dto/analyticsDto'
import { toDashboardAnalytics } from './mappers/analyticsMapper'

export const fetchDashboardAnalytics = async (
  period: AnalyticsPeriod,
  signal?: AbortSignal,
): Promise<DashboardAnalytics> => {
  const response = await apiClient.get(
    API_ENDPOINTS.dashboardAnalytics,
    dashboardAnalyticsDtoSchema,
    {
      query: { period },
      ...(signal ? { signal } : {}),
    },
  )

  return toDashboardAnalytics(response.data)
}
