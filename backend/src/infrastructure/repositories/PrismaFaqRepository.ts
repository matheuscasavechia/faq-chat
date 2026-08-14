import { Prisma, type PrismaClient } from '@prisma/client'
import type { Faq, FaqSimilarityCandidate } from '../../domain/faq/Faq'
import type {
  FaqRepository,
  FaqSimilaritySearchOptions,
  ListFaqsFilter,
  PaginatedFaqs,
} from '../../repositories/FaqRepository'
import { toNumber } from '../database/rawValues'

const faqSelection = {
  id: true,
  question: true,
  normalizedQuestion: true,
  answer: true,
  category: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.FaqSelect

type FaqRecord = Prisma.FaqGetPayload<{ select: typeof faqSelection }>

interface SimilarFaqRow {
  id: string
  question: string
  normalized_question: string
  answer: string
  category_id: string
  category_name: string
  category_slug: string
  similarity_score: number
}

const toFaq = (record: FaqRecord): Faq => ({
  id: record.id,
  question: record.question,
  normalizedQuestion: record.normalizedQuestion,
  answer: record.answer,
  category: {
    id: record.category.id,
    name: record.category.name,
    slug: record.category.slug,
  },
})

const toCandidate = (row: SimilarFaqRow): FaqSimilarityCandidate => ({
  faq: {
    id: row.id,
    question: row.question,
    normalizedQuestion: row.normalized_question,
    answer: row.answer,
    category: {
      id: row.category_id,
      name: row.category_name,
      slug: row.category_slug,
    },
  },
  similarity: Math.min(1, Math.max(0, toNumber(row.similarity_score))),
})

export class PrismaFaqRepository implements FaqRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByNormalizedQuestion(normalizedQuestion: string): Promise<Faq | null> {
    const record = await this.prisma.faq.findFirst({
      where: { normalizedQuestion, active: true },
      select: faqSelection,
    })

    return record ? toFaq(record) : null
  }

  async findMostSimilar(
    normalizedQuestion: string,
    { limit }: FaqSimilaritySearchOptions,
  ): Promise<FaqSimilarityCandidate[]> {
    const rows = await this.prisma.$queryRaw<SimilarFaqRow[]>(Prisma.sql`
      SELECT
        f.id,
        f.question,
        f.normalized_question,
        f.answer,
        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug,
        1 - (f.normalized_question <-> ${normalizedQuestion}) AS similarity_score
      FROM faqs f
      INNER JOIN categories c ON c.id = f.category_id
      WHERE f.active = true
      ORDER BY f.normalized_question <-> ${normalizedQuestion}
      LIMIT ${limit}
    `)

    return rows.map(toCandidate)
  }

  async list({ page, pageSize, categorySlug, search }: ListFaqsFilter): Promise<PaginatedFaqs> {
    const where: Prisma.FaqWhereInput = {
      active: true,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(search
        ? {
            OR: [
              { question: { contains: search, mode: 'insensitive' } },
              { answer: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    }

    const [records, total] = await Promise.all([
      this.prisma.faq.findMany({
        where,
        select: faqSelection,
        orderBy: [{ category: { name: 'asc' } }, { question: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.faq.count({ where }),
    ])

    return { items: records.map(toFaq), total }
  }
}
