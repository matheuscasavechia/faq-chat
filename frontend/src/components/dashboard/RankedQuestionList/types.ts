export interface RankedQuestionItem {
  id: string
  question: string
  total: number
  meta: string
  share: number
}

export interface RankedQuestionListProps {
  items: RankedQuestionItem[]
  tone?: 'accent' | 'attention'
  emptyMessage: string
}
