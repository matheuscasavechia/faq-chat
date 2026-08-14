import type { ReactNode } from 'react'

export type StateMessageTone = 'neutral' | 'error'

export interface StateMessageProps {
  tone?: StateMessageTone
  title: string
  description?: string
  icon?: string
  action?: ReactNode
  compact?: boolean
}
