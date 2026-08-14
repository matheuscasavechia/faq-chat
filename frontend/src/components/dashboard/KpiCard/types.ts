export type KpiTone = 'neutral' | 'positive' | 'attention'

export interface KpiCardProps {
  label: string
  value: string
  hint?: string
  tone?: KpiTone
  isRefreshing?: boolean
}
