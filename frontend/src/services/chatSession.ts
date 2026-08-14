const SESSION_ID_PREFIX = 'web'

const randomSuffix = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 1_000_000).toString(36)}`
}

export const createSessionId = (): string => `${SESSION_ID_PREFIX}-${randomSuffix()}`.slice(0, 64)

let messageSequence = 0

export const createMessageId = (author: string): string => {
  messageSequence += 1
  return `${author}-${messageSequence}-${randomSuffix().slice(0, 8)}`
}
