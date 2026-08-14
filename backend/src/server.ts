import 'dotenv/config'
import { buildApp } from './app'
import { EnvironmentValidationError, loadConfig } from './config/env'
import { createControllers } from './composition/createControllers'
import { createPrismaRepositories } from './composition/createRepositories'
import { createPrismaClient } from './infrastructure/database/prismaClient'

const SHUTDOWN_SIGNALS = ['SIGINT', 'SIGTERM'] as const

const start = async (): Promise<void> => {
  const config = loadConfig()
  const prisma = createPrismaClient(config)
  const repositories = createPrismaRepositories(prisma)
  const controllers = createControllers({ config, repositories })
  const app = await buildApp({ config, controllers })

  const shutdown = async (signal: string): Promise<void> => {
    app.log.info({ signal }, 'shutting down')
    await app.close()
    await prisma.$disconnect()
    process.exit(0)
  }

  for (const signal of SHUTDOWN_SIGNALS) {
    process.once(signal, () => {
      void shutdown(signal)
    })
  }

  await app.listen({ port: config.port, host: config.host })
}

void start().catch((error: unknown) => {
  if (error instanceof EnvironmentValidationError) {
    process.stderr.write(`${error.message}\n`)
    process.exit(1)
  }

  process.stderr.write(`Failed to start the API: ${String(error)}\n`)
  process.exit(1)
})
