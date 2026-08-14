import { afterEach, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { buildTestApp } from '../support/buildTestApp'
import {
  InMemoryFaqRepository,
  InMemoryInteractionRepository,
} from '../support/inMemoryRepositories'
import { buildFaqCatalog } from '../support/fixtures'

let app: FastifyInstance | undefined

afterEach(async () => {
  await app?.close()
  app = undefined
})

describe('POST /api/v1/chat/query', () => {
  it('returns the registered answer for a known question', async () => {
    const context = await buildTestApp()
    app = context.app

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/chat/query',
      payload: { question: 'How do I reset my password?', sessionId: 'session-1' },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json<{
      data: { answered: boolean; answer: string; matchedFaq: { question: string } | null }
    }>()
    expect(body.data.answered).toBe(true)
    expect(body.data.matchedFaq?.question).toBe('How do I reset my password?')
  })

  it('returns a successful fallback response for an unanswered question', async () => {
    const faqRepository = new InMemoryFaqRepository(buildFaqCatalog())
    faqRepository.forceSimilarity('faq-reset-password', 0.05)
    faqRepository.forceSimilarity('faq-update-card', 0.04)
    faqRepository.forceSimilarity('faq-invoices', 0.03)

    const context = await buildTestApp({ repositories: { faq: faqRepository } })
    app = context.app

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/chat/query',
      payload: { question: 'do you deliver to antarctica by drone' },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json<{ data: { answered: boolean; matchedFaq: null } }>()
    expect(body.data.answered).toBe(false)
    expect(body.data.matchedFaq).toBeNull()
  })

  it('persists an interaction for every question', async () => {
    const interactionRepository = new InMemoryInteractionRepository()
    const context = await buildTestApp({ repositories: { interaction: interactionRepository } })
    app = context.app

    await app.inject({
      method: 'POST',
      url: '/api/v1/chat/query',
      payload: { question: 'How do I reset my password?' },
    })

    expect(interactionRepository.created).toHaveLength(1)
  })

  it('rejects a blank question with a normalized validation error', async () => {
    const context = await buildTestApp()
    app = context.app

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/chat/query',
      payload: { question: '  ' },
    })

    expect(response.statusCode).toBe(400)
    const body = response.json<{
      error: { code: string; details: Array<{ field: string }>; requestId: string }
    }>()
    expect(body.error.code).toBe('VALIDATION_ERROR')
    expect(body.error.details[0]?.field).toBe('question')
    expect(body.error.requestId).toBeTruthy()
  })

  it('rejects a question without searchable content as a domain rule violation', async () => {
    const context = await buildTestApp()
    app = context.app

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/chat/query',
      payload: { question: '???' },
    })

    expect(response.statusCode).toBe(422)
    expect(response.json<{ error: { code: string } }>().error.code).toBe('DOMAIN_RULE_VIOLATION')
  })

  it('rejects a question longer than the accepted limit', async () => {
    const context = await buildTestApp()
    app = context.app

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/chat/query',
      payload: { question: 'a'.repeat(501) },
    })

    expect(response.statusCode).toBe(400)
  })

  it('applies rate limiting to the chat endpoint', async () => {
    const context = await buildTestApp({
      config: { chatRateLimit: { max: 2, windowMs: 60_000 } },
    })
    app = context.app

    const send = () =>
      app!.inject({
        method: 'POST',
        url: '/api/v1/chat/query',
        payload: { question: 'How do I reset my password?' },
      })

    await send()
    await send()
    const blocked = await send()

    expect(blocked.statusCode).toBe(429)
    expect(blocked.json<{ error: { code: string } }>().error.code).toBe('RATE_LIMITED')
  })
})
