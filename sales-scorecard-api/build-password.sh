#!/bin/bash

echo "🔐 Building Sales Scorecard API with Password Authentication v3.0.0"
echo "================================================================"

# Generate Prisma client with new password field
echo "📦 Generating Prisma client..."
npx prisma generate

# Compile TypeScript
echo "🔨 Compiling TypeScript..."
npx tsc

echo "✅ Build completed successfully!"
echo "🚀 Ready for deployment with password authentication"
