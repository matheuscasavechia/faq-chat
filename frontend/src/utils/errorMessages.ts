import { isApiError } from '@/api/ApiError'

const MESSAGE_BY_KIND: Record<string, string> = {
  network: 'We could not reach the assistant. Check your connection and try again.',
  timeout: 'The assistant took too long to answer. Please try again.',
  rate_limited: 'You sent a lot of questions in a short time. Wait a moment and try again.',
  server: 'Something went wrong on our side. Please try again in a moment.',
  contract: 'We received an unexpected response from the server.',
}

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.'

export const toUserFacingMessage = (error: unknown): string => {
  if (!isApiError(error)) return FALLBACK_MESSAGE

  if (error.kind === 'validation') return error.message

  return MESSAGE_BY_KIND[error.kind] ?? FALLBACK_MESSAGE
}
