# 🚀 Railway Environment Variables - Quick Reference

## ⚡ **Essential Variables (Copy & Paste)**

```bash
# Database (Auto-provided by Railway)
DATABASE_URL=postgresql://postgres:password@host:5432/railway

# JWT Secret (Generate with: node setup-env.js)
JWT_SECRET=sales-scorecard-jwt-secret-2024-production-xyz789

# Email - SendGrid
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
```

## 🛠️ **Quick Setup Commands**

```bash
# Generate JWT secret and show all variables
npm run setup-env

# Validate your environment
npm run validate-env

# Test your app locally
npm run start:dev
```

## 📋 **Railway Setup Checklist**

- [ ] Add PostgreSQL database in Railway dashboard
- [ ] Copy environment variables to Railway
- [ ] Set up SendGrid account (or use Gmail)
- [ ] Update `FRONTEND_URL` with your Railway app URL
- [ ] Deploy and test

## 🔗 **Useful Links**

- [Railway Dashboard](https://railway.app/dashboard)
- [SendGrid Setup](https://sendgrid.com/docs/for-developers/sending-email/api-getting-started/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)

---

**Need Help?** Run `npm run setup-env` for detailed instructions!
