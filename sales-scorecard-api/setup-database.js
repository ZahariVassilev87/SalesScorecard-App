#!/usr/bin/env node

/**
 * Database Setup Script
 * Creates the necessary tables for the Sales Scorecard application
 */

const { Client } = require('pg');

// Database connection configuration
const client = new Client({
  connectionString: 'postgresql://postgres:owVsyu7ZmgJE2piopflQ@sales-scorecard-db.cvmwi48oaptu.eu-north-1.rds.amazonaws.com:5432/sales_scorecard'
});

async function setupDatabase() {
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database successfully');

    // Create users table
    console.log('📋 Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "displayName" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "password" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      )
    `);
    console.log('✅ Users table created');

    // Create unique index on email
    console.log('🔑 Creating email index...');
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email")
    `);
    console.log('✅ Email index created');

    // Create a test user
    console.log('👤 Creating test user...');
    await client.query(`
      INSERT INTO "users" ("id", "email", "displayName", "role", "isActive", "createdAt", "updatedAt")
      VALUES (
        'test-user-1',
        'test.salesdirector@example.com',
        'Test Sales Director',
        'Sales Director',
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      ) ON CONFLICT ("email") DO NOTHING
    `);
    console.log('✅ Test user created');

    // Verify the setup
    console.log('🔍 Verifying setup...');
    const result = await client.query('SELECT COUNT(*) FROM "users"');
    console.log(`✅ Database setup complete. Users count: ${result.rows[0].count}`);

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the setup
setupDatabase()
  .then(() => {
    console.log('🎉 Database setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Database setup failed:', error);
    process.exit(1);
  });
