const integerFormatter = new Intl.NumberFormat('en-US')
const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 1,
})
const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})
const timeFormatter = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' })

export const formatInteger = (value: number): string => integerFormatter.format(value)

export const formatPercent = (ratio: number): string => percentFormatter.format(ratio)

export const formatDateTime = (value: Date): string => dateTimeFormatter.format(value)

export const formatTime = (value: Date): string => timeFormatter.format(value)

export const formatRelativeDay = (value: Date, now: Date = new Date()): string => {
  const days = Math.floor((now.getTime() - value.getTime()) / (24 * 60 * 60 * 1000))

  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`

  return formatDateTime(value)
}
