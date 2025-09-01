const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.EMAIL_PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://thetcgbinder.com',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting for email endpoints
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 email requests per windowMs
  message: {
    error: 'Too many email requests from this IP, please try again later.'
  }
});

// Create email transporter based on provider
function createTransporter() {
  const provider = process.env.EMAIL_PROVIDER;
  
  switch (provider) {
    case 'gmail':
      return nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD // Use App Password, not regular password
        }
      });
      
    case 'smtp':
      return nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      });
      
    case 'sendgrid':
      return nodemailer.createTransporter({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      });
      
    default:
      throw new Error(`Unsupported email provider: ${provider}`);
  }
}

// Validate email configuration on startup
async function validateEmailConfig() {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration failed:', error.message);
    return false;
  }
}

// Email endpoint
app.post('/api/send-email', emailLimiter, async (req, res) => {
  try {
    const { to, subject, htmlContent, textContent } = req.body;
    
    // Validate required fields
    if (!to || !subject || !htmlContent) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, htmlContent'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address format'
      });
    }
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `${process.env.FROM_NAME || 'TheTCGBinder'} <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html: htmlContent,
      text: textContent || htmlContent.replace(/<[^>]*>/g, '') // Strip HTML as fallback
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', { to, subject, messageId: info.messageId });
    
    res.json({
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully'
    });
    
  } catch (error) {
    console.error('Failed to send email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send email',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    emailProvider: process.env.EMAIL_PROVIDER || 'not configured'
  });
});

// Test email endpoint (only in development)
if (process.env.NODE_ENV === 'development') {
  app.post('/api/test-email', async (req, res) => {
    try {
      const testEmail = {
        to: req.body.to || process.env.TEST_EMAIL,
        subject: 'TheTCGBinder - Email Test',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1e293b; color: #ffffff; padding: 20px; border-radius: 8px;">
            <h1 style="color: #ef4444;">Email Test Successful!</h1>
            <p>This is a test email from TheTCGBinder email service.</p>
            <p>Timestamp: ${new Date().toISOString()}</p>
          </div>
        `,
        textContent: 'Email Test Successful! This is a test email from TheTCGBinder email service.'
      };
      
      const transporter = createTransporter();
      const info = await transporter.sendMail({
        from: `${process.env.FROM_NAME || 'TheTCGBinder'} <${process.env.FROM_EMAIL}>`,
        ...testEmail
      });
      
      res.json({
        success: true,
        messageId: info.messageId,
        message: 'Test email sent successfully'
      });
      
    } catch (error) {
      console.error('Test email failed:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
}

// Start server
async function startServer() {
  try {
    const isEmailValid = await validateEmailConfig();
    if (!isEmailValid && process.env.NODE_ENV === 'production') {
      console.error('❌ Email configuration is invalid. Server will not start in production.');
      process.exit(1);
    }
    
    app.listen(PORT, () => {
      console.log(`📧 Email server running on port ${PORT}`);
      console.log(`🔧 Email provider: ${process.env.EMAIL_PROVIDER || 'not configured'}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start email server:', error);
    process.exit(1);
  }
}

startServer();
