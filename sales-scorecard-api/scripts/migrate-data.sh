#!/bin/bash

# Data Migration Script: SQLite to PostgreSQL
# This script migrates data from the current SQLite database to PostgreSQL

set -e

echo "🚀 Starting data migration from SQLite to PostgreSQL..."

# Check if required tools are installed
if ! command -v sqlite3 &> /dev/null; then
    echo "❌ sqlite3 is not installed. Please install it first."
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo "❌ psql is not installed. Please install PostgreSQL client first."
    exit 1
fi

# Configuration
SQLITE_DB="prisma/dev.db"
POSTGRES_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/sales_scorecard}"

# Check if SQLite database exists
if [ ! -f "$SQLITE_DB" ]; then
    echo "❌ SQLite database not found at $SQLITE_DB"
    exit 1
fi

echo "📊 SQLite database found: $SQLITE_DB"
echo "🗄️ PostgreSQL URL: $POSTGRES_URL"

# Create backup of SQLite database
echo "💾 Creating backup of SQLite database..."
cp "$SQLITE_DB" "prisma/dev.db.backup.$(date +%Y%m%d_%H%M%S)"

# Export data from SQLite
echo "📤 Exporting data from SQLite..."

# Create temporary directory for exports
mkdir -p temp_migration

# Export each table
echo "  - Exporting users..."
sqlite3 "$SQLITE_DB" <<EOF
.mode csv
.headers on
.output temp_migration/users.csv
SELECT * FROM users;
EOF

echo "  - Exporting regions..."
sqlite3 "$SQLITE_DB" <<EOF
.mode csv
.headers on
.output temp_migration/regions.csv
SELECT * FROM regions;
EOF

echo "  - Exporting teams..."
sqlite3 "$SQLITE_DB" <<EOF
.mode csv
.headers on
.output temp_migration/teams.csv
SELECT * FROM teams;
EOF

echo "  - Exporting salespeople..."
sqlite3 "$SQLITE_DB" <<EOF
.mode csv
.headers on
.output temp_migration/salespeople.csv
SELECT * FROM salespeople;
EOF

echo "  - Exporting evaluations..."
sqlite3 "$SQLITE_DB" <<EOF
.mode csv
.headers on
.output temp_migration/evaluations.csv
SELECT * FROM evaluations;
EOF

echo "  - Exporting user_regions..."
sqlite3 "$SQLITE_DB" <<EOF
.mode csv
.headers on
.output temp_migration/user_regions.csv
SELECT * FROM user_regions;
EOF

echo "  - Exporting user_teams..."
sqlite3 "$SQLITE_DB" <<EOF
.mode csv
.headers on
.output temp_migration/user_teams.csv
SELECT * FROM user_teams;
EOF

# Import data to PostgreSQL
echo "📥 Importing data to PostgreSQL..."

# Set PostgreSQL connection
export PGPASSWORD=$(echo $POSTGRES_URL | sed 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/')
export PGHOST=$(echo $POSTGRES_URL | sed 's/.*@\([^:]*\):.*/\1/')
export PGPORT=$(echo $POSTGRES_URL | sed 's/.*:\([0-9]*\)\/.*/\1/')
export PGDATABASE=$(echo $POSTGRES_URL | sed 's/.*\/\([^?]*\).*/\1/')
export PGUSER=$(echo $POSTGRES_URL | sed 's/.*:\/\/\([^:]*\):.*/\1/')

# Import each table
echo "  - Importing users..."
psql -c "\COPY users FROM 'temp_migration/users.csv' WITH CSV HEADER;"

echo "  - Importing regions..."
psql -c "\COPY regions FROM 'temp_migration/regions.csv' WITH CSV HEADER;"

echo "  - Importing teams..."
psql -c "\COPY teams FROM 'temp_migration/teams.csv' WITH CSV HEADER;"

echo "  - Importing salespeople..."
psql -c "\COPY salespeople FROM 'temp_migration/salespeople.csv' WITH CSV HEADER;"

echo "  - Importing evaluations..."
psql -c "\COPY evaluations FROM 'temp_migration/evaluations.csv' WITH CSV HEADER;"

echo "  - Importing user_regions..."
psql -c "\COPY user_regions FROM 'temp_migration/user_regions.csv' WITH CSV HEADER;"

echo "  - Importing user_teams..."
psql -c "\COPY user_teams FROM 'temp_migration/user_teams.csv' WITH CSV HEADER;"

# Clean up temporary files
echo "🧹 Cleaning up temporary files..."
rm -rf temp_migration

# Verify migration
echo "✅ Verifying migration..."
echo "  - Users: $(psql -t -c 'SELECT COUNT(*) FROM users;')"
echo "  - Regions: $(psql -t -c 'SELECT COUNT(*) FROM regions;')"
echo "  - Teams: $(psql -t -c 'SELECT COUNT(*) FROM teams;')"
echo "  - Salespeople: $(psql -t -c 'SELECT COUNT(*) FROM salespeople;')"
echo "  - Evaluations: $(psql -t -c 'SELECT COUNT(*) FROM evaluations;')"

echo "🎉 Data migration completed successfully!"
echo "📝 Next steps:"
echo "  1. Update your application to use PostgreSQL connection string"
echo "  2. Test the application with the new database"
echo "  3. Update your deployment configuration"
