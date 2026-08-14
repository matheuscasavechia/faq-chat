#!/bin/sh
set -e

if [ "$RUN_MIGRATIONS_ON_START" = "true" ]; then
  echo "[entrypoint] applying database migrations"
  ./node_modules/.bin/prisma migrate deploy
fi

if [ "$SEED_ON_START" = "true" ]; then
  echo "[entrypoint] seeding database (idempotent)"
  node dist/infrastructure/database/seed/runSeed.js
fi

echo "[entrypoint] starting api"
exec node dist/server.js
