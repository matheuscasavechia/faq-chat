import { describe, expect, it } from 'vitest'
import { EnvironmentValidationError, loadConfig } from '../../src/config/env'

const validEnv = {
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/faq_chatbot?schema=public',
}

describe('loadConfig', () => {
  it('applies documented defaults', () => {
    const config = loadConfig(validEnv)

    expect(config.port).toBe(3333)
    expect(config.faq.similarityThreshold).toBe(0.3)
    expect(config.corsOrigins).toEqual(['http://localhost:5173'])
  })

  it('parses a comma separated list of allowed origins', () => {
    const config = loadConfig({
      ...validEnv,
      CORS_ORIGIN: 'http://localhost:5173, https://app.example.com',
    })

    expect(config.corsOrigins).toEqual(['http://localhost:5173', 'https://app.example.com'])
  })

  it('fails fast when the database url is missing', () => {
    expect(() => loadConfig({})).toThrow(EnvironmentValidationError)
  })

  it('rejects a similarity threshold outside the valid range', () => {
    expect(() => loadConfig({ ...validEnv, FAQ_SIMILARITY_THRESHOLD: '1.4' })).toThrow(
      EnvironmentValidationError,
    )
  })

  it('rejects a suggestion threshold above the answer threshold', () => {
    expect(() =>
      loadConfig({
        ...validEnv,
        FAQ_SIMILARITY_THRESHOLD: '0.3',
        FAQ_SUGGESTION_THRESHOLD: '0.5',
      }),
    ).toThrow(EnvironmentValidationError)
  })
})
