export type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'canceled'
  | 'validation'
  | 'not_found'
  | 'rate_limited'
  | 'server'
  | 'contract'

export interface ApiErrorInput {
  kind: ApiErrorKind
  message: string
  status?: number
  code?: string
  requestId?: string
  details?: unknown
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status: number
  readonly code: string
  readonly requestId?: string
  readonly details?: unknown

  constructor({ kind, message, status = 0, code = 'UNKNOWN', requestId, details }: ApiErrorInput) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
    this.code = code
    this.requestId = requestId
    this.details = details
  }

  get isRetryable(): boolean {
    return this.kind === 'network' || this.kind === 'timeout' || this.kind === 'server'
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError
