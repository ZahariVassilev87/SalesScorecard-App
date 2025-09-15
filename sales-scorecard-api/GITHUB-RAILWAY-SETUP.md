# 🚀 GitHub → Railway Production Setup

## 📋 **Current Status**
- ✅ **GitHub Repository**: https://github.com/ZahariVassilev87/SalesScorecard-App.git
- ✅ **Branch**: `railway-deploy` (latest changes pushed)
- ✅ **Railway URL**: https://salesscorecard-app-production.up.railway.app
- ✅ **Code Updated**: All fixes and improvements committed
- 🔧 **Database**: Needs PostgreSQL setup
- 🔧 **Environment**: Needs production configuration

## 🎯 **Railway Setup Steps**

### **Step 1: Add PostgreSQL Database**

1. **Go to Railway Dashboard**: [Your Project](https://railway.com/project/be1ac425-cc22-499f-98c3-ff13c8b85c0d/service/f8067bb2-72e1-4c42-838d-a37480b512b1?environmentId=40069d8f-81e0-4723-92cf-cd4caf949252)

2. **Add PostgreSQL Database**:
   - Click **"+ New"** in your project
   - Select **"Database"**
   - Choose **"PostgreSQL"**
   - Railway will automatically:
     - Create PostgreSQL database
     - Set `DATABASE_URL` environment variable
     - Configure connection

### **Step 2: Configure Environment Variables**

In your Railway service, go to **"Variables"** tab and add:

#### **Essential Variables:**
```bash
# Database (Auto-provided by Railway)
DATABASE_URL=postgresql://postgres:password@host:5432/railway

# JWT Secret (Generate a secure one)
JWT_SECRET=sales-scorecard-jwt-secret-2024-production-xyz789

# Application
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://salesscorecard-app-production.up.railway.app

# Security
ALLOWED_DOMAINS=instorm.io,instorm.bg,metro.bg,gmail.com
```

#### **Email Configuration (Choose One):**

**Option A: SendGrid (Recommended)**
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=Sales Scorecard <vassilev.zahari@gmail.com>
```

**Option B: Gmail**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Sales Scorecard <your-email@gmail.com>
```

**Option C: Skip Email (For Testing)**
```bash
SKIP_EMAIL=true
```

### **Step 3: Railway Will Auto-Deploy**

After adding the database and environment variables:
1. **Railway will automatically redeploy** from your GitHub repository
2. **Check deployment logs** for any errors
3. **Wait for deployment to complete**

### **Step 4: Test Your Setup**

#### **Test Database Connection:**
```bash
curl https://salesscorecard-app-production.up.railway.app/public-admin/test
```

#### **Test API Endpoints:**
```bash
# Health check
curl https://salesscorecard-app-production.up.railway.app/

# API documentation
# Visit: https://salesscorecard-app-production.up.railway.app/api/docs

# Admin panel
# Visit: https://salesscorecard-app-production.up.railway.app/public-admin/panel
```

#### **Seed Initial Data:**
```bash
# Create default scoring structure
curl -X POST https://salesscorecard-app-production.up.railway.app/public-admin/seed/default

# Create sample data
curl -X POST https://salesscorecard-app-production.up.railway.app/public-admin/seed/sample-data
```

## 🔧 **What's Been Fixed in GitHub**

### **Backend Improvements:**
- ✅ **Fixed bcryptjs dependencies** - Removed duplicate bcrypt
- ✅ **Added proper Prisma binary targets** - For Railway compatibility
- ✅ **Simplified build configuration** - Cleaner deployment process
- ✅ **Added health check endpoint** - For monitoring
- ✅ **Updated Railway configuration** - Optimized for production

### **iOS App Updates:**
- ✅ **Fixed Railway URL** - Updated to correct production endpoint
- ✅ **Production mode enabled** - Ready for live deployment
- ✅ **All API endpoints configured** - Full backend integration

### **Documentation Added:**
- ✅ **Complete setup guides** - Step-by-step instructions
- ✅ **Testing procedures** - Comprehensive testing plans
- ✅ **Troubleshooting guides** - Common issues and solutions
- ✅ **Environment configuration** - Production-ready setup

## 🧪 **Testing Checklist**

### **Backend Setup**
- [ ] PostgreSQL database added to Railway
- [ ] Environment variables configured
- [ ] App redeployed successfully (from GitHub)
- [ ] Database migrations completed
- [ ] Health endpoint responding

### **API Testing**
- [ ] Root endpoint working
- [ ] API documentation accessible
- [ ] Admin panel working
- [ ] Database connection successful
- [ ] Sample data created

### **iOS App Integration**
- [ ] iOS app connects to Railway
- [ ] Authentication endpoints working
- [ ] Data loading correctly
- [ ] Evaluation system functional
- [ ] Analytics dashboard working

## 🚨 **Troubleshooting**

### **If Deployment Fails:**
1. **Check Railway logs** in the dashboard
2. **Verify environment variables** are set correctly
3. **Check GitHub repository** is connected properly
4. **Ensure branch** is set to `railway-deploy`

### **If Database Issues:**
1. **Verify PostgreSQL** is added to Railway
2. **Check DATABASE_URL** is set automatically
3. **Wait for deployment** to complete
4. **Test database connection** with curl

### **If API Not Working:**
1. **Check deployment status** in Railway
2. **Verify all environment variables** are set
3. **Test individual endpoints** with curl
4. **Check Railway logs** for errors

## 📊 **Expected Results**

After setup, you should have:

### **Backend (Railway)**
- ✅ PostgreSQL database running
- ✅ All environment variables set
- ✅ App running in production mode
- ✅ All API endpoints working
- ✅ Database migrations completed

### **Data Available**
- ✅ 4 behavior categories
- ✅ 20 behavior items
- ✅ Sample regions and teams
- ✅ Test salespeople data

### **iOS App Ready**
- ✅ Connects to Railway backend
- ✅ All features functional
- ✅ Real-time data synchronization
- ✅ Production-ready configuration

## 🚀 **Next Steps**

1. **Add PostgreSQL database** to Railway
2. **Set environment variables** in Railway dashboard
3. **Wait for auto-deployment** from GitHub
4. **Test all endpoints** with curl commands
5. **Seed initial data** for testing
6. **Test iOS app** with production backend

## 📞 **Support**

If you encounter issues:
1. **Check Railway logs** in the dashboard
2. **Verify GitHub repository** is connected
3. **Test individual endpoints** with curl
4. **Check environment variables** are set correctly

---

**Your GitHub repository is ready!** Follow the steps above to complete the Railway setup and you'll have a fully functional production backend! 🚀
