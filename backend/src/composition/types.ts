import type { AnalyticsController } from '../controllers/AnalyticsController'
import type { CategoryController } from '../controllers/CategoryController'
import type { ChatController } from '../controllers/ChatController'
import type { FaqController } from '../controllers/FaqController'
import type { HealthController } from '../controllers/HealthController'
import type { AnalyticsRepository } from '../repositories/AnalyticsRepository'
import type { CategoryRepository } from '../repositories/CategoryRepository'
import type { FaqRepository } from '../repositories/FaqRepository'
import type { HealthRepository } from '../repositories/HealthRepository'
import type { InteractionRepository } from '../repositories/InteractionRepository'

export interface Repositories {
  faq: FaqRepository
  interaction: InteractionRepository
  category: CategoryRepository
  analytics: AnalyticsRepository
  health: HealthRepository
}

export interface Controllers {
  chat: ChatController
  analytics: AnalyticsController
  faq: FaqController
  category: CategoryController
  health: HealthController
}
