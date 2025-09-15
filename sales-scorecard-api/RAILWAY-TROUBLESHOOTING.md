# 🚨 Railway Deployment Troubleshooting

## ❌ **Current Issue: Application Not Found**

Your Railway deployment is returning:
```json
{"status":"error","code":404,"message":"Application not found"}
```

This means the app isn't running or the URL is incorrect.

## 🔍 **Let's Fix This Step by Step**

### **Step 1: Check Your Railway Dashboard**

1. **Go to Railway Dashboard**: [railway.app/dashboard](https://railway.app/dashboard)
2. **Find your project**: Look for "sales-scorecard" or similar
3. **Check the correct URL**: Your actual URL might be different

### **Step 2: Verify Your Actual Railway URL**

Your URL might be one of these formats:
- `https://sales-scorecard-api-production.up.railway.app`
- `https://sales-scorecard-api-production.railway.app`
- `https://your-project-name.up.railway.app`
- `https://your-project-name.railway.app`

### **Step 3: Check Deployment Status**

In Railway dashboard:
1. **Go to your project**
2. **Click on your service**
3. **Check "Deployments" tab**
4. **Look for successful deployments**

### **Step 4: Check Build Logs**

1. **Click on latest deployment**
2. **Check "Logs" tab**
3. **Look for build errors**

Common issues:
- Build failed
- Environment variables missing
- Database connection failed
- Port configuration wrong

## 🛠️ **Quick Fixes**

### **Fix 1: Redeploy Your App**

```bash
# Commit any changes
git add .
git commit -m "Fix Railway deployment"
git push

# Railway will automatically redeploy
```

### **Fix 2: Check Environment Variables**

In Railway dashboard, ensure these are set:
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
```

### **Fix 3: Add PostgreSQL Database**

1. **In Railway dashboard**
2. **Click "+ New"**
3. **Select "Database"**
4. **Choose "PostgreSQL"**
5. **Railway will auto-set DATABASE_URL**

### **Fix 4: Check Build Configuration**

Ensure your `package.json` has:
```json
{
  "scripts": {
    "start": "node dist/main.js",
    "build": "npm ci && npx prisma generate && npx tsc"
  }
}
```

## 🧪 **Test Your Fix**

Once you've made changes:

```bash
# Test the health endpoint
curl https://your-actual-url.railway.app/health

# Test API docs
curl https://your-actual-url.railway.app/api/docs
```

## 📋 **Railway Deployment Checklist**

- [ ] Project created in Railway
- [ ] GitHub repository connected
- [ ] Service deployed successfully
- [ ] PostgreSQL database added
- [ ] Environment variables set
- [ ] Build completed without errors
- [ ] App started successfully
- [ ] Health endpoint responding

## 🚀 **Alternative: Fresh Deployment**

If nothing works, let's do a fresh deployment:

### **Step 1: Create New Railway Project**
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your Sales Scorecard repository

### **Step 2: Configure Environment**
```bash
# Set these in Railway dashboard:
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secure-jwt-secret
FRONTEND_URL=https://your-new-url.railway.app
ALLOWED_DOMAINS=instorm.io,instorm.bg,metro.bg,gmail.com
SKIP_EMAIL=true  # For testing
```

### **Step 3: Add Database**
1. Click "+ New" → "Database" → "PostgreSQL"
2. Railway will auto-set DATABASE_URL

### **Step 4: Deploy**
Railway will automatically build and deploy your app.

## 📞 **Need Help?**

1. **Check Railway logs** for specific error messages
2. **Verify your actual Railway URL** in the dashboard
3. **Ensure all environment variables** are set
4. **Check if PostgreSQL database** is added

**Let me know what you find in your Railway dashboard and I'll help you get it working!**
