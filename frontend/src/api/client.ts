import { z } from 'zod'
import { API_BASE_URL, API_TIMEOUT_MS } from '@/constants/api'
import { ApiError, type ApiErrorKind } from './ApiError'

const errorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string().optional(),
    details: z.unknown().optional(),
  }),
})

const KIND_BY_STATUS: Record<number, ApiErrorKind> = {
  400: 'validation',
  404: 'not_found',
  422: 'validation',
  429: 'rate_limited',
}

const kindForStatus = (status: number): ApiErrorKind =>
  KIND_BY_STATUS[status] ?? (status >= 500 ? 'server' : 'validation')

export interface RequestOptions {
  signal?: AbortSignal
  query?: Record<string, string | number | undefined>
}

const buildUrl = (path: string, query: RequestOptions['query']): string => {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin)

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value))
  })

  return url.toString()
}

const linkAbortSignals = (
  externalSignal: AbortSignal | undefined,
): { signal: AbortSignal; dispose: () => void } => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort(new DOMException('Request timed out', 'TimeoutError'))
  }, API_TIMEOUT_MS)

  const forwardAbort = (): void => {
    controller.abort(externalSignal?.reason)
  }

  if (externalSignal) {
    if (externalSignal.aborted) forwardAbort()
    else externalSignal.addEventListener('abort', forwardAbort, { once: true })
  }

  return {
    signal: controller.signal,
    dispose: () => {
      clearTimeout(timeoutId)
      externalSignal?.removeEventListener('abort', forwardAbort)
    },
  }
}

const toApiError = (error: unknown, externalSignal: AbortSignal | undefined): ApiError => {
  if (error instanceof ApiError) return error

  if (error instanceof DOMException && error.name === 'TimeoutError') {
    return new ApiError({ kind: 'timeout', message: 'The request took too long to complete.' })
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return new ApiError({
      kind: externalSignal?.aborted ? 'canceled' : 'timeout',
      message: externalSignal?.aborted
        ? 'The request was canceled.'
        : 'The request took too long to complete.',
    })
  }

  return new ApiError({
    kind: 'network',
    message: 'The server could not be reached. Check your connection and try again.',
  })
}

const parseErrorResponse = async (response: Response): Promise<never> => {
  const kind = kindForStatus(response.status)
  const fallback = new ApiError({
    kind,
    status: response.status,
    message: 'The request failed. Please try again.',
  })

  try {
    const payload: unknown = await response.json()
    const parsed = errorEnvelopeSchema.safeParse(payload)

    if (!parsed.success) throw fallback

    throw new ApiError({
      kind,
      status: response.status,
      code: parsed.data.error.code,
      message: parsed.data.error.message,
      ...(parsed.data.error.requestId ? { requestId: parsed.data.error.requestId } : {}),
      details: parsed.data.error.details,
    })
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw fallback
  }
}

const request = async <TData>(
  path: string,
  init: RequestInit,
  schema: z.ZodType<TData>,
  options: RequestOptions,
): Promise<TData> => {
  const { signal, dispose } = linkAbortSignals(options.signal)

  try {
    const response = await fetch(buildUrl(path, options.query), {
      ...init,
      signal,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    })

    if (!response.ok) await parseErrorResponse(response)

    const payload: unknown = await response.json()
    const parsed = schema.safeParse(payload)

    if (!parsed.success) {
      throw new ApiError({
        kind: 'contract',
        status: response.status,
        code: 'INVALID_RESPONSE',
        message: 'The server returned data in an unexpected format.',
        details: parsed.error.issues,
      })
    }

    return parsed.data
  } catch (error) {
    throw toApiError(error, options.signal)
  } finally {
    dispose()
  }
}

export const apiClient = {
  get: <TData>(
    path: string,
    schema: z.ZodType<TData>,
    options: RequestOptions = {},
  ): Promise<TData> => request(path, { method: 'GET' }, schema, options),

  post: <TData>(
    path: string,
    body: unknown,
    schema: z.ZodType<TData>,
    options: RequestOptions = {},
  ): Promise<TData> =>
    request(path, { method: 'POST', body: JSON.stringify(body) }, schema, options),
}
