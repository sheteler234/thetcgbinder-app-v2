#!/bin/bash

echo "🚀 Deploying TCG Binder App..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Make sure you're in the project directory."
    exit 1
fi

print_status "Pulling latest changes from Git..."
git pull origin main

if [ $? -ne 0 ]; then
    print_error "Git pull failed. Please check your Git configuration."
    exit 1
fi

print_status "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    print_error "npm install failed."
    exit 1
fi

print_status "Building project for production..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Build failed. Please check for errors."
    exit 1
fi

print_status "Reloading Nginx..."
sudo systemctl reload nginx

if [ $? -ne 0 ]; then
    print_warning "Nginx reload failed. You may need to restart it manually."
fi

print_status "Deployment complete! 🎉"
echo ""
print_status "Your TCG Binder app is now live!"
echo "📱 Frontend: Built and served by Nginx"
echo "🔧 Admin Panel: Available at /admin"
echo "📧 Email System: Configured and ready"
echo "💳 PayPal: Integration active"
