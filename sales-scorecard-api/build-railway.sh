#!/bin/bash
set -e

echo "🚀 Starting Railway build process..."

echo "📦 Installing dependencies..."
npm ci

echo "🗑️ Aggressively cleaning Prisma cache..."
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma
rm -rf .prisma

echo "🔨 Generating Prisma client..."
npx prisma generate

echo "📝 Compiling TypeScript..."
npx tsc

echo "✅ Build completed successfully!"
