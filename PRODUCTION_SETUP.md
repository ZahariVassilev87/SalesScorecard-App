# 🚀 Production Setup Guide

## Current Status
✅ **Development**: App works perfectly with "Test Mode"  
❌ **Production**: Email authentication needs configuration

## What's Working Now
- ✅ iOS app with all features
- ✅ Backend API with all endpoints
- ✅ Test authentication (bypasses email)
- ✅ All evaluation and analytics features

## What Needs to Be Fixed for Production

### 1. Email Service Configuration

**Option A: Gmail (Easiest)**
```bash
# In sales-scorecard-api/.env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-gmail-app-password"  # Generate this in Gmail settings
SMTP_FROM="Sales Scorecard <noreply@instorm.bg>"
```

**Option B: Professional Email Service (Recommended)**
```bash
# Use services like SendGrid, Mailgun, or AWS SES
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
SMTP_FROM="Sales Scorecard <noreply@instorm.bg>"
```

### 2. Server Deployment

**Current**: `http://localhost:3000` (development only)  
**Production**: Deploy to services like:
- Heroku
- Railway
- DigitalOcean
- AWS
- Google Cloud

### 3. iOS App Configuration

**Update APIService.swift:**
```swift
private let baseURL = "https://your-production-server.com"
private let isDevelopmentMode = false
```

### 4. Database Setup

**Current**: SQLite (development)  
**Production**: PostgreSQL on cloud service

## Quick Production Checklist

- [ ] Set up email service (Gmail App Password or SendGrid)
- [ ] Create `.env` file with real credentials
- [ ] Deploy backend to cloud server
- [ ] Update iOS app with production URL
- [ ] Set `isDevelopmentMode = false`
- [ ] Remove "Test Mode" button from LoginView
- [ ] Test real email authentication

## Current Development Experience

**Perfect for testing and development:**
- ✅ All features work
- ✅ No email setup required
- ✅ Instant login with "Test Mode"
- ✅ Full app functionality

**Ready for production** - just needs email configuration and deployment!
