import type { Faq, FaqSimilarityCandidate } from '../../src/domain/faq/Faq'
import { normalizeQuestion } from '../../src/domain/question/normalizeQuestion'
import type {
  AnalyticsRepository,
  AnalyticsWindow,
  CategoryDistributionRow,
  InteractionTotals,
  TimelineBucketRow,
  TopQuestionRow,
  UnansweredQuestionRow,
} from '../../src/repositories/AnalyticsRepository'
import type {
  CategoryRepository,
  CategoryWithFaqCount,
} from '../../src/repositories/CategoryRepository'
import type {
  FaqRepository,
  FaqSimilaritySearchOptions,
  ListFaqsFilter,
  PaginatedFaqs,
} from '../../src/repositories/FaqRepository'
import type { HealthRepository } from '../../src/repositories/HealthRepository'
import type {
  CreateInteractionInput,
  InteractionRepository,
  RecordedInteraction,
} from '../../src/repositories/InteractionRepository'

const tokenize = (value: string): Set<string> => new Set(value.split(' ').filter(Boolean))

const tokenOverlapSimilarity = (left: string, right: string): number => {
  const leftTokens = tokenize(left)
  const rightTokens = tokenize(right)
  const shared = [...leftTokens].filter((token) => rightTokens.has(token)).length
  const union = new Set([...leftTokens, ...rightTokens]).size

  return union === 0 ? 0 : Number((shared / union).toFixed(4))
}

export class InMemoryFaqRepository implements FaqRepository {
  private readonly forcedScores = new Map<string, number>()

  constructor(private readonly faqs: Faq[] = []) {}

  forceSimilarity(faqId: string, score: number): void {
    this.forcedScores.set(faqId, score)
  }

  findByNormalizedQuestion(normalizedQuestion: string): Promise<Faq | null> {
    return Promise.resolve(
      this.faqs.find((faq) => faq.normalizedQuestion === normalizedQuestion) ?? null,
    )
  }

  findMostSimilar(
    normalizedQuestion: string,
    { limit }: FaqSimilaritySearchOptions,
  ): Promise<FaqSimilarityCandidate[]> {
    const candidates = this.faqs
      .map((faq) => ({
        faq,
        similarity:
          this.forcedScores.get(faq.id) ??
          tokenOverlapSimilarity(faq.normalizedQuestion, normalizedQuestion),
      }))
      .sort((first, second) => second.similarity - first.similarity)
      .slice(0, limit)

    return Promise.resolve(candidates)
  }

  list({ page, pageSize, categorySlug, search }: ListFaqsFilter): Promise<PaginatedFaqs> {
    const filtered = this.faqs.filter((faq) => {
      const matchesCategory = categorySlug ? faq.category.slug === categorySlug : true
      const matchesSearch = search
        ? normalizeQuestion(faq.question).includes(normalizeQuestion(search))
        : true

      return matchesCategory && matchesSearch
    })

    return Promise.resolve({
      items: filtered.slice((page - 1) * pageSize, page * pageSize),
      total: filtered.length,
    })
  }
}

export class InMemoryInteractionRepository implements InteractionRepository {
  readonly created: CreateInteractionInput[] = []

  private sequence = 0

  create(input: CreateInteractionInput): Promise<RecordedInteraction> {
    this.created.push(input)
    this.sequence += 1

    return Promise.resolve({
      id: `interaction-${this.sequence}`,
      createdAt: new Date('2026-08-01T12:00:00.000Z'),
    })
  }
}

export class InMemoryCategoryRepository implements CategoryRepository {
  constructor(private readonly categories: CategoryWithFaqCount[] = []) {}

  list(): Promise<CategoryWithFaqCount[]> {
    return Promise.resolve(this.categories)
  }
}

export interface StubAnalyticsData {
  totals: InteractionTotals
  topQuestions: TopQuestionRow[]
  unansweredQuestions: UnansweredQuestionRow[]
  categoryDistribution: CategoryDistributionRow[]
  timeline: TimelineBucketRow[]
  earliestInteractionAt: Date | null
}

export class StubAnalyticsRepository implements AnalyticsRepository {
  readonly receivedWindows: AnalyticsWindow[] = []

  constructor(private readonly data: StubAnalyticsData) {}

  getInteractionTotals(window: AnalyticsWindow): Promise<InteractionTotals> {
    this.receivedWindows.push(window)
    return Promise.resolve(this.data.totals)
  }

  getTopQuestions(_window: AnalyticsWindow, limit: number): Promise<TopQuestionRow[]> {
    return Promise.resolve(this.data.topQuestions.slice(0, limit))
  }

  getUnansweredQuestions(
    _window: AnalyticsWindow,
    limit: number,
  ): Promise<UnansweredQuestionRow[]> {
    return Promise.resolve(this.data.unansweredQuestions.slice(0, limit))
  }

  getCategoryDistribution(_window: AnalyticsWindow): Promise<CategoryDistributionRow[]> {
    return Promise.resolve(this.data.categoryDistribution)
  }

  getTimeline(_window: AnalyticsWindow): Promise<TimelineBucketRow[]> {
    return Promise.resolve(this.data.timeline)
  }

  getEarliestInteractionDate(): Promise<Date | null> {
    return Promise.resolve(this.data.earliestInteractionAt)
  }
}

export class StubHealthRepository implements HealthRepository {
  constructor(private readonly healthy = true) {}

  ping(): Promise<void> {
    return this.healthy ? Promise.resolve() : Promise.reject(new Error('database unreachable'))
  }
}
