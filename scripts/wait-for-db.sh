#!/bin/sh
# Wait until Postgres is ready using pg_isready, then run migrations and exec the command
set -e

DB_HOST=${DB_HOST:-db}
DB_PORT=${DB_PORT:-5432}
RETRIES=${RETRIES:-30}
SLEEP=${SLEEP:-1}
RUN_SEED=${RUN_SEED:-false}

i=0
echo "Waiting for Postgres at ${DB_HOST}:${DB_PORT}..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" >/dev/null 2>&1; do
  i=$((i+1))
  if [ "$i" -ge "$RETRIES" ]; then
    echo "Timed out waiting for Postgres at $DB_HOST:$DB_PORT"
    exit 1
  fi
  echo "Postgres not ready yet... ($i/$RETRIES)"
  sleep "$SLEEP"
done

echo "Postgres is ready — running migrations"
# Run Prisma migrations (deploy for prod-safe behavior). Ignore failures so dev can continue.
if command -v npx >/dev/null 2>&1; then
  npx prisma migrate deploy || true
fi

# Optionally run seed after migrations if RUN_SEED is truthy
if [ "$RUN_SEED" = "true" ] || [ "$RUN_SEED" = "1" ]; then
  echo "RUN_SEED is set — running seed script"
  # try yarn first, fallback to npx ts-node
  if command -v yarn >/dev/null 2>&1; then
    yarn seed || true
  else
    npx ts-node prisma/seed.ts || true
  fi
fi

# Exec the original command (start the app)
exec "$@"
