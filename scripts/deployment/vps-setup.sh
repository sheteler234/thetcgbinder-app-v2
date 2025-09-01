#!/bin/bash

# VPS Setup Script for Ubuntu
# Run this script on your Hostinger VPS to set up the environment

echo "🚀 Setting up VPS for TCG Binder App deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 (LTS)
print_status "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git
print_status "Installing Git..."
sudo apt install git -y

# Install Nginx
print_status "Installing Nginx..."
sudo apt install nginx -y

# Install PM2 globally
print_status "Installing PM2 process manager..."
sudo npm install -g pm2

# Install Certbot for SSL
print_status "Installing Certbot for SSL certificates..."
sudo apt install certbot python3-certbot-nginx -y

# Create web directory
print_status "Creating web directory..."
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www

# Enable UFW firewall
print_status "Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow 'OpenSSH'
sudo ufw --force enable

# Start and enable services
print_status "Starting services..."
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify installations
echo ""
print_status "Installation complete! Verifying versions..."
echo "Node.js: $(node --version)"
echo "NPM: $(npm --version)"
echo "Git: $(git --version | head -1)"
echo "Nginx: $(nginx -v 2>&1)"
echo "PM2: $(pm2 --version)"

echo ""
print_status "🎉 VPS is ready for deployment!"
echo ""
print_warning "Next steps:"
echo "1. Clone your Git repository to /var/www/"
echo "2. Configure Nginx for your domain"
echo "3. Set up SSL certificate with Certbot"
echo "4. Run your deployment script"

# Show server IP
SERVER_IP=$(curl -s ifconfig.me)
echo ""
print_status "Your server IP: $SERVER_IP"
echo "Point your domain's A record to this IP"
