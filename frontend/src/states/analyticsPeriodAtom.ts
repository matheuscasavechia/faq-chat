import { atomWithStorage } from 'jotai/utils'
import { DEFAULT_ANALYTICS_PERIOD, type AnalyticsPeriod } from '@/constants/analytics'

export const analyticsPeriodAtom = atomWithStorage<AnalyticsPeriod>(
  'atlas-helpdesk:analytics-period',
  DEFAULT_ANALYTICS_PERIOD,
)
