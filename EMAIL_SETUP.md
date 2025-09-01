# Email System Setup Guide

This guide will help you set up a working email system for TheTCGBinder on your VPS to send order confirmations and status updates.

## Overview

The email system consists of:
- **Frontend**: Updated email service that calls your backend API
- **Backend**: Node.js email server that handles actual email sending
- **Email Provider**: Gmail, SendGrid, or custom SMTP

## Step 1: Choose an Email Provider

### Option A: Gmail (Recommended for getting started)
**Pros**: Free, easy to set up, reliable
**Cons**: Daily sending limits (500 emails/day)

### Option B: SendGrid (Recommended for production)
**Pros**: 100 emails/day free, designed for transactional emails, better deliverability
**Cons**: Requires signup and API key

### Option C: Custom SMTP
**Pros**: Use your hosting provider's SMTP
**Cons**: Configuration varies by provider

## Step 2: Deploy the Email Server

1. **Upload email server files to your VPS:**
```bash
# Run this from your local project directory
scp -r server/ root@your-vps-ip:/tmp/thetcgbinder-email-files/
```

2. **Run the setup script on your VPS:**
```bash
ssh root@your-vps-ip
cd /tmp/thetcgbinder-email-files
chmod +x ../scripts/deployment/setup-email-server.sh
../scripts/deployment/setup-email-server.sh
```

## Step 3: Configure Email Provider

### For Gmail:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password:**
   - Go to Google Account settings → Security
   - 2-Step Verification → App passwords
   - Select "Mail" and generate password
   - Copy the 16-character password

3. **Edit the .env file on your VPS:**
```bash
sudo nano /var/www/thetcgbinder-email/.env
```

```env
NODE_ENV=production
EMAIL_PORT=3001
FRONTEND_URL=https://thetcgbinder.com

EMAIL_PROVIDER=gmail
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=TheTCGBinder

GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password

TEST_EMAIL=your-test@email.com
```

### For SendGrid:

1. **Sign up at SendGrid.com**
2. **Create an API Key:**
   - Go to Settings → API Keys
   - Create API Key with "Mail Send" permissions
   - Copy the API key

3. **Edit the .env file:**
```env
NODE_ENV=production
EMAIL_PORT=3001
FRONTEND_URL=https://thetcgbinder.com

EMAIL_PROVIDER=sendgrid
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=TheTCGBinder

SENDGRID_API_KEY=your-sendgrid-api-key

TEST_EMAIL=your-test@email.com
```

### For Custom SMTP:

Contact your hosting provider for SMTP settings, then:

```env
NODE_ENV=production
EMAIL_PORT=3001
FRONTEND_URL=https://thetcgbinder.com

EMAIL_PROVIDER=smtp
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=TheTCGBinder

SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASSWORD=your-smtp-password

TEST_EMAIL=your-test@email.com
```

## Step 4: Test the Email System

1. **Test the configuration:**
```bash
cd /var/www/thetcgbinder-email
npm run test
```

2. **If the test passes, start the service:**
```bash
sudo systemctl start thetcgbinder-email
sudo systemctl status thetcgbinder-email
```

3. **Check logs if there are issues:**
```bash
sudo journalctl -u thetcgbinder-email -f
```

## Step 5: Update Frontend Configuration

Your frontend is already configured to use the backend API. Make sure your `.env.production` has:

```env
VITE_API_URL=https://thetcgbinder.com:3001/api
```

## Step 6: Deploy Updated Frontend

Run your existing deployment script to deploy the updated frontend:

```bash
./scripts/deployment/deploy-to-vps.sh
```

## Email Templates

The system includes beautiful email templates for:
- **Order Confirmation**: Sent when an order is placed
- **Order Processing**: Sent when order status changes to "processing"  
- **Order Shipped**: Sent when order status changes to "shipped"
- **Order Delivered**: Sent when order status changes to "delivered"
- **Order Cancelled**: Sent when order is cancelled

## Monitoring and Troubleshooting

### Check Email Service Status:
```bash
sudo systemctl status thetcgbinder-email
```

### View Real-time Logs:
```bash
sudo journalctl -u thetcgbinder-email -f
```

### Restart Email Service:
```bash
sudo systemctl restart thetcgbinder-email
```

### Test Email Sending:
```bash
curl -X POST https://thetcgbinder.com/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "htmlContent": "<h1>Test</h1>",
    "textContent": "Test"
  }'
```

## Security Considerations

- ✅ **Rate limiting**: 10 emails per 15 minutes per IP
- ✅ **Email validation**: Validates email format before sending
- ✅ **Environment isolation**: Sensitive data in .env file
- ✅ **Service isolation**: Runs as non-root user
- ✅ **HTTPS only**: All API calls over HTTPS

## Common Issues

### Gmail "Less secure app access" error:
- Use App Passwords instead of your regular password
- Enable 2-Factor Authentication first

### SendGrid emails going to spam:
- Add SPF and DKIM records to your domain
- Verify your sender identity in SendGrid

### SMTP authentication failed:
- Double-check your SMTP credentials
- Verify the SMTP host and port with your provider

## Production Tips

1. **Monitor email delivery**: Check logs regularly for failed sends
2. **Set up email alerts**: Monitor the email service with your monitoring system
3. **Backup configuration**: Keep a backup of your .env file
4. **Update regularly**: Keep Node.js dependencies updated for security

## Email Provider Limits

- **Gmail**: 500 emails/day, 100 emails per batch
- **SendGrid Free**: 100 emails/day
- **SendGrid Paid**: Starts at 40,000 emails/month
- **Custom SMTP**: Varies by provider
