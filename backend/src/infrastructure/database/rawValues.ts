import { Prisma } from '@prisma/client'

export const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value === 'bigint') return Number(value)
  if (Prisma.Decimal.isDecimal(value)) return value.toNumber()

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

export const toNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) return null
  return toNumber(value)
}

export const toDate = (value: unknown): Date => {
  if (value instanceof Date) return value
  if (typeof value === 'string' || typeof value === 'number') return new Date(value)

  throw new TypeError('Expected a date value from the database.')
}

export const toNullableDate = (value: unknown): Date | null => {
  if (value === null || value === undefined) return null
  return toDate(value)
}
