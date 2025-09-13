# 🚀 Railway Production Setup Guide

## Quick Start (5 Minutes)

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Authorize Railway to access your repositories

### Step 2: Deploy Your App
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your **Sales Scorecard repository**
4. Railway will automatically detect it's a Node.js app

### Step 3: Add PostgreSQL Database
1. In your project dashboard, click **"+ New"**
2. Select **"Database"**
3. Choose **"PostgreSQL"**
4. Railway creates the database automatically

### Step 4: Set Environment Variables
Go to your app service → **"Variables"** tab and add:

```bash
# Database (Railway provides this automatically)
DATABASE_URL="postgresql://postgres:password@host:5432/railway"

# JWT Secret (Generate a secure secret)
JWT_SECRET="your-super-secure-jwt-secret-change-this"

# Email Configuration
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
SMTP_FROM="Sales Scorecard <vassilev.zahari@gmail.com>"
SMTP_SECURE="false"
SMTP_TLS="true"

# Frontend URL (Update with your Railway URL)
FRONTEND_URL="https://your-app-name.railway.app"

# Allowed domains
ALLOWED_DOMAINS="instorm.io,instorm.bg,metro.bg,gmail.com"

# Server
PORT="3000"
NODE_ENV="production"
```

### Step 5: Run Database Migrations
1. Go to your app service → **"Deployments"** tab
2. Click on the latest deployment
3. Go to **"Logs"** tab
4. Run these commands in the Railway console:

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed the database (optional)
npx prisma db seed
```

### Step 6: Test Your Deployment
1. Go to your app service → **"Settings"** tab
2. Copy your **"Domain"** URL
3. Test the API: `https://your-app-name.railway.app/api/docs`

## 🔧 Manual Setup (Alternative)

If you prefer manual setup:

### Install Railway CLI
```bash
npm install -g @railway/cli
```

### Login and Deploy
```bash
# Login to Railway
railway login

# Initialize project
railway init

# Add PostgreSQL database
railway add postgresql

# Set environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET="your-secure-secret"
# ... (add other variables)

# Deploy
railway up
```

## 📊 Railway Dashboard Features

### Monitoring
- **Real-time logs** - See what's happening
- **Metrics** - CPU, memory, network usage
- **Deployments** - Track all deployments
- **Health checks** - Automatic uptime monitoring

### Database Management
- **PostgreSQL console** - Direct database access
- **Connection details** - Easy connection strings
- **Backups** - Automatic daily backups
- **Scaling** - Easy database scaling

### Environment Management
- **Variables** - Secure environment variables
- **Secrets** - Encrypted sensitive data
- **Domains** - Custom domain setup
- **SSL** - Automatic HTTPS

## 🔒 Security Best Practices

### Environment Variables
- ✅ Use strong JWT secrets
- ✅ Keep SendGrid API keys secure
- ✅ Use Railway's secret management
- ✅ Never commit secrets to code

### Database Security
- ✅ Railway provides encrypted connections
- ✅ Automatic backups
- ✅ Access control via Railway dashboard
- ✅ No public database access

### Application Security
- ✅ HTTPS enabled by default
- ✅ Environment-based configuration
- ✅ Secure headers
- ✅ Rate limiting (can be added)

## 🚨 Troubleshooting

### Common Issues

**1. Database Connection Failed**
```bash
# Check DATABASE_URL is set correctly
railway variables

# Test database connection
railway run npx prisma db pull
```

**2. Build Failed**
```bash
# Check build logs in Railway dashboard
# Ensure all dependencies are in package.json
# Verify Node.js version compatibility
```

**3. Environment Variables Not Working**
```bash
# Verify variables are set
railway variables

# Redeploy after setting variables
railway up
```

**4. Email Not Sending**
```bash
# Check SendGrid API key
# Verify SMTP settings
# Check email domain verification
```

### Getting Help
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Railway Support**: [railway.app/support](https://railway.app/support)

## 📈 Scaling Your App

### Free Tier Limits
- **$5 credit** per month
- **512MB RAM** per service
- **1GB storage** for database
- **100GB bandwidth**

### Paid Plans
- **Pro Plan**: $20/month
- **Team Plan**: $99/month
- **Enterprise**: Custom pricing

### Scaling Options
- **Horizontal scaling** - Multiple app instances
- **Database scaling** - Larger database instances
- **CDN** - Global content delivery
- **Monitoring** - Advanced metrics and alerts

## 🎯 Production Checklist

- [ ] Railway account created
- [ ] App deployed successfully
- [ ] PostgreSQL database added
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] API endpoints tested
- [ ] Email functionality working
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Monitoring setup
- [ ] Backup strategy confirmed

## 🔄 Continuous Deployment

Railway automatically deploys when you push to your main branch:

1. **Push code** to GitHub
2. **Railway detects** changes
3. **Builds and deploys** automatically
4. **Runs health checks**
5. **Updates live app**

## 📞 Support

For Railway-specific issues:
- **Documentation**: [docs.railway.app](https://docs.railway.app)
- **Community**: [discord.gg/railway](https://discord.gg/railway)
- **Email**: support@railway.app

For Sales Scorecard issues:
- Check the logs in Railway dashboard
- Verify environment variables
- Test API endpoints
- Check database connectivity
