import { z } from 'zod'

const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
})

export const chatAnswerDtoSchema = z.object({
  data: z.object({
    interactionId: z.string(),
    question: z.string(),
    answered: z.boolean(),
    answer: z.string(),
    similarity: z.number().nullable(),
    matchStrategy: z.enum(['exact', 'similarity']).nullable(),
    matchedFaq: z
      .object({
        id: z.string(),
        question: z.string(),
        category: categorySchema,
      })
      .nullable(),
    suggestions: z.array(
      z.object({
        faqId: z.string(),
        question: z.string(),
        similarity: z.number(),
      }),
    ),
    createdAt: z.string(),
  }),
})

export type ChatAnswerDto = z.infer<typeof chatAnswerDtoSchema>['data']
