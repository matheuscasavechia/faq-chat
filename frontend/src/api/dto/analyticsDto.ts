import { z } from 'zod'
import { ANALYTICS_PERIODS } from '@/constants/analytics'

export const dashboardAnalyticsDtoSchema = z.object({
  data: z.object({
    period: z.enum(ANALYTICS_PERIODS),
    range: z.object({ from: z.string(), to: z.string() }),
    granularity: z.enum(['day', 'week', 'month']),
    overview: z.object({
      totalQueries: z.number(),
      answeredQueries: z.number(),
      unansweredQueries: z.number(),
      answerRate: z.number(),
      uniqueSessions: z.number(),
      averageSimilarity: z.number().nullable(),
    }),
    topQuestions: z.array(
      z.object({
        faqId: z.string(),
        question: z.string(),
        categoryName: z.string(),
        total: z.number(),
        share: z.number(),
        lastAskedAt: z.string(),
      }),
    ),
    unansweredQuestions: z.array(
      z.object({
        question: z.string(),
        total: z.number(),
        lastAskedAt: z.string(),
      }),
    ),
    categoryDistribution: z.array(
      z.object({
        categoryId: z.string(),
        categoryName: z.string(),
        categorySlug: z.string(),
        total: z.number(),
        share: z.number(),
      }),
    ),
    timeline: z.array(
      z.object({
        bucketStart: z.string(),
        total: z.number(),
        answered: z.number(),
        unanswered: z.number(),
      }),
    ),
  }),
})

export type DashboardAnalyticsDto = z.infer<typeof dashboardAnalyticsDtoSchema>['data']
