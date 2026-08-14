import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/ApiError'
import { fetchDashboardAnalytics } from '@/api/analytics'
import { DashboardPage } from '@/pages/DashboardPage'
import { renderWithProviders } from '../support/renderWithProviders'
import { buildDashboardAnalytics } from '../support/fixtures'

vi.mock('@/api/analytics', () => ({ fetchDashboardAnalytics: vi.fn() }))

const fetchDashboardAnalyticsMock = vi.mocked(fetchDashboardAnalytics)

describe('DashboardPage', () => {
  beforeEach(() => {
    fetchDashboardAnalyticsMock.mockReset()
  })

  it('shows a loading state on the first load', () => {
    fetchDashboardAnalyticsMock.mockImplementation(() => new Promise(() => undefined))

    renderWithProviders(<DashboardPage />)

    expect(screen.getByText('Loading analytics…')).toBeInTheDocument()
    expect(screen.getByLabelText('Loading chart')).toBeInTheDocument()
    expect(screen.queryByText('Total queries')).not.toBeInTheDocument()
  })

  it('renders the KPIs and panels from backend data', async () => {
    fetchDashboardAnalyticsMock.mockResolvedValue(buildDashboardAnalytics())

    renderWithProviders(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Total queries')).toBeInTheDocument()
    })

    const indicators = screen.getByRole('region', { name: 'Key indicators' })
    expect(within(indicators).getByText('420')).toBeInTheDocument()
    expect(within(indicators).getByText('357')).toBeInTheDocument()
    expect(within(indicators).getByText('63')).toBeInTheDocument()
    expect(within(indicators).getByText('85%')).toBeInTheDocument()

    expect(screen.getByText('Queries over time')).toBeInTheDocument()
    expect(screen.getByText('Queries by category')).toBeInTheDocument()
    expect(screen.getByText('How do I reset my password?')).toBeInTheDocument()
    expect(screen.getByText('Do you offer a student discount?')).toBeInTheDocument()
    expect(screen.getByText(/Last 30 days/)).toBeInTheDocument()
  })

  it('shows an empty state when the period has no interactions', async () => {
    fetchDashboardAnalyticsMock.mockResolvedValue(
      buildDashboardAnalytics({
        isEmpty: true,
        overview: {
          totalQueries: 0,
          answeredQueries: 0,
          unansweredQueries: 0,
          answerRate: 0,
          uniqueSessions: 0,
          averageSimilarity: null,
        },
        topQuestions: [],
        unansweredQuestions: [],
        categoryDistribution: [],
        timeline: [],
      }),
    )

    renderWithProviders(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('No interactions in this period')).toBeInTheDocument()
    })
    expect(screen.getByText('No categorised queries yet')).toBeInTheDocument()
    expect(screen.getByText('Every question in this period found an answer.')).toBeInTheDocument()
  })

  it('shows an error state with a working retry action', async () => {
    fetchDashboardAnalyticsMock.mockRejectedValueOnce(
      new ApiError({ kind: 'server', message: 'boom', status: 500 }),
    )
    fetchDashboardAnalyticsMock.mockResolvedValueOnce(buildDashboardAnalytics())

    renderWithProviders(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('The dashboard could not be loaded')).toBeInTheDocument()
    })

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    await waitFor(() => {
      expect(screen.getByText('Total queries')).toBeInTheDocument()
    })
    expect(screen.queryByText('The dashboard could not be loaded')).not.toBeInTheDocument()
  })

  it('keeps the previous data on screen while a new period is loading', async () => {
    fetchDashboardAnalyticsMock.mockResolvedValueOnce(buildDashboardAnalytics())
    renderWithProviders(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('420')).toBeInTheDocument()
    })

    fetchDashboardAnalyticsMock.mockImplementation(() => new Promise(() => undefined))
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: '7d' }))

    expect(screen.getByText('420')).toBeInTheDocument()
    expect(screen.getByText(/refreshing…/)).toBeInTheDocument()
    expect(screen.queryByText('Loading analytics…')).not.toBeInTheDocument()
  })

  it('requests the period selected in the shared filter', async () => {
    fetchDashboardAnalyticsMock.mockResolvedValue(buildDashboardAnalytics())
    renderWithProviders(<DashboardPage />)

    await waitFor(() => {
      expect(fetchDashboardAnalyticsMock).toHaveBeenCalledWith('30d', expect.anything())
    })

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: '90d' }))

    await waitFor(() => {
      expect(fetchDashboardAnalyticsMock).toHaveBeenCalledWith('90d', expect.anything())
    })
  })
})
