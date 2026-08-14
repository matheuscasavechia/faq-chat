import type { PrismaClient } from '@prisma/client'
import { PrismaAnalyticsRepository } from '../infrastructure/repositories/PrismaAnalyticsRepository'
import { PrismaCategoryRepository } from '../infrastructure/repositories/PrismaCategoryRepository'
import { PrismaFaqRepository } from '../infrastructure/repositories/PrismaFaqRepository'
import { PrismaHealthRepository } from '../infrastructure/repositories/PrismaHealthRepository'
import { PrismaInteractionRepository } from '../infrastructure/repositories/PrismaInteractionRepository'
import type { Repositories } from './types'

export const createPrismaRepositories = (prisma: PrismaClient): Repositories => ({
  faq: new PrismaFaqRepository(prisma),
  interaction: new PrismaInteractionRepository(prisma),
  category: new PrismaCategoryRepository(prisma),
  analytics: new PrismaAnalyticsRepository(prisma),
  health: new PrismaHealthRepository(prisma),
})
