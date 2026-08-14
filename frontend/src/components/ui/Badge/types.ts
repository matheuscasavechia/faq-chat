import type { ReactNode } from 'react'

export type BadgeTone = 'neutral' | 'accent' | 'positive' | 'attention'

export interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
  title?: string
}
