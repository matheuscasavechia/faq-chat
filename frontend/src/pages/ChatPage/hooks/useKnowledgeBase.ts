import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { fetchCategories } from '@/api/categories'
import { fetchFaqs } from '@/api/faqs'
import { CHAT_SUGGESTED_QUESTIONS } from '@/constants/chat'
import { QUERY_KEYS } from '@/constants/queryKeys'
import type { CategoryOption } from '@/types/catalog'

const STARTER_QUESTION_COUNT = 4
const CATALOG_STALE_TIME_MS = 10 * 60_000

export interface KnowledgeBaseState {
  starterQuestions: string[]
  categories: CategoryOption[]
  isCatalogLoading: boolean
}

export const useKnowledgeBase = (): KnowledgeBaseState => {
  const starterQuestionsQuery = useQuery({
    queryKey: QUERY_KEYS.faqs.list({ page: 1, pageSize: STARTER_QUESTION_COUNT }),
    queryFn: ({ signal }) => fetchFaqs({ page: 1, pageSize: STARTER_QUESTION_COUNT }, signal),
    staleTime: CATALOG_STALE_TIME_MS,
  })

  const categoriesQuery = useQuery({
    queryKey: QUERY_KEYS.categories.all,
    queryFn: ({ signal }) => fetchCategories(signal),
    staleTime: CATALOG_STALE_TIME_MS,
  })

  const starterQuestions = useMemo(() => {
    const fetched = starterQuestionsQuery.data?.items.map((faq) => faq.question) ?? []
    return fetched.length > 0 ? fetched : [...CHAT_SUGGESTED_QUESTIONS]
  }, [starterQuestionsQuery.data])

  return {
    starterQuestions,
    categories: categoriesQuery.data ?? [],
    isCatalogLoading: categoriesQuery.isPending,
  }
}
