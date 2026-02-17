#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy
echo "Migrations applied successfully."

echo "Starting application..."
exec node server.js
