import { useMutation } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { useCallback, useMemo, useRef, useState } from 'react'
import { askQuestion } from '@/api/chat'
import { MIN_QUESTION_LENGTH } from '@/constants/chat'
import {
  appendMessage,
  createAssistantMessage,
  createUserMessage,
  markMessageStatus,
} from '@/services/conversation'
import { chatSessionIdAtom } from '@/states/chatSessionAtom'
import type { ChatMessage } from '@/types/chat'
import { toUserFacingMessage } from '@/utils/errorMessages'
import type { ChatViewModel } from '../types'

interface PendingQuestion {
  text: string
  messageId: string
}

export const useChat = (): ChatViewModel => {
  const sessionId = useAtomValue(chatSessionIdAtom)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const lastFailedQuestion = useRef<PendingQuestion | null>(null)

  const mutation = useMutation({
    mutationFn: ({ text }: PendingQuestion) => askQuestion({ question: text, sessionId }),
    onSuccess: (answer, variables) => {
      lastFailedQuestion.current = null
      setErrorMessage(null)
      setMessages((current) =>
        appendMessage(
          markMessageStatus(current, variables.messageId, 'sent'),
          createAssistantMessage(answer),
        ),
      )
    },
    onError: (error, variables) => {
      lastFailedQuestion.current = variables
      setErrorMessage(toUserFacingMessage(error))
      setMessages((current) => markMessageStatus(current, variables.messageId, 'failed'))
    },
  })

  const isSending = mutation.isPending

  const send = useCallback(
    (rawQuestion: string) => {
      const question = rawQuestion.trim()

      if (isSending || question.length < MIN_QUESTION_LENGTH) return

      const userMessage = createUserMessage(question)
      setMessages((current) => appendMessage(current, userMessage))
      setInputValue('')
      setErrorMessage(null)
      mutation.mutate({ text: question, messageId: userMessage.id })
    },
    [isSending, mutation],
  )

  const onSubmit = useCallback(() => {
    send(inputValue)
  }, [inputValue, send])

  const onRetry = useCallback(() => {
    const pending = lastFailedQuestion.current

    if (!pending || isSending) return

    setErrorMessage(null)
    setMessages((current) => markMessageStatus(current, pending.messageId, 'sending'))
    mutation.mutate(pending)
  }, [isSending, mutation])

  const onSuggestionSelect = useCallback(
    (question: string) => {
      send(question)
    },
    [send],
  )

  const onDismissError = useCallback(() => {
    setErrorMessage(null)
  }, [])

  const canSubmit = useMemo(
    () => !isSending && inputValue.trim().length >= MIN_QUESTION_LENGTH,
    [inputValue, isSending],
  )

  return {
    messages,
    inputValue,
    isSending,
    canSubmit,
    errorMessage,
    canRetry: errorMessage !== null && lastFailedQuestion.current !== null,
    onInputChange: setInputValue,
    onSubmit,
    onRetry,
    onSuggestionSelect,
    onDismissError,
  }
}
