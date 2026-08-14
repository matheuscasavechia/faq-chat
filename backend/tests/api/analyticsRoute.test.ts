import { afterEach, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { buildTestApp } from '../support/buildTestApp'
import { StubAnalyticsRepository, StubHealthRepository } from '../support/inMemoryRepositories'
import { buildAnalyticsData } from '../support/fixtures'

let app: FastifyInstance | undefined

afterEach(async () => {
  await app?.close()
  app = undefined
})

describe('GET /api/v1/analytics/dashboard', () => {
  it('returns the whole dashboard payload in a single request', async () => {
    const context = await buildTestApp()
    app = context.app

    const response = await app.inject({ method: 'GET', url: '/api/v1/analytics/dashboard' })

    expect(response.statusCode).toBe(200)
    const body = response.json<{
      data: {
        period: string
        overview: { answerRate: number }
        topQuestions: unknown[]
        unansweredQuestions: unknown[]
        categoryDistribution: unknown[]
        timeline: unknown[]
      }
    }>()

    expect(body.data.period).toBe('30d')
    expect(body.data.overview.answerRate).toBe(0.85)
    expect(body.data.topQuestions).toHaveLength(1)
    expect(body.data.unansweredQuestions).toHaveLength(1)
    expect(body.data.categoryDistribution).toHaveLength(2)
    expect(body.data.timeline).toHaveLength(2)
  })

  it('accepts every supported period', async () => {
    const context = await buildTestApp()
    app = context.app

    for (const period of ['7d', '30d', '90d', 'all']) {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/analytics/dashboard?period=${period}`,
      })
      expect(response.statusCode).toBe(200)
      expect(response.json<{ data: { period: string } }>().data.period).toBe(period)
    }
  })

  it('rejects an unsupported period', async () => {
    const context = await buildTestApp()
    app = context.app

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/analytics/dashboard?period=42d',
    })

    expect(response.statusCode).toBe(400)
    expect(response.json<{ error: { code: string } }>().error.code).toBe('VALIDATION_ERROR')
  })

  it('serialises an empty dashboard without failing', async () => {
    const context = await buildTestApp({
      repositories: {
        analytics: new StubAnalyticsRepository(
          buildAnalyticsData({
            totals: {
              totalQueries: 0,
              answeredQueries: 0,
              unansweredQueries: 0,
              uniqueSessions: 0,
              averageSimilarity: null,
            },
            topQuestions: [],
            unansweredQuestions: [],
            categoryDistribution: [],
            timeline: [],
          }),
        ),
      },
    })
    app = context.app

    const response = await app.inject({ method: 'GET', url: '/api/v1/analytics/dashboard' })

    expect(response.statusCode).toBe(200)
    expect(response.json<{ data: { overview: { answerRate: number } } }>().data.overview).toEqual({
      totalQueries: 0,
      answeredQueries: 0,
      unansweredQueries: 0,
      answerRate: 0,
      uniqueSessions: 0,
      averageSimilarity: null,
    })
  })
})

describe('supporting endpoints', () => {
  it('lists FAQs with pagination metadata', async () => {
    const context = await buildTestApp()
    app = context.app

    const response = await app.inject({ method: 'GET', url: '/api/v1/faqs?page=1&pageSize=2' })

    expect(response.statusCode).toBe(200)
    const body = response.json<{
      data: unknown[]
      meta: { pagination: { total: number; totalPages: number } }
    }>()
    expect(body.data).toHaveLength(2)
    expect(body.meta.pagination).toEqual({ page: 1, pageSize: 2, total: 3, totalPages: 2 })
  })

  it('rejects an invalid page size', async () => {
    const context = await buildTestApp()
    app = context.app

    const response = await app.inject({ method: 'GET', url: '/api/v1/faqs?pageSize=1000' })

    expect(response.statusCode).toBe(400)
  })

  it('lists categories with the number of active FAQs', async () => {
    const context = await buildTestApp()
    app = context.app

    const response = await app.inject({ method: 'GET', url: '/api/v1/categories' })

    expect(response.statusCode).toBe(200)
    expect(response.json<{ data: Array<{ faqCount: number }> }>().data[0]?.faqCount).toBe(5)
  })

  it('reports a healthy service when the database answers', async () => {
    const context = await buildTestApp()
    app = context.app

    const response = await app.inject({ method: 'GET', url: '/api/v1/health' })

    expect(response.statusCode).toBe(200)
    expect(response.json<{ data: { status: string; database: string } }>().data).toMatchObject({
      status: 'ok',
      database: 'up',
    })
  })

  it('reports a degraded service when the database is unreachable', async () => {
    const context = await buildTestApp({
      repositories: { health: new StubHealthRepository(false) },
    })
    app = context.app

    const response = await app.inject({ method: 'GET', url: '/api/v1/health' })

    expect(response.statusCode).toBe(503)
    expect(response.json<{ data: { status: string } }>().data.status).toBe('degraded')
  })

  it('returns a normalized error for an unknown route', async () => {
    const context = await buildTestApp()
    app = context.app

    const response = await app.inject({ method: 'GET', url: '/api/v1/does-not-exist' })

    expect(response.statusCode).toBe(404)
    expect(response.json<{ error: { code: string } }>().error.code).toBe('NOT_FOUND')
  })
})
