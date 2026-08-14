import type { FastifyInstance } from 'fastify'
import type { AnalyticsController } from '../../controllers/AnalyticsController'

export const registerAnalyticsRoutes = (
  app: FastifyInstance,
  controller: AnalyticsController,
): void => {
  app.get('/analytics/dashboard', controller.handleDashboard)
}
