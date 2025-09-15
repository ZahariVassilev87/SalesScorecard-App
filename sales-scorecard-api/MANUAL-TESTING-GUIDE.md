# 🧪 Manual Testing Guide for Railway Deployment

## 🚀 **Quick Test Steps**

### **Step 1: Deploy to Railway**
1. Commit your changes:
   ```bash
   git add .
   git commit -m "Fix Railway deployment issues"
   git push
   ```

2. Set up environment variables in Railway dashboard
3. Add PostgreSQL database
4. Wait for deployment to complete

### **Step 2: Test Your Deployment**

Replace `https://your-app-name.railway.app` with your actual Railway URL:

#### **Test 1: Health Check**
```bash
curl https://your-app-name.railway.app/health
```
**Expected**: JSON response with status "ok"

#### **Test 2: API Documentation**
Visit: `https://your-app-name.railway.app/api/docs`
**Expected**: Swagger UI loads with all endpoints

#### **Test 3: Authentication (Protected Route)**
```bash
curl https://your-app-name.railway.app/users
```
**Expected**: `{"statusCode": 401, "message": "Unauthorized"}`

#### **Test 4: Admin System Info**
```bash
curl https://your-app-name.railway.app/admin/system-info
```
**Expected**: JSON with version, environment, database info

#### **Test 5: Magic Link (Email Test)**
```bash
curl -X POST https://your-app-name.railway.app/auth/magic-link \
  -H "Content-Type: application/json" \
  -d '{"email": "test@instorm.bg"}'
```
**Expected**: Success message or domain validation error

---

## 🔍 **What to Look For**

### ✅ **Success Indicators:**
- Health endpoint returns 200 OK
- API docs load properly
- Protected routes return 401 (authentication working)
- Admin endpoints accessible
- No build errors in Railway logs

### ❌ **Failure Indicators:**
- 500 errors (server issues)
- 404 errors (routing problems)
- Build failures in Railway logs
- Database connection errors
- JWT/authentication errors

---

## 🛠️ **Troubleshooting**

### **Build Failures:**
- Check Railway build logs
- Verify all dependencies are in package.json
- Ensure Prisma schema is correct

### **Runtime Errors:**
- Check environment variables are set
- Verify database connection
- Check JWT secret is configured

### **Email Issues:**
- Test with `SKIP_EMAIL=true`
- Verify SMTP credentials
- Check allowed domains

---

## 📱 **iOS App Testing**

Once your API is working:

1. Update iOS app with Railway URL
2. Test login flow
3. Verify API communication
4. Test all app features

---

**Ready to test?** Follow the steps above and let me know the results!
