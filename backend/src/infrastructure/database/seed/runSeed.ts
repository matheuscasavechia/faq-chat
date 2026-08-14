import 'dotenv/config'
import { loadConfig } from '../../../config/env'
import { createPrismaClient } from '../prismaClient'
import { seedDatabase } from './seedDatabase'

export const runSeed = async (): Promise<void> => {
  const config = loadConfig()
  const prisma = createPrismaClient(config)

  try {
    const summary = await seedDatabase(prisma)
    process.stdout.write(
      `Seed finished: ${summary.categories} categories, ${summary.faqs} FAQs, ` +
        `${summary.interactionsCreated} historical interactions created.\n`,
    )
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  void runSeed().catch((error: unknown) => {
    process.stderr.write(`Seed failed: ${String(error)}\n`)
    process.exit(1)
  })
}
