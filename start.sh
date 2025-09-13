#!/bin/bash

# Set default DATABASE_URL if not provided (SQLite for now, PostgreSQL when available)
export DATABASE_URL=${DATABASE_URL:-"file:./dev.db"}

echo "Setting up database with URL: $DATABASE_URL"

# Check if we have a PostgreSQL URL (Railway will provide this)
if [[ $DATABASE_URL == postgresql* ]]; then
    echo "Using PostgreSQL database - running migrations..."
    npx prisma migrate deploy
else
    echo "Using SQLite database - pushing schema..."
    npx prisma db push
fi

# Start the application
echo "Starting application..."
npm run start:dev
