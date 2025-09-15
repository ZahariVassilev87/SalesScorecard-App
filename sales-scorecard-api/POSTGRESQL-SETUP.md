# 🐘 PostgreSQL Database Setup for Railway

## 📋 **Current Status**
- ✅ **Prisma Schema**: Configured for PostgreSQL
- ✅ **GitHub Repository**: Updated with all fixes
- ✅ **Railway Deployment**: Ready for PostgreSQL
- 🔧 **Database**: Needs PostgreSQL setup in Railway
- 🔧 **Migrations**: Need to run after database setup

## 🎯 **PostgreSQL Setup Steps**

### **Step 1: Add PostgreSQL Database in Railway**

1. **Go to Railway Dashboard**: [Your Project](https://railway.com/project/be1ac425-cc22-499f-98c3-ff13c8b85c0d/service/f8067bb2-72e1-4c42-838d-a37480b512b1?environmentId=40069d8f-81e0-4723-92cf-cd4caf949252)

2. **Add PostgreSQL Database**:
   - Click **"+ New"** in your project
   - Select **"Database"**
   - Choose **"PostgreSQL"**
   - Railway will automatically:
     - Create PostgreSQL database
     - Set `DATABASE_URL` environment variable
     - Configure connection

### **Step 2: Environment Variables**

Add these environment variables in Railway:

```bash
# Database (Auto-provided by Railway)
DATABASE_URL=postgresql://postgres:password@host:5432/railway

# JWT Secret
JWT_SECRET=sales-scorecard-jwt-secret-2024-production-xyz789

# Application
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://salesscorecard-app-production.up.railway.app

# Security
ALLOWED_DOMAINS=instorm.io,instorm.bg,metro.bg,gmail.com

# Email (Skip for testing)
SKIP_EMAIL=true
```

### **Step 3: Database Migration Commands**

After Railway redeploys with PostgreSQL, run these commands:

#### **Option A: Using Railway Console**
1. Go to Railway dashboard
2. Click on your service
3. Go to "Deployments" tab
4. Click on latest deployment
5. Go to "Logs" tab
6. Run these commands in Railway console:

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed initial data
npx prisma db seed
```

#### **Option B: Using Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Connect to your project
railway link

# Run migrations
railway run npx prisma migrate deploy

# Seed data
railway run npx prisma db seed
```

### **Step 4: Test Database Connection**

```bash
# Test database connection
curl https://salesscorecard-app-production.up.railway.app/public-admin/test

# Test API endpoints
curl https://salesscorecard-app-production.up.railway.app/public-admin/categories
curl https://salesscorecard-app-production.up.railway.app/public-admin/teams
```

## 🗄️ **Database Schema Overview**

Your PostgreSQL database will include these tables:

### **Core Tables:**
- **users** - User accounts and authentication
- **regions** - Geographic or organizational divisions
- **teams** - Groups within regions
- **salespeople** - Individual sales representatives
- **behavior_categories** - Scoring categories
- **behavior_items** - Individual scoring items
- **evaluations** - Sales performance evaluations
- **evaluation_items** - Individual evaluation scores

### **Relationship Tables:**
- **user_regions** - User-region assignments
- **user_teams** - User-team assignments

### **Audit Tables:**
- **audit_logs** - Activity tracking
- **invites** - User invitation system

## 🔧 **Database Configuration**

### **Prisma Configuration:**
```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x", "debian-openssl-1.1.x"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### **Migration Files:**
- `20250114000000_init/` - Initial database schema
- `20250912201959_init/` - Updated schema

## 🧪 **Testing Database Setup**

### **Step 1: Verify Database Connection**
```bash
curl https://salesscorecard-app-production.up.railway.app/public-admin/test
```

**Expected Response:**
```json
{
  "message": "Admin controller is working!",
  "timestamp": "2025-09-15T18:45:00.000Z"
}
```

### **Step 2: Test Data Creation**
```bash
# Create default scoring structure
curl -X POST https://salesscorecard-app-production.up.railway.app/public-admin/seed/default

# Create sample data
curl -X POST https://salesscorecard-app-production.up.railway.app/public-admin/seed/sample-data
```

### **Step 3: Verify Data**
```bash
# Check categories
curl https://salesscorecard-app-production.up.railway.app/public-admin/categories

# Check teams
curl https://salesscorecard-app-production.up.railway.app/public-admin/teams
```

## 🚨 **Troubleshooting**

### **Database Connection Issues:**
1. **Check DATABASE_URL** is set in Railway
2. **Verify PostgreSQL** database is added
3. **Check Railway logs** for connection errors
4. **Wait for deployment** to complete

### **Migration Issues:**
1. **Check Prisma schema** is correct
2. **Verify binary targets** are set
3. **Run migrations** in Railway console
4. **Check database permissions**

### **Data Issues:**
1. **Run seed commands** after migrations
2. **Check API endpoints** are working
3. **Verify data** is created correctly
4. **Test with curl** commands

## 📊 **Expected Results**

After setup, you should have:

### **Database:**
- ✅ PostgreSQL database running
- ✅ All tables created
- ✅ Relationships configured
- ✅ Indexes and constraints set

### **Data:**
- ✅ 4 behavior categories
- ✅ 20 behavior items
- ✅ Sample regions and teams
- ✅ Test salespeople data

### **API:**
- ✅ All endpoints working
- ✅ Database queries successful
- ✅ Data persistence working
- ✅ Real-time updates

## 🚀 **Next Steps**

1. **Add PostgreSQL database** in Railway
2. **Set environment variables**
3. **Wait for auto-deployment**
4. **Run database migrations**
5. **Seed initial data**
6. **Test all endpoints**
7. **Test iOS app integration**

---

**Ready to set up PostgreSQL?** Follow the steps above and your database will be production-ready! 🐘
