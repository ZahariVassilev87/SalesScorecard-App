#!/usr/bin/env node

/**
 * Environment Validation Script for Sales Scorecard API
 * Checks if all required environment variables are set
 */

console.log('🔍 Sales Scorecard API - Environment Validation\n');

// Required environment variables
const requiredVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'NODE_ENV',
  'PORT'
];

// Optional but recommended variables
const recommendedVars = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM',
  'FRONTEND_URL',
  'ALLOWED_DOMAINS'
];

// Check required variables
console.log('✅ Required Variables:');
let allRequiredSet = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: Set`);
  } else {
    console.log(`  ❌ ${varName}: Missing`);
    allRequiredSet = false;
  }
});

console.log('\n📧 Email Configuration:');
let emailConfigured = false;

recommendedVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: Set`);
    if (varName.startsWith('SMTP_')) {
      emailConfigured = true;
    }
  } else {
    console.log(`  ⚠️  ${varName}: Not set`);
  }
});

// Check if email is configured
if (!emailConfigured) {
  console.log('\n⚠️  Email not configured. You can:');
  console.log('  1. Set up SMTP variables for email sending');
  console.log('  2. Set SKIP_EMAIL=true for testing');
}

// Summary
console.log('\n📊 Summary:');
if (allRequiredSet) {
  console.log('✅ All required environment variables are set!');
  console.log('🚀 Your app should be ready to run.');
} else {
  console.log('❌ Some required environment variables are missing.');
  console.log('🔧 Please set the missing variables and try again.');
}

// Database URL validation
if (process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl.includes('postgresql://')) {
    console.log('✅ Database URL format looks correct (PostgreSQL)');
  } else {
    console.log('⚠️  Database URL should be a PostgreSQL connection string');
  }
}

// JWT Secret validation
if (process.env.JWT_SECRET) {
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret.length >= 32) {
    console.log('✅ JWT Secret length is sufficient');
  } else {
    console.log('⚠️  JWT Secret should be at least 32 characters long');
  }
}

console.log('\n📚 For setup help, run: node setup-env.js');
