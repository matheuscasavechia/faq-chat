import type { AppConfig } from '../config/env'
import { AnalyticsController } from '../controllers/AnalyticsController'
import { CategoryController } from '../controllers/CategoryController'
import { ChatController } from '../controllers/ChatController'
import { FaqController } from '../controllers/FaqController'
import { HealthController } from '../controllers/HealthController'
import { AskQuestionUseCase } from '../useCases/AskQuestionUseCase'
import { CheckHealthUseCase } from '../useCases/CheckHealthUseCase'
import { GetDashboardAnalyticsUseCase } from '../useCases/GetDashboardAnalyticsUseCase'
import { ListCategoriesUseCase } from '../useCases/ListCategoriesUseCase'
import { ListFaqsUseCase } from '../useCases/ListFaqsUseCase'
import type { Controllers, Repositories } from './types'

export interface CreateControllersInput {
  config: AppConfig
  repositories: Repositories
}

export const createControllers = ({
  config,
  repositories,
}: CreateControllersInput): Controllers => ({
  chat: new ChatController(
    new AskQuestionUseCase(repositories.faq, repositories.interaction, {
      similarityThreshold: config.faq.similarityThreshold,
      suggestionThreshold: config.faq.suggestionThreshold,
      maxCandidates: config.faq.maxCandidates,
    }),
  ),
  analytics: new AnalyticsController(new GetDashboardAnalyticsUseCase(repositories.analytics)),
  faq: new FaqController(new ListFaqsUseCase(repositories.faq)),
  category: new CategoryController(new ListCategoriesUseCase(repositories.category)),
  health: new HealthController(new CheckHealthUseCase(repositories.health)),
})
