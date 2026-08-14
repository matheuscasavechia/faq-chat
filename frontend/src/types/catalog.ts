export interface FaqEntry {
  id: string
  question: string
  answer: string
  categoryName: string
  categorySlug: string
}

export interface FaqCollection {
  items: FaqEntry[]
  page: number
  totalPages: number
  total: number
}

export interface CategoryOption {
  id: string
  name: string
  slug: string
  faqCount: number
}
