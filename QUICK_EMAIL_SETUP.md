# Quick Email Setup Guide

## 🚀 Quick Start (5 minutes with Gmail)

### 1. Deploy to VPS (will prompt for email setup)
```bash
./scripts/deployment/deploy-to-vps.sh
```

### 2. Set up Gmail App Password
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification if not already enabled
3. Go to **App passwords** → **Mail** → Generate
4. Copy the 16-character password

### 3. Configure Email on VPS
```bash
ssh root@72.60.80.207
nano /var/www/thetcgbinder-email/.env
```

Update these lines:
```env
EMAIL_PROVIDER=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcd-efgh-ijkl-mnop
TEST_EMAIL=your-test@email.com
```

### 4. Test and Start
```bash
cd /var/www/thetcgbinder-email
npm run test  # Should send test email
sudo systemctl start thetcgbinder-email
sudo systemctl status thetcgbinder-email
```

### 5. Verify It's Working
Place a test order on your website - you should receive an email confirmation!

## 📧 Email Features Enabled

✅ **Order Confirmation** - Beautiful HTML emails when orders are placed  
✅ **Status Updates** - Emails when orders are processed, shipped, delivered  
✅ **Professional Templates** - Branded with your logo and colors  
✅ **Rate Limited** - Prevents spam and abuse  
✅ **Secure** - All credentials stored securely on server  

## 🔧 Troubleshooting

**No emails received?**
```bash
sudo journalctl -u thetcgbinder-email -f
```

**Service not starting?**
```bash
sudo systemctl status thetcgbinder-email
```

**Test email manually:**
```bash
curl -X POST https://thetcgbinder.com/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","htmlContent":"<h1>Test</h1>"}'
```

## 📈 Production Recommendations

For high-volume stores (>500 emails/day), consider upgrading to:
- **SendGrid** ($19.95/month for 50K emails)
- **Mailgun** ($15/month for 50K emails) 
- **Amazon SES** (~$5/month for 50K emails)

The setup is identical - just change the `EMAIL_PROVIDER` and credentials in `.env`.
