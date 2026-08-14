import type { FastifyInstance } from 'fastify'
import type { CategoryController } from '../../controllers/CategoryController'

export const registerCategoryRoutes = (
  app: FastifyInstance,
  controller: CategoryController,
): void => {
  app.get('/categories', controller.handleList)
}
