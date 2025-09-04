#!/bin/bash

# Local Gmail Email Setup Script
# This sets up Gmail email sending for development

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

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

print_status "🔧 Setting up Gmail for TheTCGBinder Email System"
echo ""

# Check if .env exists
ENV_FILE="./server/.env"
if [ ! -f "$ENV_FILE" ]; then
    print_error ".env file not found at $ENV_FILE"
    exit 1
fi

print_status "📋 Gmail Setup Instructions:"
echo ""
echo "1. Go to your Google Account: https://myaccount.google.com/security"
echo "2. Enable 2-Step Verification (if not already enabled)"
echo "3. Go to 'App passwords' section"
echo "4. Generate a new app password for 'Mail'"
echo "5. Copy the 16-character password (no spaces)"
echo ""

# Prompt for Gmail credentials
echo -n "Enter your Gmail address: "
read -r gmail_user

echo -n "Enter your Gmail App Password (16 characters): "
read -s gmail_password
echo ""

echo -n "Enter test email address (where to send test emails): "
read -r test_email

print_status "Updating .env file with Gmail credentials..."

# Update .env file
sed -i.backup "s/GMAIL_USER=.*/GMAIL_USER=$gmail_user/" "$ENV_FILE"
sed -i.backup2 "s/GMAIL_APP_PASSWORD=.*/GMAIL_APP_PASSWORD=$gmail_password/" "$ENV_FILE"
sed -i.backup3 "s/TEST_EMAIL=.*/TEST_EMAIL=$test_email/" "$ENV_FILE"

# Clean up backup files
rm -f "$ENV_FILE.backup" "$ENV_FILE.backup2" "$ENV_FILE.backup3"

print_success "Gmail credentials configured!"

# Test the email configuration
print_status "Testing email configuration..."
cd server
if npm run test; then
    print_success "✅ Email test successful! Check your inbox at $test_email"
    echo ""
    print_status "🚀 Starting email server..."
    print_warning "Keep this terminal open - the email server will run here"
    print_status "You can now test emails in your React app at http://localhost:5173"
    echo ""
    npm start
else
    print_error "❌ Email test failed. Please check your credentials."
    echo ""
    print_status "Common issues:"
    echo "• Make sure you're using an App Password, not your regular Gmail password"
    echo "• Verify 2-Factor Authentication is enabled on your Google account"
    echo "• Check that the App Password is 16 characters with no spaces"
    exit 1
fi
