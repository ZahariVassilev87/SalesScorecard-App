# 🚀 Railway Quick Start - 5 Minutes to Production

## ✅ What's Ready

Your Sales Scorecard is now ready for Railway deployment:

- ✅ **PostgreSQL schema** configured
- ✅ **Railway config files** created
- ✅ **Data exported** (7 users, 9 regions, 5 teams, 15 salespeople)
- ✅ **Deployment scripts** ready
- ✅ **Environment templates** prepared

## 🎯 Next Steps (5 Minutes)

### 1. Go to Railway
- Visit [railway.app](https://railway.app)
- Sign up with GitHub
- Create new project → "Deploy from GitHub repo"
- Select your Sales Scorecard repository

### 2. Add Database
- Click **"+ New"** → **"Database"** → **"PostgreSQL"**
- Railway creates database automatically

### 3. Set Environment Variables
In your app service → **"Variables"** tab, add:

```bash
JWT_SECRET="your-super-secure-jwt-secret-change-this"
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
SMTP_FROM="Sales Scorecard <vassilev.zahari@gmail.com>"
SMTP_SECURE="false"
SMTP_TLS="true"
FRONTEND_URL="https://your-app-name.railway.app"
ALLOWED_DOMAINS="instorm.io,instorm.bg,metro.bg,gmail.com"
PORT="3000"
NODE_ENV="production"
```

### 4. Run Database Setup
In Railway console (app service → Deployments → Logs):

```bash
npx prisma generate
npx prisma migrate deploy
```

### 5. Import Your Data
```bash
# Upload the exported data file to Railway
# Then run:
node scripts/export-data.js import exports/data-export-2025-09-13T18-59-44-177Z.json
```

### 6. Test Your API
- Go to your app service → Settings → Domain
- Test: `https://your-app-name.railway.app/api/docs`
- Test admin: `https://your-app-name.railway.app/public-admin/team-manager`

## 📊 Your Current Data

**Exported Successfully:**
- 👥 **7 users** (managers, leads, admins)
- 🌍 **9 regions** (organizational structure)
- 🏢 **5 teams** (Enterprise Sales, SMB Sales, etc.)
- 👤 **15 salespeople** (team members)
- 📋 **4 behavior categories** (evaluation criteria)
- 📝 **20 behavior items** (specific evaluation points)

## 🔧 Files Created for Railway

- `railway.json` - Railway configuration
- `nixpacks.toml` - Build configuration
- `scripts/deploy-railway.sh` - Deployment script
- `RAILWAY-SETUP.md` - Detailed setup guide
- `exports/data-export-*.json` - Your current data

## 🎉 What You'll Get

**Production-Ready Features:**
- ✅ **PostgreSQL database** (scalable, reliable)
- ✅ **Automatic HTTPS** (secure connections)
- ✅ **Global CDN** (fast worldwide access)
- ✅ **Auto-deployments** (push to GitHub = deploy)
- ✅ **Monitoring** (real-time logs, metrics)
- ✅ **Backups** (automatic daily backups)
- ✅ **Scaling** (easy to scale up/down)

## 🆘 Need Help?

**Railway Issues:**
- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)

**Sales Scorecard Issues:**
- Check Railway logs
- Verify environment variables
- Test API endpoints

## 🚀 Ready to Deploy!

Your Sales Scorecard is production-ready. Just follow the 5 steps above and you'll have a live, scalable application in minutes!

**Railway Dashboard:** [railway.app/dashboard](https://railway.app/dashboard)
