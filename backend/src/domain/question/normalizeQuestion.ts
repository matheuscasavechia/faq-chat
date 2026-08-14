const COMBINING_MARKS = /[\u0300-\u036f]/g
const APOSTROPHES = /['\u2019`\u00b4]/g
const NON_ALPHANUMERIC = /[^\p{L}\p{N}\s]/gu
const REPEATED_WHITESPACE = /\s+/g

export const normalizeQuestion = (rawQuestion: string): string =>
  rawQuestion
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .replace(APOSTROPHES, '')
    .replace(NON_ALPHANUMERIC, ' ')
    .replace(REPEATED_WHITESPACE, ' ')
    .trim()
