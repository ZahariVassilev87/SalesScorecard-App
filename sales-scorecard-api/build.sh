#!/bin/bash

echo "🔧 Building Sales Scorecard API..."

# Set default DATABASE_URL if not provided
export DATABASE_URL=${DATABASE_URL:-"file:./dev.db"}

echo "📊 Database URL: $DATABASE_URL"

# First, apply database schema changes
echo "🔄 Applying database schema changes..."
if [[ $DATABASE_URL == postgresql* ]]; then
    echo "🐘 Using PostgreSQL - running migrations..."
    npx prisma migrate deploy || echo "⚠️ Migration failed, continuing..."
else
    echo "🗃️ Using SQLite - pushing schema..."
    npx prisma db push || echo "⚠️ Schema push failed, continuing..."
fi

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Build TypeScript
echo "🏗️ Building TypeScript..."
npx tsc

echo "🎉 Build completed successfully!"
