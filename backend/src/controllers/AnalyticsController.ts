import type { FastifyReply, FastifyRequest } from 'fastify'
import { parseRequest } from '../api/validation/parseRequest'
import { dashboardAnalyticsQuerySchema } from '../api/validation/schemas'
import type { GetDashboardAnalyticsUseCase } from '../useCases/GetDashboardAnalyticsUseCase'
import { toDashboardAnalyticsResponse } from './presenters/analyticsPresenter'

export class AnalyticsController {
  constructor(private readonly getDashboardAnalytics: GetDashboardAnalyticsUseCase) {}

  handleDashboard = async (request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> => {
    const { period } = parseRequest(dashboardAnalyticsQuerySchema, 'query', request.query)

    const analytics = await this.getDashboardAnalytics.execute({ period })

    return reply.status(200).send({ data: toDashboardAnalyticsResponse(analytics) })
  }
}
