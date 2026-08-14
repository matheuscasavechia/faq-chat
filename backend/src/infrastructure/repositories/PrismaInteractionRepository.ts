import { Prisma, type PrismaClient } from '@prisma/client'
import type {
  CreateInteractionInput,
  InteractionRepository,
  RecordedInteraction,
} from '../../repositories/InteractionRepository'

export class PrismaInteractionRepository implements InteractionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateInteractionInput): Promise<RecordedInteraction> {
    const interaction = await this.prisma.interaction.create({
      data: {
        question: input.question,
        normalizedQuestion: input.normalizedQuestion,
        matchedFaqId: input.matchedFaqId,
        similarityScore:
          input.similarityScore === null ? null : new Prisma.Decimal(input.similarityScore),
        answered: input.answered,
        categoryId: input.categoryId,
        sessionId: input.sessionId,
      },
      select: { id: true, createdAt: true },
    })

    return interaction
  }
}
