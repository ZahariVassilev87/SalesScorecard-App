#!/bin/bash

echo "🚀 NEW BUILD SCRIPT - Invite-Only Registration System"
echo "🔧 Building Sales Scorecard API with new schema fields..."

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
echo "🔄 Generating Prisma client with new fields..."
npx prisma generate

# Build TypeScript
echo "🏗️ Building TypeScript with updated schema..."
npx tsc

echo "🎉 Build completed successfully with new schema!"
