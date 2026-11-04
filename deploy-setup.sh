#!/bin/bash

# Quick Vercel Deployment Script
# Run this after setting up your database and Vercel project

echo "🚀 LiveKaratuwa - Vercel Deployment Setup"
echo "=========================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel
echo "🔐 Logging in to Vercel..."
vercel login

# Link to project
echo "🔗 Linking to Vercel project..."
vercel link

# Pull environment variables
echo "⬇️  Pulling environment variables..."
cd server
vercel env pull .env.local

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Push database schema
echo "🗄️  Pushing database schema..."
npx prisma db push

# Seed database
echo "🌱 Seeding database with initial data..."
node prisma/seed.js

# Seed quick guide
echo "📖 Seeding quick guide content..."
node seed-quick-guide.js

echo ""
echo "✅ Deployment setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Push your code: git push origin main"
echo "2. Vercel will auto-deploy"
echo "3. Visit your Vercel URL"
echo "4. Update CORS_ORIGINS with your actual domain"
echo "5. Login to admin and change password"
echo ""
echo "🎉 You're ready to go!"
