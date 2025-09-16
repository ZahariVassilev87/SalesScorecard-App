#!/bin/bash

# Local Development Setup Script
echo "🚀 Setting up local development environment..."

# Copy local environment file
if [ ! -f .env ]; then
    echo "📋 Creating local .env file..."
    cat > .env << EOF
# Database (Local SQLite for development)
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="local-dev-secret-key-change-in-production"

# Email Configuration (Optional for local dev)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="Sales Scorecard <noreply@localhost>"

# Frontend URL (for local development)
FRONTEND_URL="http://localhost:3000"

# Allowed email domains (comma-separated)
ALLOWED_DOMAINS="localhost,instorm.io,instorm.bg,metro.bg"

# Server
PORT="3000"
NODE_ENV="development"

# Security (Local development)
ENCRYPTION_KEY="local-dev-encryption-key-32-chars-long"
HMAC_SECRET="local-dev-hmac-secret"
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Copy local schema
echo "📋 Setting up local Prisma schema..."
cp prisma/schema.local.prisma prisma/schema.prisma
echo "✅ Local schema configured"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Create and migrate database
echo "🗄️ Setting up local database..."
npx prisma migrate dev --name init

# Seed database (optional)
echo "🌱 Seeding database..."
npm run db:seed

echo ""
echo "🎉 Local development setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start the development server: npm run start:dev"
echo "2. Open http://localhost:3000 in your browser"
echo "3. Start coding! 🚀"
echo ""
echo "💡 Tips:"
echo "- Your local database is: ./dev.db"
echo "- API will be available at: http://localhost:3000"
echo "- This won't affect your AWS deployment at all!"
echo ""

