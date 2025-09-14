-- Initialize Sales Scorecard Database
-- This script sets up the initial database structure

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create database if it doesn't exist (this will be handled by the container)
-- CREATE DATABASE sales_scorecard;

-- Set timezone
SET timezone = 'UTC';

-- Create initial admin user (will be created by Prisma migrations)
-- This is just a placeholder for reference
