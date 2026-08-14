import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify'
import { registerRoutes } from './api/routes'
import type { AppConfig } from './config/env'
import type { Controllers } from './composition/types'
import { API_PREFIX, MAX_REQUEST_BODY_BYTES } from './constants/http'
import { registerErrorHandler } from './middlewares/errorHandler'

export interface BuildAppInput {
  config: AppConfig
  controllers: Controllers
  logger?: FastifyServerOptions['logger']
}

const buildLoggerOptions = (config: AppConfig): FastifyServerOptions['logger'] => {
  if (config.nodeEnv === 'test') return false

  if (config.isProduction) {
    return { level: config.logLevel }
  }

  return {
    level: config.logLevel,
    transport: {
      target: 'pino-pretty',
      options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' },
    },
  }
}

export const buildApp = async ({
  config,
  controllers,
  logger,
}: BuildAppInput): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: logger ?? buildLoggerOptions(config),
    bodyLimit: MAX_REQUEST_BODY_BYTES,
    trustProxy: true,
  })

  await app.register(helmet, { contentSecurityPolicy: false })

  await app.register(cors, {
    origin: config.corsOrigins,
    methods: ['GET', 'POST'],
    maxAge: 86_400,
  })

  await app.register(rateLimit, {
    global: false,
    max: config.chatRateLimit.max,
    timeWindow: config.chatRateLimit.windowMs,
  })

  registerErrorHandler(app)

  await app.register(
    (instance, _options, done) => {
      registerRoutes(instance, controllers, {
        chat: { rateLimit: config.chatRateLimit },
      })
      done()
    },
    { prefix: API_PREFIX },
  )

  return app
}
