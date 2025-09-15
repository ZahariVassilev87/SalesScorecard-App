#!/bin/bash
set -e

echo "Starting Sales Scorecard application..."

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Verify database connection
echo "Verifying database connection..."
npx prisma db push --accept-data-loss

# Start the application
echo "Starting NestJS application..."
exec node dist/main.js