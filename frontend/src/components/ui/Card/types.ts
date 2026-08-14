import type { ReactNode } from 'react'

export interface CardProps {
  title?: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  as?: 'section' | 'article' | 'div'
}
