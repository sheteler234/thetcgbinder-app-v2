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

### `vps-setup.sh` - Initial VPS Setup
- Installs Node.js, Nginx, Git, Certbot
- Sets up firewall rules
- Configures basic security

### `nginx.conf` - Web Server Configuration
- Serves the React app
- Handles routing for SPA
- Configured for your domain

### `.env.production` - Environment Template
- Production environment variables
- PayPal configuration
- Email service settings

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
