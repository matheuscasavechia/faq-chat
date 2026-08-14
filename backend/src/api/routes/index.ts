import type { FastifyInstance } from 'fastify'
import type { Controllers } from '../../composition/types'
import { registerAnalyticsRoutes } from './analyticsRoutes'
import { registerCategoryRoutes } from './categoryRoutes'
import { registerChatRoutes } from './chatRoutes'
import { registerFaqRoutes } from './faqRoutes'
import { registerHealthRoutes } from './healthRoutes'
import type { ChatRouteOptions } from './chatRoutes'

export interface RegisterRoutesOptions {
  chat: ChatRouteOptions
}

export const registerRoutes = (
  app: FastifyInstance,
  controllers: Controllers,
  options: RegisterRoutesOptions,
): void => {
  registerHealthRoutes(app, controllers.health)
  registerChatRoutes(app, controllers.chat, options.chat)
  registerAnalyticsRoutes(app, controllers.analytics)
  registerFaqRoutes(app, controllers.faq)
  registerCategoryRoutes(app, controllers.category)
}
