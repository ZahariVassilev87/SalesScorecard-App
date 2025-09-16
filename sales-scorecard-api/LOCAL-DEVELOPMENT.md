# 🚀 Local Development Guide

## Quick Start

While AWS is deploying, you can safely work on localhost without affecting the deployment!

### 1. Run Setup Script
```bash
./setup-local.sh
```

### 2. Start Development Server
```bash
npm run start:dev
```

### 3. Open in Browser
- API: http://localhost:3000
- iOS Simulator: Use your existing iOS app pointing to localhost

## 🔒 Why It's Safe

✅ **Complete Isolation**: Local and AWS are separate environments
✅ **Different Databases**: Local uses SQLite, AWS uses PostgreSQL
✅ **No Conflicts**: Zero interference between local and cloud
✅ **Independent Development**: Continue coding while AWS deploys

## 🛠️ Development Commands

```bash
# Start development server with hot reload
npm run start:dev

# Start with debugging
npm run start:debug

# Run tests
npm test

# Lint code
npm run lint

# Generate Prisma client
npm run prisma:generate

# Reset local database
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio
```

## 📱 iOS App Configuration

To connect your iOS app to localhost:

1. **Update API Base URL** in `APIService.swift`:
```swift
private let baseURL = "http://localhost:3000"
```

2. **For iOS Simulator**: Use `localhost:3000`
3. **For Physical Device**: Use your computer's IP address (e.g., `192.168.1.100:3000`)

## 🗄️ Local Database

- **Type**: SQLite (file: `./dev.db`)
- **Reset**: `npx prisma migrate reset`
- **View Data**: `npx prisma studio`
- **Backup**: Copy `./dev.db` file

## 🔧 Environment Variables

Your local `.env` file includes:
- SQLite database URL
- Local JWT secret
- Development settings
- Optional email configuration

## 🚨 Important Notes

1. **Never commit** `.env` file to git
2. **Local changes** won't affect AWS deployment
3. **Database changes** need to be applied to AWS separately
4. **Use different ports** if needed (change PORT in .env)

## 🔄 Switching Between Local and AWS

### To use AWS (production):
1. Update iOS app API URL to AWS endpoint
2. Use production environment

### To use localhost:
1. Run `./setup-local.sh`
2. Update iOS app API URL to `localhost:3000`
3. Start development server

## 🐛 Troubleshooting

### Port already in use:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database issues:
```bash
# Reset database
npx prisma migrate reset
```

### Prisma client issues:
```bash
# Regenerate client
npx prisma generate
```

## 📋 Development Workflow

1. **Make changes** to your code locally
2. **Test locally** with `npm run start:dev`
3. **Test with iOS app** connected to localhost
4. **When ready**, deploy to AWS
5. **Switch iOS app** back to AWS URL

---

**🎯 You can now develop safely while AWS deploys!** 🚀

