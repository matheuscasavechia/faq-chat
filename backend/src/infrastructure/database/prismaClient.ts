import { PrismaClient } from '@prisma/client'
import type { AppConfig } from '../../config/env'

export const createPrismaClient = (config: AppConfig): PrismaClient =>
  new PrismaClient({
    datasources: { db: { url: config.databaseUrl } },
    log: ['warn', 'error'],
  })
