import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CheckHealthUseCase } from '../useCases/CheckHealthUseCase'

export class HealthController {
  constructor(private readonly checkHealth: CheckHealthUseCase) {}

  handleCheck = async (_request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> => {
    const report = await this.checkHealth.execute()

    return reply.status(report.status === 'ok' ? 200 : 503).send({
      data: {
        status: report.status,
        database: report.database,
        uptimeSeconds: report.uptimeSeconds,
        checkedAt: report.checkedAt.toISOString(),
      },
    })
  }
}
