import { afterEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { ApiError } from '@/api/ApiError'
import { apiClient } from '@/api/client'

const schema = z.object({ data: z.object({ value: z.number() }) })

const mockFetch = (implementation: typeof fetch): void => {
  vi.stubGlobal('fetch', vi.fn(implementation))
}

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('apiClient', () => {
  it('returns validated data on success', async () => {
    mockFetch(() => Promise.resolve(jsonResponse({ data: { value: 7 } })))

    await expect(apiClient.get('/thing', schema)).resolves.toEqual({ data: { value: 7 } })
  })

  it('normalizes the backend error envelope', async () => {
    mockFetch(() =>
      Promise.resolve(
        jsonResponse(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'The query parameters are invalid.',
              requestId: 'req-1',
            },
          },
          400,
        ),
      ),
    )

    const error = await apiClient.get('/thing', schema).catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      kind: 'validation',
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'The query parameters are invalid.',
      requestId: 'req-1',
    })
    expect((error as ApiError).isRetryable).toBe(false)
  })

  it('marks server failures as retryable', async () => {
    mockFetch(() => Promise.resolve(jsonResponse({ error: { code: 'X', message: 'boom' } }, 500)))

    const error = (await apiClient
      .get('/thing', schema)
      .catch((caught: unknown) => caught)) as ApiError

    expect(error.kind).toBe('server')
    expect(error.isRetryable).toBe(true)
  })

  it('reports a network failure with a friendly message', async () => {
    mockFetch(() => Promise.reject(new TypeError('Failed to fetch')))

    const error = (await apiClient
      .get('/thing', schema)
      .catch((caught: unknown) => caught)) as ApiError

    expect(error.kind).toBe('network')
    expect(error.message).toContain('could not be reached')
  })

  it('fails loudly when the response does not match the contract', async () => {
    mockFetch(() => Promise.resolve(jsonResponse({ data: { value: 'not-a-number' } })))

    const error = (await apiClient
      .get('/thing', schema)
      .catch((caught: unknown) => caught)) as ApiError

    expect(error.kind).toBe('contract')
    expect(error.code).toBe('INVALID_RESPONSE')
  })

  it('serialises the body and appends query parameters', async () => {
    const fetchSpy = vi.fn<typeof fetch>(() =>
      Promise.resolve(jsonResponse({ data: { value: 1 } })),
    )
    vi.stubGlobal('fetch', fetchSpy)

    await apiClient.post('/chat/query', { question: 'hi' }, schema, { query: { period: '7d' } })

    const [requestUrl, requestInit] = fetchSpy.mock.calls[0] ?? []
    expect(typeof requestUrl === 'string' && requestUrl.includes('period=7d')).toBe(true)
    expect(requestInit?.body).toBe(JSON.stringify({ question: 'hi' }))
  })
})
