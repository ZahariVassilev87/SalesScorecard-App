# 📱 iOS App + Railway Backend Testing Guide

## 🔍 **Step 1: Find Your Railway URL**

Your app is running on Railway, but we need the correct URL. Check your Railway dashboard:

1. **Go to**: [railway.app/dashboard](https://railway.app/dashboard)
2. **Find your project**: Look for "sales-scorecard" or similar
3. **Click on your service**
4. **Check the "Settings" tab** for your domain
5. **Copy the URL** (it should look like one of these):
   - `https://your-project-name.up.railway.app`
   - `https://your-project-name.railway.app`
   - `https://sales-scorecard-api-production.up.railway.app`

## 🧪 **Step 2: Test Railway Backend**

Once you have the correct URL, test these endpoints:

### **Health Check**
```bash
curl https://YOUR-RAILWAY-URL/health
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

### **API Documentation**
Visit: `https://YOUR-RAILWAY-URL/api/docs`

### **Authentication Test**
```bash
curl https://YOUR-RAILWAY-URL/users
```
**Expected**: `{"statusCode": 401, "message": "Unauthorized"}`

## 📱 **Step 3: Update iOS App**

Once you have the correct Railway URL, update your iOS app:

### **Update APIService.swift**
```swift
class APIService {
    private let baseURL = "https://YOUR-ACTUAL-RAILWAY-URL" // Update this
    private let isDevelopmentMode = false // Keep as false for production
}
```

### **Test iOS App Features**

#### **1. Authentication Flow**
- Open the iOS app
- Try to register a new user
- Test login with existing credentials
- Verify JWT token storage

#### **2. Evaluation System**
- Create a new evaluation
- Select a salesperson
- Score all behavior categories
- Submit the evaluation

#### **3. Analytics Dashboard**
- View the analytics dashboard
- Check if charts load correctly
- Verify summary metrics

#### **4. Team Management**
- View team members
- Test salesperson management
- Check regional organization

## 🚨 **Common Issues & Solutions**

### **Issue 1: "Application not found" Error**
**Cause**: Wrong Railway URL
**Solution**: Check Railway dashboard for correct URL

### **Issue 2: iOS App Can't Connect**
**Cause**: Network issues or wrong URL
**Solution**: 
- Verify Railway URL is correct
- Check if Railway app is running
- Test with curl first

### **Issue 3: Authentication Fails**
**Cause**: Backend not configured properly
**Solution**:
- Check Railway environment variables
- Verify JWT_SECRET is set
- Check database connection

### **Issue 4: Data Not Loading**
**Cause**: API endpoints not working
**Solution**:
- Test individual API endpoints
- Check Railway logs
- Verify database is connected

## 🧪 **Testing Checklist**

### **Backend (Railway)**
- [ ] Health endpoint responds
- [ ] API documentation loads
- [ ] Authentication endpoints work
- [ ] Database is connected
- [ ] Environment variables set

### **iOS App**
- [ ] Connects to Railway backend
- [ ] Authentication flow works
- [ ] Evaluation system functional
- [ ] Analytics dashboard loads
- [ ] Team management works
- [ ] Error handling works

### **Integration**
- [ ] End-to-end user workflow
- [ ] Data synchronization
- [ ] Real-time updates
- [ ] Offline error handling

## 🚀 **Quick Test Commands**

```bash
# Test Railway backend
curl https://YOUR-RAILWAY-URL/health
curl https://YOUR-RAILWAY-URL/api/docs
curl https://YOUR-RAILWAY-URL/users

# Test authentication
curl -X POST https://YOUR-RAILWAY-URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@instorm.bg", "password": "password123"}'
```

## 📞 **Need Help?**

If you encounter issues:
1. **Check Railway logs** in the dashboard
2. **Verify environment variables** are set
3. **Test API endpoints** individually
4. **Check iOS app console** for error messages

**Let me know your Railway URL and we can test everything together!**
