#!/bin/bash

# Set default DATABASE_URL if not provided
export DATABASE_URL=${DATABASE_URL:-"file:./dev.db"}

echo "🚀 Starting Sales Scorecard API..."
echo "📊 Database URL: $DATABASE_URL"

# Check if we're using PostgreSQL or SQLite
if [[ $DATABASE_URL == postgresql* ]]; then
    echo "🐘 Using PostgreSQL database"
    echo "🔄 Running Prisma migrations..."
    npx prisma migrate deploy
else
    echo "🗃️ Using SQLite database"
    echo "🔄 Pushing schema changes..."
    npx prisma db push
fi

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🏃 Starting the application..."
npm run start:prod
