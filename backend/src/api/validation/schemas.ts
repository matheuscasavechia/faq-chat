import { z } from 'zod'
import { ANALYTICS_PERIODS, DEFAULT_ANALYTICS_PERIOD } from '../../constants/analytics'
import {
  MAX_QUESTION_LENGTH,
  MAX_SESSION_ID_LENGTH,
  MIN_QUESTION_LENGTH,
} from '../../constants/chat'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../constants/pagination'

export const chatQueryBodySchema = z.object({
  question: z
    .string({ required_error: 'question is required' })
    .trim()
    .min(MIN_QUESTION_LENGTH, `question must have at least ${MIN_QUESTION_LENGTH} characters`)
    .max(MAX_QUESTION_LENGTH, `question must have at most ${MAX_QUESTION_LENGTH} characters`),
  sessionId: z.string().trim().min(1).max(MAX_SESSION_ID_LENGTH).optional(),
})

export type ChatQueryBody = z.infer<typeof chatQueryBodySchema>

export const dashboardAnalyticsQuerySchema = z.object({
  period: z.enum(ANALYTICS_PERIODS).default(DEFAULT_ANALYTICS_PERIOD),
})

export type DashboardAnalyticsQuery = z.infer<typeof dashboardAnalyticsQuerySchema>

export const listFaqsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  category: z.string().trim().min(1).max(80).optional(),
  search: z.string().trim().min(2).max(120).optional(),
})

export type ListFaqsQuery = z.infer<typeof listFaqsQuerySchema>
