#!/usr/bin/env node

/**
 * Environment Setup Helper for Sales Scorecard API
 * Generates JWT secrets and validates environment configuration
 */

const crypto = require('crypto');

console.log('🔧 Sales Scorecard API - Environment Setup Helper\n');

// Generate JWT Secret
function generateJWTSecret() {
  return crypto.randomBytes(32).toString('base64');
}

// Generate a secure JWT secret
const jwtSecret = generateJWTSecret();

console.log('📋 Environment Variables for Railway:\n');

console.log('# Database (Auto-provided by Railway)');
console.log('DATABASE_URL=postgresql://postgres:password@host:5432/railway\n');

console.log('# JWT Secret (Generated for you)');
console.log(`JWT_SECRET=${jwtSecret}\n`);

console.log('# Email Configuration - SendGrid (Recommended)');
console.log('SMTP_HOST=smtp.sendgrid.net');
console.log('SMTP_PORT=587');
console.log('SMTP_USER=apikey');
console.log('SMTP_PASS=your-sendgrid-api-key');
console.log('SMTP_FROM=Sales Scorecard <vassilev.zahari@gmail.com>\n');

console.log('# Application URLs');
console.log('FRONTEND_URL=https://your-app-name.railway.app');
console.log('PORT=3000');
console.log('NODE_ENV=production\n');

console.log('# Security');
console.log('ALLOWED_DOMAINS=instorm.io,instorm.bg,metro.bg,gmail.com\n');

console.log('# Optional: Skip email for testing');
console.log('# SKIP_EMAIL=true\n');

console.log('🚀 Next Steps:');
console.log('1. Copy the variables above');
console.log('2. Go to your Railway project dashboard');
console.log('3. Click "Variables" tab');
console.log('4. Add each variable');
console.log('5. Add PostgreSQL database if not already added');
console.log('6. Deploy your app!');

console.log('\n📚 For detailed instructions, see: RAILWAY-ENV-SETUP.md');
