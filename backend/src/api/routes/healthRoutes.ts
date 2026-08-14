import type { FastifyInstance } from 'fastify'
import type { HealthController } from '../../controllers/HealthController'

export const registerHealthRoutes = (app: FastifyInstance, controller: HealthController): void => {
  app.get('/health', controller.handleCheck)
}
