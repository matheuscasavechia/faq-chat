import { describe, expect, it } from 'vitest'
import {
  appendMessage,
  createAssistantMessage,
  createUserMessage,
  markMessageStatus,
} from '@/services/conversation'
import { buildAnsweredChatAnswer } from '../support/fixtures'

describe('conversation', () => {
  it('creates user messages in the sending state', () => {
    const message = createUserMessage('How do I reset my password?')

    expect(message).toMatchObject({ author: 'user', status: 'sending' })
  })

  it('gives every message a unique id', () => {
    const first = createUserMessage('one')
    const second = createUserMessage('two')

    expect(first.id).not.toBe(second.id)
  })

  it('updates only the targeted user message status', () => {
    const first = createUserMessage('one')
    const second = createUserMessage('two')
    const messages = appendMessage(appendMessage([], first), second)

    const updated = markMessageStatus(messages, second.id, 'failed')

    expect(updated[0]).toMatchObject({ status: 'sending' })
    expect(updated[1]).toMatchObject({ status: 'failed' })
  })

  it('never mutates the original transcript', () => {
    const messages = appendMessage([], createUserMessage('one'))
    const updated = appendMessage(messages, createAssistantMessage(buildAnsweredChatAnswer()))

    expect(messages).toHaveLength(1)
    expect(updated).toHaveLength(2)
  })
})
