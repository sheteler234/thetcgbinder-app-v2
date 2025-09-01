# 🎴 TheTCGBinder - Trading Card Game Collection App

A modern React-based application for managing and displaying TCG (Trading Card Game) collections with PayPal integration, order management, and automated email notifications.

## ✨ Features

- � **Interactive Card Binder** - View cards in a realistic binder interface
- 💳 **PayPal Integration** - Secure payment processing (sandbox & production)
- 📦 **Order Management** - Complete order tracking and status updates
- 📧 **Email Notifications** - Automated order confirmations and status updates
- 🛠️ **Admin Panel** - Manage orders, settings, and email templates
- 📱 **Responsive Design** - Works perfectly on all devices
- 🔐 **Authentication System** - User accounts and admin access

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **State Management**: Zustand
- **Payment**: PayPal React SDK
- **Icons**: Lucide React
- **Email**: EmailJS/SMTP/SendGrid support

## 🚀 Quick Start (Development)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🌐 Production Deployment to Hostinger VPS

### Prerequisites
- Ubuntu VPS from Hostinger
- Domain name pointed to your VPS IP
- SSH access to your VPS

### Step 1: Set Up VPS Environment

SSH into your VPS and run the setup script:

```bash
# Upload and run the VPS setup script
scp vps-setup.sh root@your-vps-ip:/root/
ssh root@your-vps-ip
chmod +x vps-setup.sh
./vps-setup.sh
```

### Step 2: Clone and Deploy

```bash
# Clone your repository
cd /var/www
git clone https://github.com/yourusername/thetcgbinder-app.git
cd thetcgbinder-app

# Install dependencies
npm install

# Build the project
npm run build
```

### Step 3: Configure Nginx

```bash
# Copy Nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/thetcgbinder

# Replace 'your-domain.com' with your actual domain
sudo nano /etc/nginx/sites-available/thetcgbinder

# Enable the site
sudo ln -s /etc/nginx/sites-available/thetcgbinder /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 4: Set Up SSL Certificate

```bash
# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Step 5: Configure Environment Variables

```bash
# Copy production environment file
cp .env.production .env

# Edit with your actual values
nano .env
```

### Step 6: Future Deployments

For updates, just run:

```bash
./deploy.sh
```

## 🔧 Configuration

### PayPal Setup
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com)
2. Create a new application
3. Copy Client ID and Secret
4. Update environment variables

### Email Setup
1. Choose your email provider (EmailJS recommended for ease)
2. Configure credentials in admin panel
3. Customize email templates as needed

## � App Structure

```
src/
├── app/
│   ├── layout/          # Layout components
│   └── routes/          # Page components
├── components/
│   ├── binder/          # Card binder components
│   └── ui/              # UI components
├── lib/                 # Utilities and services
├── store/               # Zustand state management
└── data/                # Seed data
```

## 🎯 Key Features

### Order Management
- Real-time order tracking
- Status updates with email notifications
- PayPal sandbox and production support
- Admin order management interface

### Email System
- Automated order confirmations
- Status update notifications
- Customizable email templates
- Multiple email provider support

### Admin Features
- PayPal configuration
- Email template management
- Order status management
- User authentication

## 🧪 Testing

- **PayPal Sandbox**: Use test credentials for development
- **Email System**: Check browser console for email logs
- **Order Flow**: Test complete purchase process
- **Admin Panel**: Verify all admin functions work

## 🎯 Demo Credentials

### Admin Access
- **Email**: `danielshalar5@gmail.com`
- **Password**: `admin1234@`

### Regular User
- **Email**: `user@example.com`
- **Password**: `password123`

## 📄 License

MIT License - feel free to use for your own projects!

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For deployment issues or questions, check the console logs and ensure all environment variables are properly configured.
