#!/bin/bash

# Production deployment script for Sparks Next.js app
# This script should be run on your production server

set -e

echo "🚀 Starting production deployment..."

# Stop PM2 process if running
echo "📛 Stopping existing PM2 process..."
pm2 stop sparks-app || true

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Build the application for production
echo "🏗️ Building application for production..."
pnpm run build

# Start the application with PM2
echo "🎯 Starting application with PM2..."
pm2 start ecosystem.config.js --env production

# Show PM2 status
pm2 status

echo "✅ Deployment completed successfully!"
echo "🌐 Application is running at https://sparks.help"
