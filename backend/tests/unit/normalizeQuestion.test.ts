import { describe, expect, it } from 'vitest'
import { normalizeQuestion } from '../../src/domain/question/normalizeQuestion'

describe('normalizeQuestion', () => {
  it('trims, lowercases and collapses repeated whitespace', () => {
    expect(normalizeQuestion('   How   do I   RESET my Password?  ')).toBe(
      'how do i reset my password',
    )
  })

  it('removes diacritics so accented and unaccented questions match', () => {
    expect(normalizeQuestion('Como altero minha senha?')).toBe('como altero minha senha')
    expect(normalizeQuestion('Cómo altèro minha senhá')).toBe('como altero minha senha')
  })

  it('drops punctuation without splitting contractions', () => {
    expect(normalizeQuestion("I can't log in — why?")).toBe('i cant log in why')
  })

  it('keeps digits that carry meaning', () => {
    expect(normalizeQuestion('How do I enable 2 factor authentication?')).toBe(
      'how do i enable 2 factor authentication',
    )
  })

  it('is idempotent', () => {
    const once = normalizeQuestion('Where are my INVOICES?!')
    expect(normalizeQuestion(once)).toBe(once)
  })

  it('returns an empty string for input without letters or digits', () => {
    expect(normalizeQuestion('???  ...')).toBe('')
  })
})
