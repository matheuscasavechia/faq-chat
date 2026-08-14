import { Prisma, type PrismaClient } from '@prisma/client'
import type { TimelineGranularity } from '../../domain/analytics/AnalyticsPeriodRange'
import type {
  AnalyticsRepository,
  AnalyticsWindow,
  CategoryDistributionRow,
  InteractionTotals,
  TimelineBucketRow,
  TopQuestionRow,
  UnansweredQuestionRow,
} from '../../repositories/AnalyticsRepository'
import { toDate, toNullableDate, toNullableNumber, toNumber } from '../database/rawValues'

interface TotalsRow {
  total_queries: bigint
  answered_queries: bigint
  unique_sessions: bigint
  average_similarity: Prisma.Decimal | null
}

interface TopQuestionRawRow {
  faq_id: string
  question: string
  category_name: string
  total: bigint
  last_asked_at: Date
}

interface UnansweredRawRow {
  normalized_question: string
  question: string
  total: bigint
  last_asked_at: Date
}

interface CategoryRawRow {
  category_id: string
  category_name: string
  category_slug: string
  total: bigint
}

interface TimelineRawRow {
  bucket_start: Date
  total: bigint
  answered: bigint
  unanswered: bigint
}

interface EarliestRow {
  earliest: Date | null
}

export class PrismaAnalyticsRepository implements AnalyticsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getInteractionTotals({ from, to }: AnalyticsWindow): Promise<InteractionTotals> {
    const rows = await this.prisma.$queryRaw<TotalsRow[]>(Prisma.sql`
      SELECT
        COUNT(*) AS total_queries,
        COUNT(*) FILTER (WHERE answered) AS answered_queries,
        COUNT(DISTINCT session_id) AS unique_sessions,
        AVG(similarity_score) FILTER (WHERE answered) AS average_similarity
      FROM interactions
      WHERE created_at >= ${from} AND created_at <= ${to}
    `)

    const row = rows[0]

    if (!row) {
      return {
        totalQueries: 0,
        answeredQueries: 0,
        unansweredQueries: 0,
        uniqueSessions: 0,
        averageSimilarity: null,
      }
    }

    const totalQueries = toNumber(row.total_queries)
    const answeredQueries = toNumber(row.answered_queries)

    return {
      totalQueries,
      answeredQueries,
      unansweredQueries: totalQueries - answeredQueries,
      uniqueSessions: toNumber(row.unique_sessions),
      averageSimilarity: toNullableNumber(row.average_similarity),
    }
  }

  async getTopQuestions({ from, to }: AnalyticsWindow, limit: number): Promise<TopQuestionRow[]> {
    const rows = await this.prisma.$queryRaw<TopQuestionRawRow[]>(Prisma.sql`
      SELECT
        f.id AS faq_id,
        f.question AS question,
        c.name AS category_name,
        COUNT(i.id) AS total,
        MAX(i.created_at) AS last_asked_at
      FROM interactions i
      INNER JOIN faqs f ON f.id = i.matched_faq_id
      INNER JOIN categories c ON c.id = f.category_id
      WHERE i.answered = true AND i.created_at >= ${from} AND i.created_at <= ${to}
      GROUP BY f.id, f.question, c.name
      ORDER BY total DESC, last_asked_at DESC
      LIMIT ${limit}
    `)

    return rows.map((row) => ({
      faqId: row.faq_id,
      question: row.question,
      categoryName: row.category_name,
      total: toNumber(row.total),
      lastAskedAt: toDate(row.last_asked_at),
    }))
  }

  async getUnansweredQuestions(
    { from, to }: AnalyticsWindow,
    limit: number,
  ): Promise<UnansweredQuestionRow[]> {
    const rows = await this.prisma.$queryRaw<UnansweredRawRow[]>(Prisma.sql`
      SELECT
        i.normalized_question,
        MIN(i.question) AS question,
        COUNT(i.id) AS total,
        MAX(i.created_at) AS last_asked_at
      FROM interactions i
      WHERE i.answered = false AND i.created_at >= ${from} AND i.created_at <= ${to}
      GROUP BY i.normalized_question
      ORDER BY total DESC, last_asked_at DESC
      LIMIT ${limit}
    `)

    return rows.map((row) => ({
      normalizedQuestion: row.normalized_question,
      question: row.question,
      total: toNumber(row.total),
      lastAskedAt: toDate(row.last_asked_at),
    }))
  }

  async getCategoryDistribution({ from, to }: AnalyticsWindow): Promise<CategoryDistributionRow[]> {
    const rows = await this.prisma.$queryRaw<CategoryRawRow[]>(Prisma.sql`
      SELECT
        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug,
        COUNT(i.id) AS total
      FROM interactions i
      INNER JOIN categories c ON c.id = i.category_id
      WHERE i.created_at >= ${from} AND i.created_at <= ${to}
      GROUP BY c.id, c.name, c.slug
      ORDER BY total DESC, c.name ASC
    `)

    return rows.map((row) => ({
      categoryId: row.category_id,
      categoryName: row.category_name,
      categorySlug: row.category_slug,
      total: toNumber(row.total),
    }))
  }

  async getTimeline(
    { from, to }: AnalyticsWindow,
    granularity: TimelineGranularity,
  ): Promise<TimelineBucketRow[]> {
    const rows = await this.prisma.$queryRaw<TimelineRawRow[]>(Prisma.sql`
      WITH bucket_span AS (
        SELECT ('1 ' || ${granularity}::text)::interval AS width
      ),
      buckets AS (
        SELECT generate_series(
          date_trunc(${granularity}::text, ${from}::timestamptz AT TIME ZONE 'UTC'),
          date_trunc(${granularity}::text, ${to}::timestamptz AT TIME ZONE 'UTC'),
          (SELECT width FROM bucket_span)
        ) AS bucket_start
      )
      SELECT
        b.bucket_start,
        COUNT(i.id) AS total,
        COUNT(i.id) FILTER (WHERE i.answered) AS answered,
        COUNT(i.id) FILTER (WHERE NOT i.answered) AS unanswered
      FROM buckets b
      LEFT JOIN interactions i
        ON (i.created_at AT TIME ZONE 'UTC') >= b.bucket_start
        AND (i.created_at AT TIME ZONE 'UTC') < b.bucket_start + (SELECT width FROM bucket_span)
        AND i.created_at >= ${from}
        AND i.created_at <= ${to}
      GROUP BY b.bucket_start
      ORDER BY b.bucket_start ASC
    `)

    return rows.map((row) => ({
      bucketStart: toDate(row.bucket_start),
      total: toNumber(row.total),
      answered: toNumber(row.answered),
      unanswered: toNumber(row.unanswered),
    }))
  }

  async getEarliestInteractionDate(): Promise<Date | null> {
    const rows = await this.prisma.$queryRaw<EarliestRow[]>(Prisma.sql`
      SELECT MIN(created_at) AS earliest FROM interactions
    `)

    return toNullableDate(rows[0]?.earliest ?? null)
  }
}
