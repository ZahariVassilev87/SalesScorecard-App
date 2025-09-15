# 🚀 Railway Production Setup - Complete Guide

## 📋 **Current Status**
- ✅ **App Deployed**: Running on Railway
- ✅ **URL**: https://salesscorecard-app-production.up.railway.app
- ✅ **Prisma Schema**: Configured for PostgreSQL
- 🔧 **Database**: Currently using SQLite (needs PostgreSQL)
- 🔧 **Environment**: Needs production configuration

## 🎯 **Step-by-Step Setup**

### **Step 1: Add PostgreSQL Database**

1. **Go to Railway Dashboard**: [Your Project](https://railway.com/project/be1ac425-cc22-499f-98c3-ff13c8b85c0d/service/f8067bb2-72e1-4c42-838d-a37480b512b1?environmentId=40069d8f-81e0-4723-92cf-cd4caf949252)

2. **Add Database**:
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

### **Step 3: Deploy and Run Migrations**

After adding the database and environment variables:

1. **Railway will automatically redeploy** your app
2. **Check deployment logs** for any errors
3. **Run database migrations** (if needed)

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

## 🔧 **Configuration Details**

### **Database Configuration**
- **Type**: PostgreSQL (production-ready)
- **Provider**: Railway managed PostgreSQL
- **Backups**: Automatic daily backups
- **Scaling**: Easy to scale as needed
- **Security**: Encrypted connections

### **Application Configuration**
- **Environment**: Production
- **Port**: 3000 (Railway handles this)
- **CORS**: Configured for mobile app
- **Security**: JWT authentication, bcrypt passwords

### **Email Configuration**
- **SendGrid**: Professional email service (recommended)
- **Gmail**: Alternative option with app passwords
- **Skip Email**: For testing without email setup

## 🧪 **Testing Checklist**

### **Backend Setup**
- [ ] PostgreSQL database added to Railway
- [ ] Environment variables configured
- [ ] App redeployed successfully
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

### **Common Issues:**

#### **1. Database Connection Failed**
**Symptoms**: App fails to start or database errors
**Solution**: 
- Verify PostgreSQL database is added
- Check `DATABASE_URL` is set correctly
- Check Railway deployment logs

#### **2. Environment Variables Not Working**
**Symptoms**: App uses default values
**Solution**:
- Verify variables are set in Railway dashboard
- Check variable names are correct
- Redeploy after setting variables

#### **3. Build Failures**
**Symptoms**: Deployment fails
**Solution**:
- Check Railway build logs
- Verify all dependencies are in package.json
- Check Prisma schema is correct

#### **4. Email Not Working**
**Symptoms**: Email endpoints return errors
**Solution**:
- Set `SKIP_EMAIL=true` for testing
- Verify SMTP credentials
- Check email service configuration

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

## 🚀 **Next Steps After Setup**

1. **Test iOS App**: Build and run your iOS app
2. **Create Admin User**: Set up initial admin account
3. **Test Workflows**: Complete end-to-end testing
4. **Configure Email**: Set up proper email service
5. **Monitor Performance**: Watch Railway logs and metrics

## 📞 **Support**

If you encounter issues:
1. **Check Railway logs** in the dashboard
2. **Verify environment variables** are set
3. **Test individual endpoints** with curl
4. **Check database connection** status

---

**Ready to set up your production Railway backend?** Follow the steps above and let me know if you need help with any part!
