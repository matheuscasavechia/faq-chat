import type { DashboardAnalytics } from '@/types/analytics'
import type { CategoryOption, FaqCollection } from '@/types/catalog'
import type { ChatAnswer } from '@/types/chat'

export const buildAnsweredChatAnswer = (overrides: Partial<ChatAnswer> = {}): ChatAnswer => ({
  interactionId: 'interaction-1',
  answered: true,
  answer: 'Use the Forgot password link on the sign-in screen.',
  matchedQuestion: 'How do I reset my password?',
  categoryName: 'Password',
  confidence: 0.92,
  suggestions: [],
  createdAt: new Date('2026-08-11T12:00:00.000Z'),
  ...overrides,
})

export const buildUnansweredChatAnswer = (overrides: Partial<ChatAnswer> = {}): ChatAnswer => ({
  interactionId: 'interaction-2',
  answered: false,
  answer: 'I could not find a registered answer for that yet.',
  matchedQuestion: null,
  categoryName: null,
  confidence: 0.11,
  suggestions: [{ faqId: 'faq-1', question: 'How do I reset my password?' }],
  createdAt: new Date('2026-08-11T12:05:00.000Z'),
  ...overrides,
})

export const buildDashboardAnalytics = (
  overrides: Partial<DashboardAnalytics> = {},
): DashboardAnalytics => ({
  period: '30d',
  granularity: 'day',
  rangeLabel: 'Last 30 days',
  overview: {
    totalQueries: 420,
    answeredQueries: 357,
    unansweredQueries: 63,
    answerRate: 0.85,
    uniqueSessions: 88,
    averageSimilarity: 0.79,
  },
  topQuestions: [
    {
      faqId: 'faq-1',
      question: 'How do I reset my password?',
      categoryName: 'Password',
      total: 64,
      share: 0.152,
      lastAskedAt: new Date('2026-08-11T09:00:00.000Z'),
    },
  ],
  unansweredQuestions: [
    {
      question: 'Do you offer a student discount?',
      total: 12,
      lastAskedAt: new Date('2026-08-10T09:00:00.000Z'),
    },
  ],
  categoryDistribution: [
    { categoryId: 'cat-1', categoryName: 'Password', total: 120, share: 0.336 },
    { categoryId: 'cat-2', categoryName: 'Payments', total: 96, share: 0.269 },
  ],
  timeline: [
    {
      isoDate: '2026-08-10T00:00:00.000Z',
      label: '10 Aug',
      total: 18,
      answered: 15,
      unanswered: 3,
    },
    {
      isoDate: '2026-08-11T00:00:00.000Z',
      label: '11 Aug',
      total: 22,
      answered: 20,
      unanswered: 2,
    },
  ],
  isEmpty: false,
  ...overrides,
})

export const buildFaqCollection = (): FaqCollection => ({
  items: [
    {
      id: 'faq-1',
      question: 'How do I reset my password?',
      answer: 'Use the Forgot password link on the sign-in screen.',
      categoryName: 'Password',
      categorySlug: 'password',
    },
    {
      id: 'faq-2',
      question: 'Which payment methods do you accept?',
      answer: 'We accept Visa, Mastercard and bank transfer.',
      categoryName: 'Payments',
      categorySlug: 'payments',
    },
    {
      id: 'faq-3',
      question: 'How long does delivery take?',
      answer: 'Standard delivery takes 3 to 7 business days.',
      categoryName: 'Delivery',
      categorySlug: 'delivery',
    },
  ],
  page: 1,
  totalPages: 10,
  total: 40,
})

export const buildCategoryOptions = (): CategoryOption[] => [
  { id: 'cat-1', name: 'Password', slug: 'password', faqCount: 5 },
  { id: 'cat-2', name: 'Delivery', slug: 'delivery', faqCount: 4 },
]
