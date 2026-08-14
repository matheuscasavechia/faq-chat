import { z } from 'zod'

export const faqListDtoSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      answer: z.string(),
      category: z.object({ id: z.string(), name: z.string(), slug: z.string() }),
    }),
  ),
  meta: z.object({
    pagination: z.object({
      page: z.number(),
      pageSize: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  }),
})

export type FaqListDto = z.infer<typeof faqListDtoSchema>

export const categoryListDtoSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
      faqCount: z.number(),
    }),
  ),
})

export type CategoryListDto = z.infer<typeof categoryListDtoSchema>
