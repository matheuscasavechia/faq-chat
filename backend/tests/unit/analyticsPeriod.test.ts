import { describe, expect, it } from 'vitest'
import { resolveAnalyticsPeriodRange } from '../../src/domain/analytics/AnalyticsPeriodRange'
import { calculateAnswerRate, calculateShare } from '../../src/domain/analytics/metrics'

const now = new Date('2026-08-11T15:30:00.000Z')

describe('resolveAnalyticsPeriodRange', () => {
  it('builds a seven day window grouped by day', () => {
    const range = resolveAnalyticsPeriodRange({ period: '7d', now, earliestInteractionAt: null })

    expect(range.from.toISOString()).toBe('2026-08-05T15:30:00.000Z')
    expect(range.to).toEqual(now)
    expect(range.granularity).toBe('day')
  })

  it('groups a ninety day window by week', () => {
    const range = resolveAnalyticsPeriodRange({ period: '90d', now, earliestInteractionAt: null })

    expect(range.granularity).toBe('week')
  })

  it('uses the first recorded interaction for the all time period', () => {
    const earliest = new Date('2025-11-01T00:00:00.000Z')
    const range = resolveAnalyticsPeriodRange({
      period: 'all',
      now,
      earliestInteractionAt: earliest,
    })

    expect(range.from).toEqual(earliest)
    expect(range.granularity).toBe('month')
  })

  it('keeps a minimum window for the all time period when there is no data', () => {
    const range = resolveAnalyticsPeriodRange({ period: 'all', now, earliestInteractionAt: null })

    expect(range.from.toISOString()).toBe('2026-07-13T15:30:00.000Z')
    expect(range.granularity).toBe('day')
  })
})

describe('analytics metrics', () => {
  it('calculates the answer rate as a ratio', () => {
    expect(calculateAnswerRate(200, 170)).toBe(0.85)
  })

  it('returns zero instead of dividing by zero', () => {
    expect(calculateAnswerRate(0, 0)).toBe(0)
    expect(calculateShare(0, 0)).toBe(0)
  })

  it('rounds shares to four decimals', () => {
    expect(calculateShare(3, 1)).toBe(0.3333)
  })
})
