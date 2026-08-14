import { describe, expect, it } from 'vitest'
import { toDashboardAnalytics } from '@/api/mappers/analyticsMapper'
import { toChatAnswer } from '@/api/mappers/chatMapper'
import { toCategoryOptions, toFaqCollection } from '@/api/mappers/catalogMapper'
import type { DashboardAnalyticsDto } from '@/api/dto/analyticsDto'
import type { ChatAnswerDto } from '@/api/dto/chatDto'

const chatDto: ChatAnswerDto = {
  interactionId: 'interaction-1',
  question: 'how do i reset my password',
  answered: true,
  answer: 'Use the Forgot password link.',
  similarity: 0.87,
  matchStrategy: 'similarity',
  matchedFaq: {
    id: 'faq-1',
    question: 'How do I reset my password?',
    category: { id: 'cat-1', name: 'Password', slug: 'password' },
  },
  suggestions: [
    { faqId: 'faq-2', question: 'What are the password requirements?', similarity: 0.4 },
  ],
  createdAt: '2026-08-11T12:00:00.000Z',
}

const analyticsDto: DashboardAnalyticsDto = {
  period: '90d',
  range: { from: '2026-05-13T00:00:00.000Z', to: '2026-08-11T00:00:00.000Z' },
  granularity: 'week',
  overview: {
    totalQueries: 100,
    answeredQueries: 80,
    unansweredQueries: 20,
    answerRate: 0.8,
    uniqueSessions: 30,
    averageSimilarity: 0.75,
  },
  topQuestions: [
    {
      faqId: 'faq-1',
      question: 'How do I reset my password?',
      categoryName: 'Password',
      total: 25,
      share: 0.25,
      lastAskedAt: '2026-08-10T12:00:00.000Z',
    },
  ],
  unansweredQuestions: [
    {
      question: 'Do you offer a student discount?',
      total: 5,
      lastAskedAt: '2026-08-09T12:00:00.000Z',
    },
  ],
  categoryDistribution: [
    {
      categoryId: 'cat-1',
      categoryName: 'Password',
      categorySlug: 'password',
      total: 40,
      share: 0.5,
    },
  ],
  timeline: [{ bucketStart: '2026-08-03T00:00:00.000Z', total: 12, answered: 10, unanswered: 2 }],
}

describe('toChatAnswer', () => {
  it('flattens the matched FAQ into UI friendly fields', () => {
    const answer = toChatAnswer(chatDto)

    expect(answer.matchedQuestion).toBe('How do I reset my password?')
    expect(answer.categoryName).toBe('Password')
    expect(answer.confidence).toBe(0.87)
    expect(answer.createdAt).toBeInstanceOf(Date)
    expect(answer.suggestions).toEqual([
      { faqId: 'faq-2', question: 'What are the password requirements?' },
    ])
  })

  it('keeps nullable fields null for an unanswered question', () => {
    const answer = toChatAnswer({
      ...chatDto,
      answered: false,
      matchedFaq: null,
      matchStrategy: null,
      similarity: null,
    })

    expect(answer.answered).toBe(false)
    expect(answer.matchedQuestion).toBeNull()
    expect(answer.categoryName).toBeNull()
    expect(answer.confidence).toBeNull()
  })
})

describe('toDashboardAnalytics', () => {
  it('builds chart ready timeline labels from the granularity', () => {
    const analytics = toDashboardAnalytics(analyticsDto)

    expect(analytics.timeline[0]?.label).toBe('week of Aug 03')
    expect(analytics.timeline[0]?.isoDate).toBe('2026-08-03T00:00:00.000Z')
  })

  it('formats day and month buckets differently', () => {
    expect(toDashboardAnalytics({ ...analyticsDto, granularity: 'day' }).timeline[0]?.label).toBe(
      'Aug 03',
    )
    expect(toDashboardAnalytics({ ...analyticsDto, granularity: 'month' }).timeline[0]?.label).toBe(
      'Aug 26',
    )
  })

  it('exposes a human readable range label and an emptiness flag', () => {
    const analytics = toDashboardAnalytics(analyticsDto)

    expect(analytics.rangeLabel).toBe('Last 90 days')
    expect(analytics.isEmpty).toBe(false)
    expect(
      toDashboardAnalytics({
        ...analyticsDto,
        overview: { ...analyticsDto.overview, totalQueries: 0 },
      }).isEmpty,
    ).toBe(true)
  })

  it('converts timestamps into dates', () => {
    const analytics = toDashboardAnalytics(analyticsDto)

    expect(analytics.topQuestions[0]?.lastAskedAt).toBeInstanceOf(Date)
    expect(analytics.unansweredQuestions[0]?.lastAskedAt).toBeInstanceOf(Date)
  })
})

describe('catalog mappers', () => {
  it('flattens FAQ categories and keeps pagination metadata', () => {
    const collection = toFaqCollection({
      data: [
        {
          id: 'faq-1',
          question: 'How do I reset my password?',
          answer: 'Use the Forgot password link.',
          category: { id: 'cat-1', name: 'Password', slug: 'password' },
        },
      ],
      meta: { pagination: { page: 2, pageSize: 20, total: 41, totalPages: 3 } },
    })

    expect(collection.items[0]?.categoryName).toBe('Password')
    expect(collection.page).toBe(2)
    expect(collection.totalPages).toBe(3)
  })

  it('maps categories with their FAQ counts', () => {
    const options = toCategoryOptions({
      data: [{ id: 'cat-1', name: 'Password', slug: 'password', faqCount: 5 }],
    })

    expect(options).toEqual([{ id: 'cat-1', name: 'Password', slug: 'password', faqCount: 5 }])
  })
})
