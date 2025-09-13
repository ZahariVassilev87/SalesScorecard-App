#!/bin/bash

# Railway Deployment Script for Sales Scorecard
# This script helps you deploy to Railway with proper database migration

echo "🚀 Railway Deployment Script for Sales Scorecard"
echo "================================================"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "🔐 Logging into Railway..."
railway login

# Create new project (if not exists)
echo "📦 Creating Railway project..."
railway init

# Add PostgreSQL database
echo "🗄️ Adding PostgreSQL database..."
railway add postgresql

# Set environment variables
echo "⚙️ Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set JWT_SECRET="your-super-secure-jwt-secret-$(date +%s)"
railway variables set SMTP_HOST="smtp.sendgrid.net"
railway variables set SMTP_PORT="587"
railway variables set SMTP_USER="apikey"
railway variables set SMTP_PASS="your-sendgrid-api-key"
railway variables set SMTP_FROM="Sales Scorecard <vassilev.zahari@gmail.com>"
railway variables set SMTP_SECURE="false"
railway variables set SMTP_TLS="true"
railway variables set FRONTEND_URL="https://your-app-name.railway.app"
railway variables set ALLOWED_DOMAINS="instorm.io,instorm.bg,metro.bg,gmail.com"
railway variables set PORT="3000"

echo "📝 Please update the following environment variables in Railway dashboard:"
echo "   - SMTP_PASS: Your SendGrid API key"
echo "   - FRONTEND_URL: Your actual Railway app URL"
echo "   - JWT_SECRET: A secure random string"

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment initiated!"
echo ""
echo "📋 Next steps:"
echo "1. Go to Railway dashboard and update environment variables"
echo "2. Wait for deployment to complete"
echo "3. Run database migrations: railway run npx prisma migrate deploy"
echo "4. Seed the database: railway run npx prisma db seed"
echo "5. Test your API at: https://your-app-name.railway.app/api/docs"
echo ""
echo "🔗 Railway Dashboard: https://railway.app/dashboard"
