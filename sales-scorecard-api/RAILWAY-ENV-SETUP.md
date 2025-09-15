# 🔧 Railway Environment Variables Setup

## 📋 **Required Environment Variables**

Your Sales Scorecard API needs these environment variables to run properly on Railway:

### 🗄️ **Database (Auto-provided by Railway)**
```
DATABASE_URL=postgresql://postgres:password@host:5432/railway
```
- **Note**: Railway automatically provides this when you add a PostgreSQL database
- **Action**: Add PostgreSQL database in Railway dashboard

### 🔐 **Authentication**
```
JWT_SECRET=your-super-secure-jwt-secret-for-production-2024
```
- **Generate**: Use a long, random string (32+ characters)
- **Example**: `sales-scorecard-jwt-secret-2024-production-xyz789`

### 📧 **Email Configuration (Choose One Option)**

#### Option 1: SendGrid (Recommended)
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=Sales Scorecard <vassilev.zahari@gmail.com>
```

#### Option 2: Gmail (Alternative)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Sales Scorecard <your-email@gmail.com>
```

#### Option 3: AWS SES (If you have AWS setup)
```
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=eu-north-1
```

### 🌐 **Application URLs**
```
FRONTEND_URL=https://your-app-name.railway.app
PORT=3000
NODE_ENV=production
```

### 🔒 **Security**
```
ALLOWED_DOMAINS=instorm.io,instorm.bg,metro.bg,gmail.com
```

### 🧪 **Testing (Optional)**
```
SKIP_EMAIL=true
```
- **Use**: Only for testing - skips actual email sending

---

## 🚀 **Step-by-Step Railway Setup**

### 1. **Add PostgreSQL Database**
1. Go to your Railway project dashboard
2. Click "New" → "Database" → "PostgreSQL"
3. Railway will automatically set `DATABASE_URL`

### 2. **Set Environment Variables**
1. Go to your service in Railway dashboard
2. Click "Variables" tab
3. Add each variable from the list above

### 3. **Generate JWT Secret**
```bash
# Generate a secure JWT secret
openssl rand -base64 32
```

### 4. **Set Up Email Service**

#### For SendGrid:
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create an API key
3. Use the SendGrid variables above

#### For Gmail:
1. Enable 2-factor authentication
2. Generate an app password
3. Use the Gmail variables above

---

## 📝 **Complete Environment Variables List**

Copy and paste these into Railway (replace with your actual values):

```bash
# Database (Auto-provided by Railway)
DATABASE_URL=postgresql://postgres:password@host:5432/railway

# JWT Secret (Generate your own)
JWT_SECRET=sales-scorecard-jwt-secret-2024-production-xyz789

# Email - SendGrid (Recommended)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=Sales Scorecard <vassilev.zahari@gmail.com>

# Application
FRONTEND_URL=https://your-app-name.railway.app
PORT=3000
NODE_ENV=production

# Security
ALLOWED_DOMAINS=instorm.io,instorm.bg,metro.bg,gmail.com

# Optional: Skip email for testing
# SKIP_EMAIL=true
```

---

## 🧪 **Testing Your Setup**

### 1. **Check Health Endpoint**
```bash
curl https://your-app-name.railway.app/health
```

### 2. **Test API Documentation**
Visit: `https://your-app-name.railway.app/api/docs`

### 3. **Test Email (if configured)**
```bash
curl -X POST https://your-app-name.railway.app/auth/magic-link \
  -H "Content-Type: application/json" \
  -d '{"email": "test@instorm.bg"}'
```

---

## 🔍 **Troubleshooting**

### Common Issues:

1. **Database Connection Failed**
   - Check if PostgreSQL database is added
   - Verify `DATABASE_URL` is set correctly

2. **Email Not Sending**
   - Check SMTP credentials
   - Try `SKIP_EMAIL=true` for testing
   - Verify email domain is in `ALLOWED_DOMAINS`

3. **JWT Errors**
   - Ensure `JWT_SECRET` is set
   - Use a long, random string

4. **CORS Issues**
   - Check `FRONTEND_URL` is correct
   - Verify domain is in `ALLOWED_DOMAINS`

---

## 📞 **Support**

If you need help:
1. Check Railway logs for specific errors
2. Test locally with the same environment variables
3. Contact: zahari.vasilev@instorm.bg

---

**Status**: ✅ **READY FOR ENVIRONMENT SETUP**
**Next**: Add these variables to your Railway project
