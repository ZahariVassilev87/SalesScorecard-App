#!/bin/bash

# Set default DATABASE_URL if not provided
export DATABASE_URL=${DATABASE_URL:-"file:./dev.db"}

# Run Prisma database push
echo "Setting up database with URL: $DATABASE_URL"
npx prisma db push

# Start the application
echo "Starting application..."
npm run start:dev
