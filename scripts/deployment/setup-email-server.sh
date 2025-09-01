#!/bin/bash

# Email Server Setup Script for VPS
# Run this script on your VPS to set up the email service

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

# Configuration
EMAIL_SERVER_DIR="/var/www/thetcgbinder-email"
SERVICE_NAME="thetcgbinder-email"
EMAIL_PORT=3001

print_status "Setting up TheTCGBinder Email Server..."

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   print_status "Please run as a regular user with sudo privileges"
   exit 1
fi

# Create email server directory
print_status "Creating email server directory..."
sudo mkdir -p $EMAIL_SERVER_DIR
sudo chown $USER:$USER $EMAIL_SERVER_DIR

# Copy email server files
print_status "Copying email server files..."
cp -r ../server/* $EMAIL_SERVER_DIR/

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
cd $EMAIL_SERVER_DIR
npm install --production

# Create .env file from example
if [ ! -f .env ]; then
    print_status "Creating .env file from example..."
    cp .env.example .env
    print_warning "Please edit $EMAIL_SERVER_DIR/.env with your email credentials"
else
    print_status ".env file already exists"
fi

# Create systemd service file
print_status "Creating systemd service..."
sudo tee /etc/systemd/system/${SERVICE_NAME}.service > /dev/null <<EOF
[Unit]
Description=TheTCGBinder Email Server
Documentation=https://github.com/your-repo/thetcgbinder
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$EMAIL_SERVER_DIR
Environment=NODE_ENV=production
ExecStart=/usr/bin/node email-server.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=$SERVICE_NAME

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$EMAIL_SERVER_DIR

[Install]
WantedBy=multi-user.target
EOF

# Update Nginx configuration to proxy email API
print_status "Updating Nginx configuration..."
NGINX_CONF="/etc/nginx/sites-available/thetcgbinder.com"

# Check if email proxy already exists
if ! grep -q "location /api/send-email" $NGINX_CONF; then
    print_status "Adding email API proxy to Nginx..."
    
    # Create backup
    sudo cp $NGINX_CONF ${NGINX_CONF}.backup.$(date +%Y%m%d_%H%M%S)
    
    # Add email API proxy before the main location block
    sudo sed -i '/location \/ {/i \
    # Email API proxy\
    location /api/send-email {\
        proxy_pass http://localhost:'$EMAIL_PORT'/api/send-email;\
        proxy_http_version 1.1;\
        proxy_set_header Upgrade $http_upgrade;\
        proxy_set_header Connection '\''upgrade'\'';\
        proxy_set_header Host $host;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto $scheme;\
        proxy_cache_bypass $http_upgrade;\
        \
        # Rate limiting\
        limit_req zone=api burst=10 nodelay;\
    }\
' $NGINX_CONF

    # Test Nginx configuration
    if sudo nginx -t; then
        print_success "Nginx configuration updated successfully"
        sudo systemctl reload nginx
    else
        print_error "Nginx configuration test failed"
        print_status "Restoring backup..."
        sudo mv ${NGINX_CONF}.backup.$(date +%Y%m%d_%H%M%S) $NGINX_CONF
        exit 1
    fi
else
    print_status "Email API proxy already configured in Nginx"
fi

# Add firewall rule for email port (if needed for internal communication)
print_status "Configuring firewall..."
if command -v ufw >/dev/null 2>&1; then
    sudo ufw allow from 127.0.0.1 to any port $EMAIL_PORT comment "TheTCGBinder Email Server"
    print_success "Firewall rule added for email server"
fi

# Enable and start the email service
print_status "Enabling and starting email service..."
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME

# Don't start the service yet - user needs to configure .env first
print_warning "Email service created but not started yet"
print_warning "Please configure $EMAIL_SERVER_DIR/.env with your email credentials first"

print_success "Email server setup completed!"
echo ""
print_status "Next steps:"
echo "1. Edit $EMAIL_SERVER_DIR/.env with your email provider credentials"
echo "2. Test the configuration: cd $EMAIL_SERVER_DIR && npm run test"
echo "3. Start the service: sudo systemctl start $SERVICE_NAME"
echo "4. Check service status: sudo systemctl status $SERVICE_NAME"
echo "5. View logs: sudo journalctl -u $SERVICE_NAME -f"
echo ""
print_status "Email providers setup guides:"
echo "• Gmail: https://support.google.com/accounts/answer/185833 (App Passwords)"
echo "• SendGrid: https://docs.sendgrid.com/for-developers/sending-email/api-getting-started"
echo "• Custom SMTP: Contact your hosting provider for SMTP settings"
