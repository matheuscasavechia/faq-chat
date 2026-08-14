import type { AppConfig } from '../../src/config/env'
import type { Faq } from '../../src/domain/faq/Faq'
import { normalizeQuestion } from '../../src/domain/question/normalizeQuestion'
import type { StubAnalyticsData } from './inMemoryRepositories'

export const buildConfig = (overrides: Partial<AppConfig> = {}): AppConfig => ({
  nodeEnv: 'test',
  isProduction: false,
  port: 3333,
  host: '127.0.0.1',
  databaseUrl: 'postgresql://postgres:postgres@localhost:5432/faq_chatbot_test?schema=public',
  corsOrigins: ['http://localhost:5173'],
  logLevel: 'silent',
  faq: {
    similarityThreshold: 0.35,
    suggestionThreshold: 0.15,
    maxCandidates: 3,
  },
  chatRateLimit: {
    max: 1000,
    windowMs: 60_000,
  },
  ...overrides,
})

const passwordCategory = { id: 'category-password', name: 'Password', slug: 'password' }
const paymentsCategory = { id: 'category-payments', name: 'Payments', slug: 'payments' }

export const buildFaq = (overrides: Partial<Faq> = {}): Faq => {
  const question = overrides.question ?? 'How do I reset my password?'

  return {
    id: overrides.id ?? 'faq-reset-password',
    question,
    normalizedQuestion: overrides.normalizedQuestion ?? normalizeQuestion(question),
    answer: overrides.answer ?? 'Use the Forgot password link on the sign-in screen.',
    category: overrides.category ?? passwordCategory,
  }
}

export const buildFaqCatalog = (): Faq[] => [
  buildFaq(),
  buildFaq({
    id: 'faq-update-card',
    question: 'How do I update my credit card?',
    answer: 'Open Billing then Payment methods and add the new card.',
    category: paymentsCategory,
  }),
  buildFaq({
    id: 'faq-invoices',
    question: 'Where do I find my invoices?',
    answer: 'Billing then Invoices lists every charge with a PDF receipt.',
    category: paymentsCategory,
  }),
]

export const buildAnalyticsData = (
  overrides: Partial<StubAnalyticsData> = {},
): StubAnalyticsData => ({
  totals: {
    totalQueries: 200,
    answeredQueries: 170,
    unansweredQueries: 30,
    uniqueSessions: 48,
    averageSimilarity: 0.82,
  },
  topQuestions: [
    {
      faqId: 'faq-reset-password',
      question: 'How do I reset my password?',
      categoryName: 'Password',
      total: 40,
      lastAskedAt: new Date('2026-08-10T10:00:00.000Z'),
    },
  ],
  unansweredQuestions: [
    {
      normalizedQuestion: 'do you offer a student discount',
      question: 'Do you offer a student discount?',
      total: 7,
      lastAskedAt: new Date('2026-08-09T10:00:00.000Z'),
    },
  ],
  categoryDistribution: [
    {
      categoryId: 'category-password',
      categoryName: 'Password',
      categorySlug: 'password',
      total: 120,
    },
    {
      categoryId: 'category-payments',
      categoryName: 'Payments',
      categorySlug: 'payments',
      total: 50,
    },
  ],
  timeline: [
    {
      bucketStart: new Date('2026-08-09T00:00:00.000Z'),
      total: 12,
      answered: 10,
      unanswered: 2,
    },
    {
      bucketStart: new Date('2026-08-10T00:00:00.000Z'),
      total: 18,
      answered: 15,
      unanswered: 3,
    },
  ],
  earliestInteractionAt: new Date('2026-05-01T00:00:00.000Z'),
  ...overrides,
})
