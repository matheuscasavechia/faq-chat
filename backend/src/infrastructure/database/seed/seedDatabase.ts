import { Prisma, type PrismaClient } from '@prisma/client'
import { normalizeQuestion } from '../../../domain/question/normalizeQuestion'
import { seedCategories, seedFaqs, seedUnansweredQuestions } from './faqDataset'

export interface SeedSummary {
  categories: number
  faqs: number
  interactionsCreated: number
}

const INTERACTION_HISTORY_DAYS = 90
const SESSION_POOL_SIZE = 90
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

const createDeterministicRandom = (seed: number): (() => number) => {
  let state = seed
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) % 4_294_967_296
    return state / 4_294_967_296
  }
}

const pickIndexByWeight = (weights: number[], random: number): number => {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  let threshold = random * totalWeight

  for (let index = 0; index < weights.length; index += 1) {
    threshold -= weights[index] ?? 0
    if (threshold <= 0) return index
  }

  return weights.length - 1
}

const dailyVolume = (dayOffset: number, now: Date, random: () => number): number => {
  const date = new Date(now.getTime() - dayOffset * MILLISECONDS_PER_DAY)
  const isWeekend = date.getUTCDay() === 0 || date.getUTCDay() === 6
  const recencyBoost = 1 + (INTERACTION_HISTORY_DAYS - dayOffset) / INTERACTION_HISTORY_DAYS
  const base = isWeekend ? 3 : 9

  return Math.max(1, Math.round((base + random() * 6) * recencyBoost * 0.7))
}

const upsertCatalog = async (
  prisma: PrismaClient,
): Promise<{ categoryIdBySlug: Map<string, string>; faqCount: number }> => {
  const categoryIdBySlug = new Map<string, string>()

  for (const category of seedCategories) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: { name: category.name, slug: category.slug },
      select: { id: true },
    })
    categoryIdBySlug.set(category.slug, record.id)
  }

  let faqCount = 0

  for (const faq of seedFaqs) {
    const categoryId = categoryIdBySlug.get(faq.categorySlug)

    if (!categoryId) {
      throw new Error(`Seed FAQ references an unknown category: ${faq.categorySlug}`)
    }

    await prisma.faq.upsert({
      where: { normalizedQuestion: normalizeQuestion(faq.question) },
      update: { question: faq.question, answer: faq.answer, categoryId, active: true },
      create: {
        question: faq.question,
        normalizedQuestion: normalizeQuestion(faq.question),
        answer: faq.answer,
        categoryId,
        active: true,
      },
      select: { id: true },
    })
    faqCount += 1
  }

  return { categoryIdBySlug, faqCount }
}

const buildHistoricalInteractions = (
  faqs: Array<{ id: string; question: string; categoryId: string }>,
  weights: number[],
  now: Date,
): Prisma.InteractionCreateManyInput[] => {
  const random = createDeterministicRandom(20_260_801)
  const interactions: Prisma.InteractionCreateManyInput[] = []

  for (let dayOffset = INTERACTION_HISTORY_DAYS - 1; dayOffset >= 0; dayOffset -= 1) {
    const volume = dailyVolume(dayOffset, now, random)

    for (let index = 0; index < volume; index += 1) {
      const hour = 8 + Math.floor(random() * 11)
      const minute = Math.floor(random() * 60)
      const createdAt = new Date(now.getTime() - dayOffset * MILLISECONDS_PER_DAY)
      createdAt.setUTCHours(hour, minute, Math.floor(random() * 60), 0)

      if (createdAt.getTime() > now.getTime()) {
        createdAt.setTime(now.getTime() - Math.floor(random() * 3_600_000))
      }

      const sessionId = `seed-session-${Math.floor(random() * SESSION_POOL_SIZE) + 1}`
      const isUnanswered = random() < 0.17

      if (isUnanswered) {
        const question =
          seedUnansweredQuestions[Math.floor(random() * seedUnansweredQuestions.length)] ??
          seedUnansweredQuestions[0]

        if (!question) continue

        interactions.push({
          question,
          normalizedQuestion: normalizeQuestion(question),
          matchedFaqId: null,
          similarityScore: new Prisma.Decimal((random() * 0.2).toFixed(4)),
          answered: false,
          categoryId: null,
          sessionId,
          createdAt,
        })
        continue
      }

      const faq = faqs[pickIndexByWeight(weights, random())]

      if (!faq) continue

      const askedExactly = random() < 0.55

      interactions.push({
        question: faq.question,
        normalizedQuestion: normalizeQuestion(faq.question),
        matchedFaqId: faq.id,
        similarityScore: new Prisma.Decimal(
          askedExactly ? '1.0000' : (0.4 + random() * 0.5).toFixed(4),
        ),
        answered: true,
        categoryId: faq.categoryId,
        sessionId,
        createdAt,
      })
    }
  }

  return interactions
}

export const seedDatabase = async (prisma: PrismaClient): Promise<SeedSummary> => {
  const { faqCount } = await upsertCatalog(prisma)

  const existingInteractions = await prisma.interaction.count()

  if (existingInteractions > 0) {
    return {
      categories: seedCategories.length,
      faqs: faqCount,
      interactionsCreated: 0,
    }
  }

  const persistedFaqs = await prisma.faq.findMany({
    select: { id: true, question: true, categoryId: true },
    orderBy: { question: 'asc' },
  })

  const weightByNormalizedQuestion = new Map(
    seedFaqs.map((faq) => [normalizeQuestion(faq.question), faq.popularityWeight]),
  )
  const weights = persistedFaqs.map(
    (faq) => weightByNormalizedQuestion.get(normalizeQuestion(faq.question)) ?? 1,
  )

  const interactions = buildHistoricalInteractions(persistedFaqs, weights, new Date())
  await prisma.interaction.createMany({ data: interactions })

  return {
    categories: seedCategories.length,
    faqs: faqCount,
    interactionsCreated: interactions.length,
  }
}
