import { runSeed } from '../src/infrastructure/database/seed/runSeed'

void runSeed().catch((error: unknown) => {
  process.stderr.write(`Seed failed: ${String(error)}\n`)
  process.exit(1)
})
