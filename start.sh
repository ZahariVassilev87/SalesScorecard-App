#!/bin/bash

# Set default DATABASE_URL if not provided (PostgreSQL for production)
export DATABASE_URL=${DATABASE_URL:-"postgresql://user:password@localhost:5432/salesscorecard"}

# Run Prisma database migrations
echo "Setting up database with URL: $DATABASE_URL"
npx prisma migrate deploy

# Start the application
echo "Starting application..."
npm run start:dev
