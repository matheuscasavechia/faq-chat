import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/ApiError'
import { askQuestion } from '@/api/chat'
import { fetchCategories } from '@/api/categories'
import { fetchFaqs } from '@/api/faqs'
import { ChatPage } from '@/pages/ChatPage'
import { renderWithProviders } from '../support/renderWithProviders'
import {
  buildAnsweredChatAnswer,
  buildCategoryOptions,
  buildFaqCollection,
  buildUnansweredChatAnswer,
} from '../support/fixtures'

vi.mock('@/api/chat', () => ({ askQuestion: vi.fn() }))
vi.mock('@/api/faqs', () => ({ fetchFaqs: vi.fn() }))
vi.mock('@/api/categories', () => ({ fetchCategories: vi.fn() }))

const askQuestionMock = vi.mocked(askQuestion)
const fetchFaqsMock = vi.mocked(fetchFaqs)
const fetchCategoriesMock = vi.mocked(fetchCategories)

const typeQuestion = async (question: string): Promise<void> => {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Your question'), question)
  await user.click(screen.getByRole('button', { name: 'Send' }))
}

describe('ChatPage', () => {
  beforeEach(() => {
    askQuestionMock.mockReset()
    fetchFaqsMock.mockReset()
    fetchCategoriesMock.mockReset()
    fetchFaqsMock.mockResolvedValue(buildFaqCollection())
    fetchCategoriesMock.mockResolvedValue(buildCategoryOptions())
  })

  it('shows the welcome state with starter questions loaded from the knowledge base', async () => {
    renderWithProviders(<ChatPage />)

    expect(screen.getByRole('heading', { name: 'FAQ assistant' })).toBeInTheDocument()
    expect(screen.getByText('Hi! What can I help you with?')).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Conversation' })).not.toBeInTheDocument()

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'How do I reset my password?' }),
      ).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'How long does delivery take?' })).toBeInTheDocument()
  })

  it('lists the knowledge base categories with their question counts', async () => {
    renderWithProviders(<ChatPage />)

    await waitFor(() => {
      expect(screen.getByText('Password · 5')).toBeInTheDocument()
    })
    expect(screen.getByText('Delivery · 4')).toBeInTheDocument()
  })

  it('keeps the send action disabled until the question is long enough', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ChatPage />)

    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()

    await user.type(screen.getByLabelText('Your question'), 'hi')
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()

    await user.type(screen.getByLabelText('Your question'), 'ii')
    expect(screen.getByRole('button', { name: 'Send' })).toBeEnabled()
  })

  it('shows the sending state and then renders the answer', async () => {
    let resolveAnswer: ((answer: ReturnType<typeof buildAnsweredChatAnswer>) => void) | undefined
    askQuestionMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveAnswer = resolve
        }),
    )

    renderWithProviders(<ChatPage />)
    await typeQuestion('How do I reset my password?')

    expect(screen.getByText('Searching the knowledge base…')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sending/ })).toBeDisabled()

    resolveAnswer?.(buildAnsweredChatAnswer())

    await waitFor(() => {
      expect(
        screen.getByText('Use the Forgot password link on the sign-in screen.'),
      ).toBeInTheDocument()
    })
    expect(screen.getByText('Password')).toBeInTheDocument()
    expect(screen.getByText('match 92%')).toBeInTheDocument()
    expect(screen.queryByText('Searching the knowledge base…')).not.toBeInTheDocument()
  })

  it('sends exactly one request when the user submits twice quickly', async () => {
    askQuestionMock.mockImplementation(() => new Promise(() => undefined))

    renderWithProviders(<ChatPage />)
    await typeQuestion('How do I reset my password?')

    const sendButton = screen.getByRole('button', { name: /Sending/ })
    expect(sendButton).toBeDisabled()
    expect(askQuestionMock).toHaveBeenCalledTimes(1)
  })

  it('renders the fallback answer and suggestions when nothing matched', async () => {
    askQuestionMock.mockResolvedValue(buildUnansweredChatAnswer())

    renderWithProviders(<ChatPage />)
    await typeQuestion('do you support okta sso')

    await waitFor(() => {
      expect(
        screen.getByText('I could not find a registered answer for that yet.'),
      ).toBeInTheDocument()
    })
    expect(screen.getByText('Did you mean one of these?')).toBeInTheDocument()
    expect(screen.getByText(/no registered answer/)).toBeInTheDocument()
  })

  it('keeps the question visible and offers a retry when the request fails', async () => {
    askQuestionMock.mockRejectedValueOnce(new ApiError({ kind: 'network', message: 'offline' }))
    askQuestionMock.mockResolvedValueOnce(buildAnsweredChatAnswer())

    renderWithProviders(<ChatPage />)
    await typeQuestion('How do I reset my password?')

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
    expect(screen.getByText('How do I reset my password?')).toBeInTheDocument()
    expect(screen.getByText(/not delivered/)).toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    await waitFor(() => {
      expect(
        screen.getByText('Use the Forgot password link on the sign-in screen.'),
      ).toBeInTheDocument()
    })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(askQuestionMock).toHaveBeenCalledTimes(2)
  })

  it('asks a suggested question through the backend when a chip is clicked', async () => {
    askQuestionMock.mockResolvedValue(buildAnsweredChatAnswer())
    const user = userEvent.setup()

    renderWithProviders(<ChatPage />)
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Which payment methods do you accept?' }),
      ).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'Which payment methods do you accept?' }))

    await waitFor(() => {
      expect(askQuestionMock).toHaveBeenCalledWith(
        expect.objectContaining({ question: 'Which payment methods do you accept?' }),
      )
    })
  })
})
