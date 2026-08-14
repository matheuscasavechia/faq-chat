import type { HealthRepository } from '../repositories/HealthRepository'

export interface HealthReport {
  status: 'ok' | 'degraded'
  uptimeSeconds: number
  database: 'up' | 'down'
  checkedAt: Date
}

export class CheckHealthUseCase {
  constructor(
    private readonly healthRepository: HealthRepository,
    private readonly uptimeProvider: () => number = () => process.uptime(),
  ) {}

  async execute(): Promise<HealthReport> {
    const database = await this.probeDatabase()

    return {
      status: database === 'up' ? 'ok' : 'degraded',
      uptimeSeconds: Math.round(this.uptimeProvider()),
      database,
      checkedAt: new Date(),
    }
  }

  private async probeDatabase(): Promise<'up' | 'down'> {
    try {
      await this.healthRepository.ping()
      return 'up'
    } catch {
      return 'down'
    }
  }
}
