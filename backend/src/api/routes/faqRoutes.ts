import type { FastifyInstance } from 'fastify'
import type { FaqController } from '../../controllers/FaqController'

export const registerFaqRoutes = (app: FastifyInstance, controller: FaqController): void => {
  app.get('/faqs', controller.handleList)
}
