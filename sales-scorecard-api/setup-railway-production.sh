#!/bin/bash

# Railway Production Setup Script
# This script helps you set up your Railway backend with PostgreSQL

echo "🚀 Railway Production Setup for Sales Scorecard"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Current Status:${NC}"
echo "✅ App URL: https://salesscorecard-app-production.up.railway.app"
echo "✅ Prisma Schema: Configured for PostgreSQL"
echo "🔧 Database: Currently SQLite (needs PostgreSQL)"
echo "🔧 Environment: Needs production configuration"
echo ""

echo -e "${YELLOW}🎯 Setup Steps:${NC}"
echo ""
echo "1. Add PostgreSQL Database to Railway:"
echo "   - Go to: https://railway.com/project/be1ac425-cc22-499f-98c3-ff13c8b85c0d"
echo "   - Click '+ New' → 'Database' → 'PostgreSQL'"
echo "   - Railway will auto-set DATABASE_URL"
echo ""

echo "2. Set Environment Variables in Railway:"
echo "   Go to your service → 'Variables' tab and add:"
echo ""
echo -e "${GREEN}   Essential Variables:${NC}"
echo "   JWT_SECRET=sales-scorecard-jwt-secret-2024-production-xyz789"
echo "   NODE_ENV=production"
echo "   PORT=3000"
echo "   FRONTEND_URL=https://salesscorecard-app-production.up.railway.app"
echo "   ALLOWED_DOMAINS=instorm.io,instorm.bg,metro.bg,gmail.com"
echo ""

echo -e "${GREEN}   Email Configuration (Choose One):${NC}"
echo "   Option A - SendGrid:"
echo "   SMTP_HOST=smtp.sendgrid.net"
echo "   SMTP_PORT=587"
echo "   SMTP_USER=apikey"
echo "   SMTP_PASS=your-sendgrid-api-key"
echo "   SMTP_FROM=Sales Scorecard <vassilev.zahari@gmail.com>"
echo ""
echo "   Option B - Gmail:"
echo "   SMTP_HOST=smtp.gmail.com"
echo "   SMTP_PORT=587"
echo "   SMTP_USER=your-email@gmail.com"
echo "   SMTP_PASS=your-app-password"
echo "   SMTP_FROM=Sales Scorecard <your-email@gmail.com>"
echo ""
echo "   Option C - Skip Email (Testing):"
echo "   SKIP_EMAIL=true"
echo ""

echo "3. Test Your Setup:"
echo "   After Railway redeploys, test these endpoints:"
echo ""

echo -e "${BLUE}   Test Commands:${NC}"
echo "   curl https://salesscorecard-app-production.up.railway.app/"
echo "   curl https://salesscorecard-app-production.up.railway.app/public-admin/test"
echo "   curl https://salesscorecard-app-production.up.railway.app/public-admin/categories"
echo ""

echo "4. Seed Initial Data:"
echo "   curl -X POST https://salesscorecard-app-production.up.railway.app/public-admin/seed/default"
echo "   curl -X POST https://salesscorecard-app-production.up.railway.app/public-admin/seed/sample-data"
echo ""

echo -e "${YELLOW}🧪 Testing Checklist:${NC}"
echo "□ PostgreSQL database added to Railway"
echo "□ Environment variables configured"
echo "□ App redeployed successfully"
echo "□ Health endpoint responding"
echo "□ API documentation accessible"
echo "□ Admin panel working"
echo "□ Sample data created"
echo "□ iOS app connects successfully"
echo ""

echo -e "${GREEN}🚀 Ready to Set Up!${NC}"
echo "Follow the steps above to configure your Railway backend."
echo "Once setup is complete, your iOS app will be ready to use!"
echo ""

echo -e "${BLUE}📞 Need Help?${NC}"
echo "If you encounter issues:"
echo "1. Check Railway logs in the dashboard"
echo "2. Verify environment variables are set"
echo "3. Test individual endpoints with curl"
echo "4. Check database connection status"
echo ""

echo "Happy coding! 🎉"
