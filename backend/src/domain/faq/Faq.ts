export interface CategorySummary {
  id: string
  name: string
  slug: string
}

export interface Faq {
  id: string
  question: string
  normalizedQuestion: string
  answer: string
  category: CategorySummary
}

export interface FaqSimilarityCandidate {
  faq: Faq
  similarity: number
}
