import { PrismaClient } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { buildApp } from '../../src/app'
import { createControllers } from '../../src/composition/createControllers'
import { createPrismaRepositories } from '../../src/composition/createRepositories'
import { normalizeQuestion } from '../../src/domain/question/normalizeQuestion'
import { PrismaAnalyticsRepository } from '../../src/infrastructure/repositories/PrismaAnalyticsRepository'
import { buildConfig } from '../support/fixtures'

const databaseUrl = process.env.TEST_DATABASE_URL

const describeWithDatabase = databaseUrl ? describe : describe.skip

describeWithDatabase('PostgreSQL backed behaviour', () => {
  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl ?? '' } } })
  const config = buildConfig({ databaseUrl: databaseUrl ?? '' })
  let app: FastifyInstance
  let passwordFaqId: string
  let deliveryFaqId: string
  let passwordCategoryId: string

  const resetDatabase = async (): Promise<void> => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "interactions", "faqs", "categories" RESTART IDENTITY CASCADE',
    )
  }

  const seedCatalog = async (): Promise<void> => {
    const password = await prisma.category.create({
      data: { name: 'Password', slug: 'password' },
      select: { id: true },
    })
    const delivery = await prisma.category.create({
      data: { name: 'Delivery', slug: 'delivery' },
      select: { id: true },
    })
    passwordCategoryId = password.id

    const passwordFaq = await prisma.faq.create({
      data: {
        question: 'How do I reset my password?',
        normalizedQuestion: normalizeQuestion('How do I reset my password?'),
        answer: 'Use the Forgot password link on the sign-in screen.',
        categoryId: password.id,
      },
      select: { id: true },
    })
    const deliveryFaq = await prisma.faq.create({
      data: {
        question: 'How long does delivery take?',
        normalizedQuestion: normalizeQuestion('How long does delivery take?'),
        answer: 'Standard delivery takes 3 to 7 business days.',
        categoryId: delivery.id,
      },
      select: { id: true },
    })
    await prisma.faq.create({
      data: {
        question: 'Which payment methods do you accept?',
        normalizedQuestion: normalizeQuestion('Which payment methods do you accept?'),
        answer: 'We accept Visa, Mastercard and bank transfer.',
        categoryId: delivery.id,
      },
    })

    passwordFaqId = passwordFaq.id
    deliveryFaqId = deliveryFaq.id
  }

  beforeAll(async () => {
    const repositories = createPrismaRepositories(prisma)
    const controllers = createControllers({ config, repositories })
    app = await buildApp({ config, controllers, logger: false })
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    await resetDatabase()
    await seedCatalog()
  })

  it('enables the pg_trgm extension and indexes the normalized question', async () => {
    const extensions = await prisma.$queryRaw<Array<{ extname: string }>>`
      SELECT extname FROM pg_extension WHERE extname = 'pg_trgm'
    `
    const indexes = await prisma.$queryRaw<Array<{ indexdef: string }>>`
      SELECT indexdef FROM pg_indexes WHERE indexname = 'faqs_normalized_question_trgm_idx'
    `

    expect(extensions).toHaveLength(1)
    expect(indexes[0]?.indexdef).toContain('gist_trgm_ops')
  })

  it('answers an exact question and stores the interaction', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/chat/query',
      payload: { question: 'How do I reset my password?', sessionId: 'db-session' },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json<{ data: { answered: boolean; similarity: number } }>()
    expect(body.data.answered).toBe(true)
    expect(body.data.similarity).toBe(1)

    const stored = await prisma.interaction.findFirst({ orderBy: { createdAt: 'desc' } })
    expect(stored).toMatchObject({
      matchedFaqId: passwordFaqId,
      answered: true,
      categoryId: passwordCategoryId,
      sessionId: 'db-session',
    })
  })

  it('finds the right FAQ from a differently worded question using trigram similarity', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/chat/query',
      payload: { question: 'i need to reset my password please' },
    })

    const body = response.json<{
      data: { answered: boolean; matchStrategy: string; matchedFaq: { id: string } | null }
    }>()

    expect(body.data.answered).toBe(true)
    expect(body.data.matchStrategy).toBe('similarity')
    expect(body.data.matchedFaq?.id).toBe(passwordFaqId)
  })

  it('marks a question with no similar FAQ as unanswered', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/chat/query',
      payload: { question: 'Do you support single sign on with Okta?' },
    })

    const body = response.json<{ data: { answered: boolean; matchedFaq: null } }>()
    expect(response.statusCode).toBe(200)
    expect(body.data.answered).toBe(false)

    const stored = await prisma.interaction.findFirst({ orderBy: { createdAt: 'desc' } })
    expect(stored?.answered).toBe(false)
    expect(stored?.matchedFaqId).toBeNull()
  })

  it('orders similarity candidates by trigram distance using the index', async () => {
    const repositories = createPrismaRepositories(prisma)
    const candidates = await repositories.faq.findMostSimilar(
      normalizeQuestion('how do i reset the password'),
      { limit: 3 },
    )

    expect(candidates[0]?.faq.id).toBe(passwordFaqId)
    expect(candidates[0]?.similarity).toBeGreaterThan(0.35)
    expect(candidates.at(-1)?.similarity).toBeLessThan(candidates[0]?.similarity ?? 0)

    const plan = await prisma.$queryRaw<Array<{ 'QUERY PLAN': string }>>`
      EXPLAIN (COSTS OFF)
      SELECT f.id FROM faqs f
      WHERE f.active = true
      ORDER BY f.normalized_question <-> 'how do i reset the password'
      LIMIT 3
    `
    const planText = plan.map((row) => row['QUERY PLAN']).join('\n')
    expect(planText).toContain('faqs_normalized_question_trgm_idx')
  })

  it('aggregates the dashboard from persisted interactions', async () => {
    const now = new Date()
    const hoursAgo = (hours: number): Date => new Date(now.getTime() - hours * 60 * 60 * 1000)

    await prisma.interaction.createMany({
      data: [
        {
          question: 'How do I reset my password?',
          normalizedQuestion: normalizeQuestion('How do I reset my password?'),
          matchedFaqId: passwordFaqId,
          similarityScore: '1.0000',
          answered: true,
          categoryId: passwordCategoryId,
          sessionId: 'session-a',
          createdAt: hoursAgo(2),
        },
        {
          question: 'reset password now',
          normalizedQuestion: normalizeQuestion('reset password now'),
          matchedFaqId: passwordFaqId,
          similarityScore: '0.6000',
          answered: true,
          categoryId: passwordCategoryId,
          sessionId: 'session-a',
          createdAt: hoursAgo(3),
        },
        {
          question: 'How long does delivery take?',
          normalizedQuestion: normalizeQuestion('How long does delivery take?'),
          matchedFaqId: deliveryFaqId,
          similarityScore: '1.0000',
          answered: true,
          categoryId: null,
          sessionId: 'session-b',
          createdAt: hoursAgo(4),
        },
        {
          question: 'Do you offer a student discount?',
          normalizedQuestion: normalizeQuestion('Do you offer a student discount?'),
          matchedFaqId: null,
          similarityScore: '0.1000',
          answered: false,
          categoryId: null,
          sessionId: 'session-c',
          createdAt: hoursAgo(5),
        },
      ],
    })

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/analytics/dashboard?period=7d',
    })

    expect(response.statusCode).toBe(200)
    const body = response.json<{
      data: {
        overview: {
          totalQueries: number
          answeredQueries: number
          unansweredQueries: number
          answerRate: number
          uniqueSessions: number
        }
        topQuestions: Array<{ faqId: string; total: number }>
        unansweredQuestions: Array<{ question: string; total: number }>
        categoryDistribution: Array<{ categorySlug: string; total: number }>
        timeline: Array<{ bucketStart: string; total: number }>
      }
    }>()

    expect(body.data.overview).toMatchObject({
      totalQueries: 4,
      answeredQueries: 3,
      unansweredQueries: 1,
      answerRate: 0.75,
      uniqueSessions: 3,
    })
    expect(body.data.topQuestions[0]).toMatchObject({ faqId: passwordFaqId, total: 2 })
    expect(body.data.unansweredQuestions[0]).toMatchObject({
      question: 'Do you offer a student discount?',
      total: 1,
    })
    expect(body.data.categoryDistribution).toEqual([
      expect.objectContaining({ categorySlug: 'password', total: 2 }),
    ])
    expect(body.data.timeline).toHaveLength(7)
    expect(body.data.timeline.reduce((sum, point) => sum + point.total, 0)).toBe(4)
  })

  it('fills timeline gaps with zeroed buckets', async () => {
    const analytics = new PrismaAnalyticsRepository(prisma)
    const to = new Date('2026-08-11T23:59:59.000Z')
    const from = new Date('2026-08-05T00:00:00.000Z')

    await prisma.interaction.create({
      data: {
        question: 'How do I reset my password?',
        normalizedQuestion: normalizeQuestion('How do I reset my password?'),
        matchedFaqId: passwordFaqId,
        similarityScore: '1.0000',
        answered: true,
        categoryId: passwordCategoryId,
        createdAt: new Date('2026-08-07T10:00:00.000Z'),
      },
    })

    const timeline = await analytics.getTimeline({ from, to }, 'day')

    expect(timeline).toHaveLength(7)
    expect(timeline[0]?.bucketStart.toISOString()).toBe('2026-08-05T00:00:00.000Z')
    expect(timeline[2]).toMatchObject({ total: 1, answered: 1, unanswered: 0 })
    expect(timeline[3]).toMatchObject({ total: 0, answered: 0, unanswered: 0 })
  })

  it('rejects an interaction flagged as answered without a matched FAQ', async () => {
    await expect(
      prisma.interaction.create({
        data: {
          question: 'invalid interaction',
          normalizedQuestion: 'invalid interaction',
          answered: true,
          matchedFaqId: null,
        },
      }),
    ).rejects.toThrow()
  })
})
