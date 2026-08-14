import type { Faq, FaqSimilarityCandidate } from '../domain/faq/Faq'

export interface FaqSimilaritySearchOptions {
  limit: number
}

export interface ListFaqsFilter {
  page: number
  pageSize: number
  categorySlug?: string
  search?: string
}

export interface PaginatedFaqs {
  items: Faq[]
  total: number
}

export interface FaqRepository {
  findByNormalizedQuestion(normalizedQuestion: string): Promise<Faq | null>
  findMostSimilar(
    normalizedQuestion: string,
    options: FaqSimilaritySearchOptions,
  ): Promise<FaqSimilarityCandidate[]>
  list(filter: ListFaqsFilter): Promise<PaginatedFaqs>
}
