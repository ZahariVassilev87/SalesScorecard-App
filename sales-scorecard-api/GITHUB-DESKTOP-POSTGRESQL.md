# 🐘 PostgreSQL Setup from GitHub Desktop

## 📋 **Current Status**
- ✅ **GitHub Repository**: Updated with PostgreSQL configuration
- ✅ **Prisma Schema**: Configured for PostgreSQL
- ✅ **Database Scripts**: Added setup and migration scripts
- ✅ **Railway Deployment**: Ready for PostgreSQL
- 🔧 **Database**: Needs PostgreSQL setup in Railway

## 🎯 **Step-by-Step PostgreSQL Setup**

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

### **Step 2: Set Environment Variables in Railway**

Go to your service → **"Variables"** tab and add:

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

### **Step 3: Railway Auto-Deploy**

After adding the database and environment variables:
1. **Railway will automatically redeploy** from your GitHub repository
2. **Check deployment logs** for any errors
3. **Wait for deployment to complete**

### **Step 4: Run Database Setup**

After Railway redeploys, you can set up the database in two ways:

#### **Option A: Using Railway Console (Recommended)**

1. **Go to Railway Dashboard**
2. **Click on your service**
3. **Go to "Deployments" tab**
4. **Click on latest deployment**
5. **Go to "Logs" tab**
6. **Run these commands in Railway console**:

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Set up initial data
npm run setup-db
```

#### **Option B: Using API Endpoints**

```bash
# Test database connection
curl https://salesscorecard-app-production.up.railway.app/public-admin/test

# Create default scoring structure
curl -X POST https://salesscorecard-app-production.up.railway.app/public-admin/seed/default

# Create sample data
curl -X POST https://salesscorecard-app-production.up.railway.app/public-admin/seed/sample-data
```

## 🗄️ **Database Schema**

Your PostgreSQL database will include:

### **Core Tables:**
- **users** - User accounts and authentication
- **regions** - Geographic divisions
- **teams** - Sales teams
- **salespeople** - Individual sales reps
- **behavior_categories** - Scoring categories (4 categories)
- **behavior_items** - Individual scoring items (20 items)
- **evaluations** - Performance evaluations
- **evaluation_items** - Individual scores

### **Sample Data Created:**
- **4 Behavior Categories**: Discovery, Solution Positioning, Closing & Next Steps, Professionalism
- **20 Behavior Items**: 5 items per category
- **1 Region**: North America
- **1 Team**: Enterprise Sales
- **3 Salespeople**: John Smith, Sarah Johnson, Mike Davis
- **3 Users**: Admin, Sales Director, Regional Manager

## 🧪 **Testing Your Setup**

### **Step 1: Test Database Connection**
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

### **Step 2: Test Data Endpoints**
```bash
# Check categories
curl https://salesscorecard-app-production.up.railway.app/public-admin/categories

# Check teams
curl https://salesscorecard-app-production.up.railway.app/public-admin/teams

# Check regions
curl https://salesscorecard-app-production.up.railway.app/public-admin/regions
```

### **Step 3: Test iOS App Integration**
1. **Build and run** your iOS app
2. **Test connection** to Railway backend
3. **Verify data loading** (categories, teams, salespeople)
4. **Test evaluation creation**

## 🔧 **Database Scripts Available**

Your GitHub repository now includes:

### **Setup Scripts:**
- `setup-postgresql.js` - Complete database setup
- `setup-env.js` - Environment variable generator
- `validate-env.js` - Environment validation

### **NPM Scripts:**
```bash
npm run setup-db      # Set up database with sample data
npm run db:migrate    # Run Prisma migrations
npm run db:seed       # Seed database with data
npm run setup-env     # Generate environment variables
npm run validate-env  # Validate environment setup
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
1. **Run setup script** after migrations
2. **Check API endpoints** are working
3. **Verify data** is created correctly
4. **Test with curl** commands

## 📊 **Expected Results**

After setup, you should have:

### **Database:**
- ✅ PostgreSQL database running
- ✅ All tables created with relationships
- ✅ Indexes and constraints set
- ✅ Sample data populated

### **API Endpoints:**
- ✅ All endpoints working
- ✅ Database queries successful
- ✅ Data persistence working
- ✅ Real-time updates

### **iOS App:**
- ✅ Connects to Railway backend
- ✅ Loads categories and teams
- ✅ Can create evaluations
- ✅ Analytics dashboard working

## 🚀 **Next Steps**

1. **Add PostgreSQL database** in Railway
2. **Set environment variables**
3. **Wait for auto-deployment**
4. **Run database setup** (Option A or B)
5. **Test all endpoints**
6. **Test iOS app integration**
7. **Create admin user** for testing

## 📞 **Support**

If you encounter issues:
1. **Check Railway logs** in the dashboard
2. **Verify environment variables** are set
3. **Test individual endpoints** with curl
4. **Check database connection** status
5. **Run setup script** manually if needed

---

**Your GitHub repository is ready for PostgreSQL!** Follow the steps above and your database will be production-ready! 🐘
