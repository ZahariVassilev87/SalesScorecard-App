#!/bin/bash
set -e

echo "🚀 Starting Railway build process..."

echo "📦 Generating Prisma client..."
npx prisma generate

echo "🔨 Compiling TypeScript..."
npx tsc

echo "✅ Build completed successfully!"