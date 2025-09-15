#!/bin/bash

echo "🔧 Creating users table in PostgreSQL..."

# Create users table
psql "$DATABASE_URL" -c "
CREATE TABLE IF NOT EXISTS \"users\" (
    \"id\" TEXT NOT NULL,
    \"email\" TEXT NOT NULL,
    \"displayName\" TEXT NOT NULL,
    \"role\" TEXT NOT NULL,
    \"password\" TEXT,
    \"isActive\" BOOLEAN NOT NULL DEFAULT true,
    \"createdAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \"updatedAt\" TIMESTAMP(3) NOT NULL,
    CONSTRAINT \"users_pkey\" PRIMARY KEY (\"id\")
);
"

# Create unique index on email
psql "$DATABASE_URL" -c "
CREATE UNIQUE INDEX IF NOT EXISTS \"users_email_key\" ON \"users\"(\"email\");
"

# Create a test user
psql "$DATABASE_URL" -c "
INSERT INTO \"users\" (\"id\", \"email\", \"displayName\", \"role\", \"isActive\", \"createdAt\", \"updatedAt\")
VALUES (
    'test-user-1',
    'test.salesdirector@example.com',
    'Test Sales Director',
    'Sales Director',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (\"email\") DO NOTHING;
"

echo "✅ Database setup complete!"
