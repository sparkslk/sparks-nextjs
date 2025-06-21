#!/bin/bash

# Reset Database Script for Sparks Next.js Application
# This script will clean the database and regenerate the Prisma schema

echo "🧹 Starting database reset process..."

# Step 1: Reset the database (drops all data and recreates tables)
echo "📊 Resetting database with Prisma..."
npx prisma migrate reset --force

# Step 2: Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Step 3: Optional - Seed the database if you have a seed script
if [ -f "prisma/seed.ts" ] || [ -f "prisma/seed.js" ]; then
    echo "🌱 Seeding database..."
    npx prisma db seed
else
    echo "ℹ️  No seed file found, skipping seeding"
fi

echo "✅ Database reset complete!"
echo "🎉 Your database is now clean and ready to use"
