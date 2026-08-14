import { API_ENDPOINTS } from '@/constants/api'
import type { FaqCollection } from '@/types/catalog'
import { apiClient } from './client'
import { faqListDtoSchema } from './dto/catalogDto'
import { toFaqCollection } from './mappers/catalogMapper'

export interface FetchFaqsParams {
  page: number
  pageSize: number
  category?: string
}

export const fetchFaqs = async (
  { page, pageSize, category }: FetchFaqsParams,
  signal?: AbortSignal,
): Promise<FaqCollection> => {
  const response = await apiClient.get(API_ENDPOINTS.faqs, faqListDtoSchema, {
    query: { page, pageSize, ...(category ? { category } : {}) },
    ...(signal ? { signal } : {}),
  })

  return toFaqCollection(response)
}
