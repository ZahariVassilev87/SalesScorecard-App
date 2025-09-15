# 🧪 Railway Deployment Testing Guide

## 🚀 **Pre-Deployment Checklist**

### 1. **Commit Your Changes**
```bash
cd /Users/zaharivassilev/SalesScorecard/sales-scorecard-api
git add .
git commit -m "Fix Railway deployment - environment setup complete"
git push
```

### 2. **Set Up Railway Environment Variables**

Go to your Railway project dashboard and add these variables:

#### **Essential Variables:**
```bash
# Database (Auto-provided when you add PostgreSQL)
DATABASE_URL=postgresql://postgres:password@host:5432/railway

# JWT Secret (Generate a secure one)
JWT_SECRET=sales-scorecard-jwt-secret-2024-production-xyz789

# Application
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-app-name.railway.app

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

### 3. **Add PostgreSQL Database**
1. In Railway dashboard: Click "New" → "Database" → "PostgreSQL"
2. Railway will automatically set `DATABASE_URL`

---

## 🧪 **Testing Your Deployment**

### **Step 1: Check Build Status**
1. Go to your Railway project dashboard
2. Check the "Deployments" tab
3. Look for successful build logs
4. ✅ **Success**: Build completed without errors
5. ❌ **Failure**: Check logs for specific errors

### **Step 2: Test Health Endpoint**
```bash
# Replace with your actual Railway URL
curl https://your-app-name.railway.app/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.45,
  "environment": "production"
}
```

### **Step 3: Test API Documentation**
Visit: `https://your-app-name.railway.app/api/docs`

**Expected**: Swagger UI should load with all API endpoints

### **Step 4: Test Authentication Endpoints**

#### **Test Magic Link (if email configured):**
```bash
curl -X POST https://your-app-name.railway.app/auth/magic-link \
  -H "Content-Type: application/json" \
  -d '{"email": "test@instorm.bg"}'
```

**Expected Response:**
```json
{
  "message": "Magic link sent to your email"
}
```

#### **Test Protected Endpoint (should return 401):**
```bash
curl https://your-app-name.railway.app/users
```

**Expected Response:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### **Step 5: Test Admin Endpoints**

#### **Test System Info:**
```bash
curl https://your-app-name.railway.app/admin/system-info
```

**Expected Response:**
```json
{
  "version": "1.0.0",
  "environment": "production",
  "database": "PostgreSQL",
  "uptime": 123.45,
  "memory": {...}
}
```

---

## 🔍 **Troubleshooting Common Issues**

### **Build Failures:**

1. **bcryptjs Module Not Found**
   - ✅ **Fixed**: We removed duplicate bcrypt dependency
   - **Check**: Build logs should show successful compilation

2. **Prisma Client Generation Failed**
   - ✅ **Fixed**: Added proper binary targets
   - **Check**: Look for "Generated Prisma Client" in build logs

3. **TypeScript Compilation Errors**
   - ✅ **Fixed**: Simplified build process
   - **Check**: All TypeScript files should compile successfully

### **Runtime Issues:**

1. **Database Connection Failed**
   - **Check**: `DATABASE_URL` is set correctly
   - **Verify**: PostgreSQL database is added to Railway project

2. **JWT Errors**
   - **Check**: `JWT_SECRET` is set and long enough (32+ characters)
   - **Verify**: No special characters causing issues

3. **Email Not Working**
   - **Check**: SMTP credentials are correct
   - **Test**: Try `SKIP_EMAIL=true` for testing
   - **Verify**: Email domain is in `ALLOWED_DOMAINS`

4. **CORS Issues**
   - **Check**: `FRONTEND_URL` matches your actual Railway URL
   - **Verify**: Domain is in `ALLOWED_DOMAINS`

---

## 📊 **Success Criteria**

Your deployment is successful when:

- ✅ Build completes without errors
- ✅ Health endpoint returns 200 OK
- ✅ API documentation loads
- ✅ Authentication endpoints respond correctly
- ✅ Database connections work
- ✅ Email service functions (or skips properly)

---

## 🚀 **Next Steps After Successful Deployment**

1. **Test iOS App Integration**
   - Update iOS app with Railway URL
   - Test login flow
   - Verify API communication

2. **Set Up Monitoring**
   - Monitor Railway logs
   - Set up error tracking
   - Configure alerts

3. **Production Optimization**
   - Set up proper email service
   - Configure domain and SSL
   - Set up backup strategies

---

## 📞 **Getting Help**

If you encounter issues:

1. **Check Railway Logs**: Look for specific error messages
2. **Test Locally**: Try running the app locally with same environment
3. **Contact Support**: zahari.vasilev@instorm.bg

---

**Ready to test?** Follow the steps above and let me know what you find!
