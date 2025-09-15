#!/bin/bash
set -e

echo "🔧 Starting Railway build process..."

echo "📦 Installing dependencies..."
npm ci

echo "🗑️ Cleaning Prisma cache..."
rm -rf node_modules/.prisma

echo "🔨 Generating Prisma client..."
npx prisma generate

echo "📝 Compiling TypeScript..."
npx tsc

echo "✅ Build completed successfully!"