# Local Development Email Setup with Gmail

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Gmail App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (if not already enabled)
3. Go to **App passwords**
4. Select **Mail** → **Generate**
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 2: Configure Local Email Server

Edit `server/.env`:
```env
EMAIL_PROVIDER=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
TEST_EMAIL=your-test@email.com
```

### Step 3: Test Email Configuration

```bash
cd server
npm run test
```

You should see:
```
✅ Email configuration is valid
✅ Test email sent successfully!
```

### Step 4: Start Email Server

```bash
cd server
npm start
```

Keep this terminal open - the email server will run on `http://localhost:3001`

### Step 5: Start React App

In a new terminal:
```bash
npm run dev
```

## 🧪 Testing the Integration

1. Open your React app at `http://localhost:5173`
2. Go to **Admin Panel → Email System**
3. Click **"Test Email Connection"**
4. Enter your email address
5. You should receive a test email!

## 🛒 Test Order Emails

1. Add items to cart
2. Go through checkout process
3. Complete an order
4. Check your email for order confirmation!

## 🔧 Development Workflow

**Terminal 1 (Email Server):**
```bash
cd server && npm start
```

**Terminal 2 (React App):**
```bash
npm run dev
```

Now you can test the complete email flow locally before deploying to production! 📧✨
