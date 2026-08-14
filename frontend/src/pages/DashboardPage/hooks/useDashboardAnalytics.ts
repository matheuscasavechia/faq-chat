import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { fetchDashboardAnalytics } from '@/api/analytics'
import { useAnalyticsPeriod } from '@/components/dashboard/PeriodFilter'
import { QUERY_KEYS } from '@/constants/queryKeys'
import type { DashboardAnalytics } from '@/types/analytics'
import { toUserFacingMessage } from '@/utils/errorMessages'
import { formatTime } from '@/utils/formatters'
import {
  toKpis,
  toRankedQuestions,
  toRankedUnansweredQuestions,
} from '../mappers/dashboardViewModel'
import type { DashboardViewModel } from '../types'

const EMPTY_ANALYTICS: Pick<
  DashboardAnalytics,
  'timeline' | 'categoryDistribution' | 'topQuestions' | 'unansweredQuestions'
> = {
  timeline: [],
  categoryDistribution: [],
  topQuestions: [],
  unansweredQuestions: [],
}

export const useDashboardAnalytics = (): DashboardViewModel => {
  const { period } = useAnalyticsPeriod()

  const query = useQuery({
    queryKey: QUERY_KEYS.analytics.dashboard(period),
    queryFn: ({ signal }) => fetchDashboardAnalytics(period, signal),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  })

  const { data, isPending, isFetching, isPlaceholderData, error, dataUpdatedAt } = query

  const kpis = useMemo(() => toKpis(data?.overview ?? null), [data?.overview])

  const topQuestions = useMemo(
    () => toRankedQuestions(data?.topQuestions ?? EMPTY_ANALYTICS.topQuestions),
    [data?.topQuestions],
  )

  const unansweredQuestions = useMemo(
    () =>
      toRankedUnansweredQuestions(
        data?.unansweredQuestions ?? EMPTY_ANALYTICS.unansweredQuestions,
        data?.overview.unansweredQueries ?? 0,
      ),
    [data?.unansweredQuestions, data?.overview.unansweredQueries],
  )

  const onRetry = useCallback(() => {
    void query.refetch()
  }, [query])

  return {
    period,
    rangeLabel: data?.rangeLabel ?? '',
    isInitialLoading: isPending,
    isRefreshing: (isFetching && !isPending) || isPlaceholderData,
    hasData: data !== undefined,
    isEmpty: data?.isEmpty ?? false,
    errorMessage: error ? toUserFacingMessage(error) : null,
    lastUpdatedLabel: data && dataUpdatedAt ? formatTime(new Date(dataUpdatedAt)) : null,
    kpis,
    timeline: data?.timeline ?? EMPTY_ANALYTICS.timeline,
    categoryDistribution: data?.categoryDistribution ?? EMPTY_ANALYTICS.categoryDistribution,
    topQuestions,
    unansweredQuestions,
    onRetry,
  }
}
