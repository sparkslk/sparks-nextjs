#!/bin/bash

# Advanced Database Reset Script for Sparks Next.js Application
# Usage: ./reset-database-advanced.sh [option]
# Options:
#   --soft    : Only reset migrations and regenerate client (keeps existing data if possible)
#   --hard    : Complete reset including dropping database (default)
#   --schema  : Only regenerate Prisma client from existing schema
#   --migrate : Only run pending migrations

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in a Node.js project with Prisma
if [ ! -f "package.json" ] || [ ! -f "prisma/schema.prisma" ]; then
    print_error "This doesn't appear to be a valid Node.js project with Prisma"
    print_error "Make sure you're in the project root and Prisma is set up"
    exit 1
fi

# Parse command line arguments
RESET_TYPE="hard"
if [ "$1" = "--soft" ]; then
    RESET_TYPE="soft"
elif [ "$1" = "--schema" ]; then
    RESET_TYPE="schema"
elif [ "$1" = "--migrate" ]; then
    RESET_TYPE="migrate"
elif [ "$1" = "--hard" ] || [ -z "$1" ]; then
    RESET_TYPE="hard"
else
    print_error "Invalid option: $1"
    echo "Usage: $0 [--soft|--hard|--schema|--migrate]"
    exit 1
fi

print_status "Starting database reset process (mode: $RESET_TYPE)..."

case $RESET_TYPE in
    "hard")
        print_warning "This will completely reset your database and DELETE ALL DATA!"
        read -p "Are you sure you want to continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Operation cancelled"
            exit 0
        fi
        
        print_status "Performing hard reset..."
        npx prisma migrate reset --force
        
        print_status "Generating Prisma client..."
        npx prisma generate
        ;;
        
    "soft")
        print_status "Performing soft reset (attempting to preserve data)..."
        
        print_status "Checking migration status..."
        npx prisma migrate status
        
        print_status "Deploying migrations..."
        npx prisma migrate deploy
        
        print_status "Generating Prisma client..."
        npx prisma generate
        ;;
        
    "schema")
        print_status "Regenerating Prisma client only..."
        npx prisma generate
        ;;
        
    "migrate")
        print_status "Running pending migrations..."
        npx prisma migrate deploy
        
        print_status "Generating Prisma client..."
        npx prisma generate
        ;;
esac

# Optional seeding
if [ -f "prisma/seed.ts" ] || [ -f "prisma/seed.js" ]; then
    if [ "$RESET_TYPE" = "hard" ]; then
        print_status "Seeding database..."
        npx prisma db seed
    else
        read -p "Do you want to run the database seed? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Seeding database..."
            npx prisma db seed
        fi
    fi
else
    print_warning "No seed file found, skipping seeding"
fi

# Verify the setup
print_status "Verifying database connection..."
if npx prisma db pull --dry-run > /dev/null 2>&1; then
    print_success "Database connection verified!"
else
    print_warning "Could not verify database connection"
fi

print_success "Database reset complete!"
print_status "Your database is now ready to use"

# Show some helpful next steps
echo ""
echo "Next steps:"
echo "  • Run your application: npm run dev"
echo "  • View your database: npx prisma studio"
echo "  • Check migration status: npx prisma migrate status"
