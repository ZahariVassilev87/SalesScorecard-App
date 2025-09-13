# 🚀 Production Deployment Guide

## Database Migration from SQLite to PostgreSQL

### 1. 🗄️ Choose Your Production Database Provider

**Recommended Options:**

#### Option A: AWS RDS PostgreSQL
```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier sales-scorecard-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password YourSecurePassword123! \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxxxxxx
```

#### Option B: Railway (Easiest)
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL database
4. Copy connection string

#### Option C: Render
1. Go to [render.com](https://render.com)
2. Create PostgreSQL database
3. Copy connection string

#### Option D: Google Cloud SQL
```bash
gcloud sql instances create sales-scorecard-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=us-central1
```

### 2. 🔧 Update Environment Variables

Create `.env.production` with your database URL:

```bash
# Database - Replace with your actual PostgreSQL URL
DATABASE_URL="postgresql://username:password@your-db-host:5432/sales_scorecard"

# JWT - Generate a secure secret
JWT_SECRET="your-super-secure-jwt-secret-for-production"

# Email Configuration
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
SMTP_FROM="Sales Scorecard <your-email@yourdomain.com>"

# Frontend URL
FRONTEND_URL="https://your-production-domain.com"

# Allowed domains
ALLOWED_DOMAINS="instorm.io,instorm.bg,metro.bg,yourdomain.com"

# Server
PORT="3000"
NODE_ENV="production"
```

### 3. 📦 Database Migration Steps

#### Step 1: Export Current SQLite Data
```bash
# Export data from SQLite
npx prisma db pull
npx prisma generate

# Create data export script
node scripts/export-data.js
```

#### Step 2: Switch to PostgreSQL Schema
```bash
# Copy production schema
cp prisma/schema.production.prisma prisma/schema.prisma

# Install PostgreSQL client
npm install pg @types/pg
```

#### Step 3: Deploy to Production Database
```bash
# Set production environment
export NODE_ENV=production

# Run migrations
npx prisma migrate deploy

# Generate client
npx prisma generate

# Seed production data
npx prisma db seed
```

### 4. 🚀 Production Deployment Options

#### Option A: Railway (Recommended for simplicity)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Option B: Render
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

#### Option C: AWS EC2
```bash
# Install dependencies
sudo apt update
sudo apt install nodejs npm postgresql-client

# Clone and setup
git clone your-repo
cd sales-scorecard-api
npm install
npm run build

# Setup PM2 for process management
npm install -g pm2
pm2 start dist/main.js --name sales-scorecard
pm2 startup
pm2 save
```

#### Option D: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

### 5. 🔒 Security Checklist

- [ ] **Database Security**
  - [ ] Use strong passwords
  - [ ] Enable SSL connections
  - [ ] Restrict database access by IP
  - [ ] Regular backups

- [ ] **Application Security**
  - [ ] Strong JWT secret
  - [ ] HTTPS enabled
  - [ ] Environment variables secured
  - [ ] Rate limiting enabled

- [ ] **Email Security**
  - [ ] SendGrid API key secured
  - [ ] Domain verification
  - [ ] SPF/DKIM records

### 6. 📊 Monitoring & Backup

#### Database Backups
```bash
# Automated daily backups
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup_20240913.sql
```

#### Application Monitoring
```bash
# Install monitoring
npm install @sentry/node

# Setup logging
npm install winston
```

### 7. 🧪 Testing Production Setup

```bash
# Test database connection
npx prisma db pull

# Test API endpoints
curl https://your-domain.com/api/docs

# Test authentication
curl -X POST https://your-domain.com/auth/magic-link \
  -H "Content-Type: application/json" \
  -d '{"email":"test@yourdomain.com"}'
```

## 🎯 Production Readiness Checklist

- [ ] PostgreSQL database configured
- [ ] Environment variables set
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Email service working
- [ ] Database backups scheduled
- [ ] Monitoring setup
- [ ] Error tracking configured
- [ ] Performance monitoring
- [ ] Security headers configured

## 🆘 Rollback Plan

If issues occur:
1. Switch back to SQLite schema
2. Restore from backup
3. Update environment variables
4. Redeploy application

## 📞 Support

For production deployment assistance:
- Check logs: `pm2 logs sales-scorecard`
- Database issues: Check connection string
- Email issues: Verify SendGrid configuration
- Performance: Monitor database queries
