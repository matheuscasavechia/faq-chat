import { z } from 'zod'

const csvToList = (value: string): string[] =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3333),
    HOST: z.string().min(1).default('0.0.0.0'),
    DATABASE_URL: z
      .string()
      .min(1)
      .refine(
        (value) => value.startsWith('postgres://') || value.startsWith('postgresql://'),
        'DATABASE_URL must be a PostgreSQL connection string',
      ),
    CORS_ORIGIN: z.string().min(1).default('http://localhost:5173'),
    FAQ_SIMILARITY_THRESHOLD: z.coerce.number().min(0).max(1).default(0.3),
    FAQ_SUGGESTION_THRESHOLD: z.coerce.number().min(0).max(1).default(0.15),
    FAQ_MAX_ANSWER_CANDIDATES: z.coerce.number().int().min(1).max(10).default(3),
    CHAT_RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(30),
    CHAT_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1000).default(60_000),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
  })
  .refine(
    (value) => value.FAQ_SUGGESTION_THRESHOLD <= value.FAQ_SIMILARITY_THRESHOLD,
    'FAQ_SUGGESTION_THRESHOLD must be lower than or equal to FAQ_SIMILARITY_THRESHOLD',
  )

type RawEnv = z.infer<typeof envSchema>

export interface AppConfig {
  nodeEnv: RawEnv['NODE_ENV']
  isProduction: boolean
  port: number
  host: string
  databaseUrl: string
  corsOrigins: string[]
  logLevel: RawEnv['LOG_LEVEL']
  faq: {
    similarityThreshold: number
    suggestionThreshold: number
    maxCandidates: number
  }
  chatRateLimit: {
    max: number
    windowMs: number
  }
}

export class EnvironmentValidationError extends Error {
  constructor(readonly issues: string[]) {
    super(`Invalid environment configuration:\n- ${issues.join('\n- ')}`)
    this.name = 'EnvironmentValidationError'
  }
}

export const loadConfig = (source: NodeJS.ProcessEnv = process.env): AppConfig => {
  const parsed = envSchema.safeParse(source)

  if (!parsed.success) {
    throw new EnvironmentValidationError(
      parsed.error.issues.map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`),
    )
  }

  const env = parsed.data

  return {
    nodeEnv: env.NODE_ENV,
    isProduction: env.NODE_ENV === 'production',
    port: env.PORT,
    host: env.HOST,
    databaseUrl: env.DATABASE_URL,
    corsOrigins: csvToList(env.CORS_ORIGIN),
    logLevel: env.LOG_LEVEL,
    faq: {
      similarityThreshold: env.FAQ_SIMILARITY_THRESHOLD,
      suggestionThreshold: env.FAQ_SUGGESTION_THRESHOLD,
      maxCandidates: env.FAQ_MAX_ANSWER_CANDIDATES,
    },
    chatRateLimit: {
      max: env.CHAT_RATE_LIMIT_MAX,
      windowMs: env.CHAT_RATE_LIMIT_WINDOW_MS,
    },
  }
}
