import type { FastifyInstance } from 'fastify'
import { buildApp } from '../../src/app'
import type { AppConfig } from '../../src/config/env'
import { createControllers } from '../../src/composition/createControllers'
import type { Repositories } from '../../src/composition/types'
import {
  InMemoryCategoryRepository,
  InMemoryFaqRepository,
  InMemoryInteractionRepository,
  StubAnalyticsRepository,
  StubHealthRepository,
} from './inMemoryRepositories'
import { buildAnalyticsData, buildConfig, buildFaqCatalog } from './fixtures'

export interface TestAppContext {
  app: FastifyInstance
  repositories: Repositories
}

export const buildTestRepositories = (overrides: Partial<Repositories> = {}): Repositories => ({
  faq: new InMemoryFaqRepository(buildFaqCatalog()),
  interaction: new InMemoryInteractionRepository(),
  category: new InMemoryCategoryRepository([
    { id: 'category-password', name: 'Password', slug: 'password', faqCount: 5 },
    { id: 'category-payments', name: 'Payments', slug: 'payments', faqCount: 6 },
  ]),
  analytics: new StubAnalyticsRepository(buildAnalyticsData()),
  health: new StubHealthRepository(),
  ...overrides,
})

export const buildTestApp = async (
  options: { config?: Partial<AppConfig>; repositories?: Partial<Repositories> } = {},
): Promise<TestAppContext> => {
  const config = buildConfig(options.config)
  const repositories = buildTestRepositories(options.repositories)
  const controllers = createControllers({ config, repositories })
  const app = await buildApp({ config, controllers, logger: false })

  await app.ready()

  return { app, repositories }
}
