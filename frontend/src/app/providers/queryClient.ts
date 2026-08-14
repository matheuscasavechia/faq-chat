import { QueryClient } from '@tanstack/react-query'
import { isApiError } from '@/api/ApiError'

const MAX_RETRIES = 2
const RETRY_BASE_DELAY_MS = 500

export const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        retry: (failureCount, error) => {
          if (isApiError(error) && !error.isRetryable) return false
          return failureCount < MAX_RETRIES
        },
        retryDelay: (attemptIndex) => RETRY_BASE_DELAY_MS * 2 ** attemptIndex,
      },
      mutations: {
        retry: false,
      },
    },
  })

export const queryClient = createQueryClient()
