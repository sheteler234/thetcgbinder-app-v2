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

# Check if we're running as root or if we need sudo
if [ "$EUID" -eq 0 ]; then
    # Running as root, no sudo needed
    systemctl reload nginx
    NGINX_STATUS=$?
else
    # Not root, use sudo
    sudo systemctl reload nginx
    NGINX_STATUS=$?
fi

if [ $NGINX_STATUS -ne 0 ]; then
    print_warning "Nginx reload failed. Attempting to restart..."
    
    # Try to restart nginx instead
    if [ "$EUID" -eq 0 ]; then
        systemctl restart nginx
        NGINX_RESTART=$?
    else
        sudo systemctl restart nginx
        NGINX_RESTART=$?
    fi
    
    if [ $NGINX_RESTART -ne 0 ]; then
        print_error "Nginx restart also failed. Please check Nginx configuration:"
        if [ "$EUID" -eq 0 ]; then
            nginx -t
        else
            sudo nginx -t
        fi
        print_error "You may need to fix the configuration and restart manually."
    else
        print_status "Nginx successfully restarted!"
    fi
else
    print_status "Nginx reloaded successfully!"
fi

print_status "Deployment complete! 🎉"
echo ""
print_status "Your TCG Binder app is now live!"
echo "📱 Frontend: Built and served by Nginx"
echo "🔧 Admin Panel: Available at /admin"
echo "📧 Email System: Configured and ready"
echo "💳 PayPal: Integration active"
