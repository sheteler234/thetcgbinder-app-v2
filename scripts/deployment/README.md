# Deployment Guide

## 🚀 Deployment Workflow

### 1. Local Development → GitHub

```bash
# Make your changes
git add .
git commit -m "Your descriptive commit message"
git push origin main
```

### 2. GitHub → VPS (Automatic)

```bash
# Run the deployment script
chmod +x scripts/deployment/deploy.sh
./scripts/deployment/deploy.sh
```

## 📝 Deployment Scripts

### `deploy.sh` - Main Deployment Script
- Tests SSH connection to VPS
- Pulls latest code from GitHub
- Installs dependencies
- Builds the production app
- Reloads Nginx
- Optionally sets up email server

### `setup-email-server.sh` - Email Server Setup
- Installs email service dependencies
- Creates systemd service for email server
- Configures Nginx proxy for email API
- Sets up environment template

### `vps-setup.sh` - Initial VPS Setup
- Installs Node.js, Nginx, Git, Certbot
- Sets up firewall rules
- Configures basic security

### `nginx.conf` - Web Server Configuration
- Serves the React app
- Handles routing for SPA
- Proxies email API requests
- Configured for your domain

### `.env.production` - Environment Template
- Production environment variables
- PayPal configuration
- Email API configuration

## 🔧 VPS Information

- **IP:** 72.60.80.207
- **Domain:** thetcgbinder.com
- **User:** root
- **Project Path:** `/var/www/thetcgbinder-app-v2`

## 🌐 DNS Setup

Point your domain to the VPS:
- **A Record:** `thetcgbinder.com` → `72.60.80.207`
- **CNAME Record:** `www` → `thetcgbinder.com`

## 🔒 SSL Setup (After DNS)

```bash
ssh root@72.60.80.207
apt install certbot python3-certbot-nginx -y
certbot --nginx -d thetcgbinder.com -d www.thetcgbinder.com
```

## 🎯 Quick Commands

### Deploy Latest Changes
```bash
./scripts/deployment/deploy.sh
```

### Check VPS Status
```bash
ssh root@72.60.80.207 "systemctl status nginx"
```

### View Logs
```bash
ssh root@72.60.80.207 "tail -f /var/log/nginx/error.log"
```

## 📧 Email System

The email system consists of:

### Frontend Email Service (`src/lib/emailService.ts`)
- **Order Confirmations**: Automatically sent when orders are placed
- **Status Updates**: Sent when order status changes (processing, shipped, delivered, cancelled)
- **Beautiful Templates**: Professional HTML emails with your branding
- **Admin Controls**: Configure and test from the admin panel

### Backend Email Server (`server/email-server.js`)
- **Secure API**: Handles email sending with proper authentication
- **Multiple Providers**: Supports Gmail, SendGrid, and custom SMTP
- **Rate Limiting**: Prevents abuse with 10 emails per 15 minutes per IP
- **Health Monitoring**: Built-in health checks and logging

### Supported Email Providers

1. **Gmail** (Recommended for getting started)
   - Free, 500 emails/day limit
   - Easy setup with App Passwords
   - Reliable delivery

2. **SendGrid** (Recommended for production)
   - 100 emails/day free, paid plans available
   - Designed for transactional emails
   - Better deliverability and analytics

3. **Custom SMTP** (Use your hosting provider)
   - Use your domain's email service
   - Configuration varies by provider

### Email Template Management

Access via Admin Panel → Email System → Edit Email Templates:
- **Visual Editor**: Edit subject lines and HTML content
- **Live Preview**: See how emails will look with sample data
- **Variable System**: Use template variables like `{customerName}`, `{orderId}`
- **Reset to Defaults**: Restore original templates anytime

### Admin Panel Features

1. **Email System Status**: See if service is enabled and working
2. **Test Email Connection**: Send test emails to verify setup
3. **Server Health Check**: Verify backend email server is running
4. **Quick Setup Guide**: Step-by-step instructions
5. **Template Management**: Edit all email templates

### Quick Email Setup

```bash
# 1. Deploy with email setup
./scripts/deployment/deploy-to-vps.sh

# 2. Configure on VPS (example with Gmail)
ssh root@72.60.80.207
nano /var/www/thetcgbinder-email/.env
# Set: EMAIL_PROVIDER=gmail, GMAIL_USER=your@gmail.com, GMAIL_APP_PASSWORD=xxxx

# 3. Test and start
cd /var/www/thetcgbinder-email
npm run test
sudo systemctl start thetcgbinder-email
```

📖 **Complete guides**: `EMAIL_SETUP.md` and `QUICK_EMAIL_SETUP.md`
