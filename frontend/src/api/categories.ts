import { API_ENDPOINTS } from '@/constants/api'
import type { CategoryOption } from '@/types/catalog'
import { apiClient } from './client'
import { categoryListDtoSchema } from './dto/catalogDto'
import { toCategoryOptions } from './mappers/catalogMapper'

export const fetchCategories = async (signal?: AbortSignal): Promise<CategoryOption[]> => {
  const response = await apiClient.get(
    API_ENDPOINTS.categories,
    categoryListDtoSchema,
    signal ? { signal } : {},
  )

  return toCategoryOptions(response)
}
