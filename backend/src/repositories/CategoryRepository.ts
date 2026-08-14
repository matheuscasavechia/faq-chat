import type { CategorySummary } from '../domain/faq/Faq'

export interface CategoryWithFaqCount extends CategorySummary {
  faqCount: number
}

export interface CategoryRepository {
  list(): Promise<CategoryWithFaqCount[]>
}
