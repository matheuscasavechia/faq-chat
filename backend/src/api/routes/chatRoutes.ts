import type { FastifyInstance } from 'fastify'
import type { ChatController } from '../../controllers/ChatController'

export interface ChatRouteOptions {
  rateLimit: {
    max: number
    windowMs: number
  }
}

export const registerChatRoutes = (
  app: FastifyInstance,
  controller: ChatController,
  { rateLimit }: ChatRouteOptions,
): void => {
  app.post(
    '/chat/query',
    {
      config: {
        rateLimit: {
          max: rateLimit.max,
          timeWindow: rateLimit.windowMs,
        },
      },
    },
    controller.handleQuery,
  )
}
