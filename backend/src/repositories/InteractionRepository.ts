export interface CreateInteractionInput {
  question: string
  normalizedQuestion: string
  matchedFaqId: string | null
  similarityScore: number | null
  answered: boolean
  categoryId: string | null
  sessionId: string | null
}

export interface RecordedInteraction {
  id: string
  createdAt: Date
}

export interface InteractionRepository {
  create(input: CreateInteractionInput): Promise<RecordedInteraction>
}
