import { useAtom } from 'jotai'
import { useCallback } from 'react'
import type { AnalyticsPeriod } from '@/constants/analytics'
import { analyticsPeriodAtom } from '@/states/analyticsPeriodAtom'

export interface AnalyticsPeriodState {
  period: AnalyticsPeriod
  selectPeriod: (period: AnalyticsPeriod) => void
}

export const useAnalyticsPeriod = (): AnalyticsPeriodState => {
  const [period, setPeriod] = useAtom(analyticsPeriodAtom)

  const selectPeriod = useCallback(
    (next: AnalyticsPeriod) => {
      setPeriod(next)
    },
    [setPeriod],
  )

  return { period, selectPeriod }
}
