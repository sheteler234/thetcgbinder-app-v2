#!/bin/bash

# Custom deployment script for thetcgbinder.com
# VPS: 72.60.80.207

echo "🚀 Deploying TCG Binder App to thetcgbinder.com..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# VPS Details
VPS_IP="72.60.80.207"
VPS_USER="root"
DOMAIN="thetcgbinder.com"
PROJECT_DIR="/var/www/thetcgbinder-app-v2"

echo "🌐 VPS IP: $VPS_IP"
echo "👤 User: $VPS_USER"  
echo "🌍 Domain: $DOMAIN"
echo "📁 Project Directory: $PROJECT_DIR"
echo ""

# Function to run commands on VPS
run_on_vps() {
    local cmd="$1"
    local description="$2"
    
    print_info "Running on VPS: $description"
    ssh $VPS_USER@$VPS_IP "$cmd"
    
    if [ $? -eq 0 ]; then
        print_status "$description completed"
    else
        print_error "$description failed"
        exit 1
    fi
}

# Step 1: Test SSH connection
print_info "Testing SSH connection to VPS..."
ssh -o ConnectTimeout=10 $VPS_USER@$VPS_IP "echo 'SSH connection successful'"

if [ $? -ne 0 ]; then
    print_error "Cannot connect to VPS. Please check:"
    echo "  - VPS IP: $VPS_IP"
    echo "  - Username: $VPS_USER"
    echo "  - SSH password"
    echo "  - VPS is running"
    exit 1
fi

print_status "SSH connection verified!"

# Step 2: Set up VPS environment (if not done already)
print_info "Setting up VPS environment..."
run_on_vps "curl -fsSL https://raw.githubusercontent.com/sheteler234/thetcgbinder-app-v2/main/vps-setup.sh -o vps-setup.sh && chmod +x vps-setup.sh && ./vps-setup.sh" "VPS environment setup"

# Step 3: Clone or update repository
print_info "Cloning/updating repository on VPS..."
run_on_vps "cd /var/www && if [ -d 'thetcgbinder-app-v2' ]; then cd thetcgbinder-app-v2 && git pull origin main; else git clone https://github.com/sheteler234/thetcgbinder-app-v2.git; fi" "Repository sync"

# Step 4: Install dependencies and build
print_info "Installing dependencies and building project..."
run_on_vps "cd $PROJECT_DIR && npm install && npm run build" "Build process"

# Step 5: Configure Nginx
print_info "Configuring Nginx..."
run_on_vps "cd $PROJECT_DIR && sudo cp nginx.conf /etc/nginx/sites-available/thetcgbinder && sudo ln -sf /etc/nginx/sites-available/thetcgbinder /etc/nginx/sites-enabled/ && sudo nginx -t && sudo systemctl reload nginx" "Nginx configuration"

# Step 6: Set up environment variables
print_info "Setting up environment variables..."
run_on_vps "cd $PROJECT_DIR && cp .env.production .env" "Environment setup"

print_warning "Don't forget to:"
echo "1. 🌐 Point your domain DNS to VPS IP: $VPS_IP"
echo "2. 🔐 Set up SSL: ssh $VPS_USER@$VPS_IP 'sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN'"
echo "3. 💳 Configure PayPal credentials in the admin panel"
echo "4. 📧 Set up email service in admin panel"

print_status "🎉 Deployment to $DOMAIN complete!"
echo ""
print_info "Your app should be accessible at: http://$DOMAIN"
print_info "After SSL setup: https://$DOMAIN"
