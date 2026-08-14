import { describe, expect, it } from 'vitest'
import { GetDashboardAnalyticsUseCase } from '../../src/useCases/GetDashboardAnalyticsUseCase'
import { StubAnalyticsRepository } from '../support/inMemoryRepositories'
import { buildAnalyticsData } from '../support/fixtures'

const now = new Date('2026-08-11T15:30:00.000Z')

describe('GetDashboardAnalyticsUseCase', () => {
  it('derives the answer rate and shares from persisted counters', async () => {
    const repository = new StubAnalyticsRepository(buildAnalyticsData())
    const useCase = new GetDashboardAnalyticsUseCase(repository)

    const result = await useCase.execute({ period: '30d', now })

    expect(result.overview).toMatchObject({
      totalQueries: 200,
      answeredQueries: 170,
      unansweredQueries: 30,
      answerRate: 0.85,
    })
    expect(result.topQuestions[0]?.share).toBe(0.2)
    expect(result.categoryDistribution[0]?.share).toBeCloseTo(0.7059, 4)
  })

  it('queries the repository with the window derived from the period', async () => {
    const repository = new StubAnalyticsRepository(buildAnalyticsData())
    const useCase = new GetDashboardAnalyticsUseCase(repository)

    await useCase.execute({ period: '7d', now })

    expect(repository.receivedWindows[0]?.from.toISOString()).toBe('2026-08-05T15:30:00.000Z')
    expect(repository.receivedWindows[0]?.to).toEqual(now)
  })

  it('returns a zeroed overview when no interaction exists yet', async () => {
    const repository = new StubAnalyticsRepository(
      buildAnalyticsData({
        totals: {
          totalQueries: 0,
          answeredQueries: 0,
          unansweredQueries: 0,
          uniqueSessions: 0,
          averageSimilarity: null,
        },
        topQuestions: [],
        unansweredQuestions: [],
        categoryDistribution: [],
        timeline: [],
        earliestInteractionAt: null,
      }),
    )
    const useCase = new GetDashboardAnalyticsUseCase(repository)

    const result = await useCase.execute({ period: 'all', now })

    expect(result.overview.answerRate).toBe(0)
    expect(result.topQuestions).toEqual([])
    expect(result.timeline).toEqual([])
  })
})
