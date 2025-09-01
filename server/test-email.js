const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  console.log('🧪 Testing email configuration...\n');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('- EMAIL_PROVIDER:', process.env.EMAIL_PROVIDER || 'NOT SET');
  console.log('- FROM_EMAIL:', process.env.FROM_EMAIL || 'NOT SET');
  console.log('- FROM_NAME:', process.env.FROM_NAME || 'NOT SET');
  
  if (process.env.EMAIL_PROVIDER === 'gmail') {
    console.log('- GMAIL_USER:', process.env.GMAIL_USER || 'NOT SET');
    console.log('- GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '***SET***' : 'NOT SET');
  }
  
  console.log('\n');
  
  try {
    // Create transporter based on provider
    let transporter;
    
    switch (process.env.EMAIL_PROVIDER) {
      case 'gmail':
        transporter = nodemailer.createTransporter({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
          }
        });
        break;
        
      case 'smtp':
        transporter = nodemailer.createTransporter({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
          }
        });
        break;
        
      case 'sendgrid':
        transporter = nodemailer.createTransporter({
          host: 'smtp.sendgrid.net',
          port: 587,
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
          }
        });
        break;
        
      default:
        throw new Error(`Email provider not configured. Set EMAIL_PROVIDER to: gmail, smtp, or sendgrid`);
    }
    
    // Verify connection
    console.log('⏳ Verifying email connection...');
    await transporter.verify();
    console.log('✅ Email connection verified successfully!\n');
    
    // Send test email
    const testRecipient = process.env.TEST_EMAIL;
    if (!testRecipient) {
      console.log('⚠️  No TEST_EMAIL set. Set TEST_EMAIL environment variable to send a test email.');
      return;
    }
    
    console.log(`📧 Sending test email to: ${testRecipient}`);
    
    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: testRecipient,
      subject: 'TheTCGBinder - Email Server Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1e293b; color: #ffffff; padding: 20px; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ef4444; margin: 20px 0;">🎉 Email Test Successful!</h1>
          </div>
          
          <div style="background-color: #334155; padding: 20px; border-radius: 8px;">
            <p>Congratulations! Your TheTCGBinder email server is working correctly.</p>
            
            <div style="margin: 20px 0; padding: 15px; background-color: #1e293b; border-radius: 6px;">
              <strong>Configuration Details:</strong><br>
              Provider: ${process.env.EMAIL_PROVIDER}<br>
              From Email: ${process.env.FROM_EMAIL}<br>
              Server Time: ${new Date().toISOString()}
            </div>
            
            <p>Your customers will now receive order confirmation and status update emails.</p>
          </div>
        </div>
      `,
      text: `
TheTCGBinder - Email Test Successful!

Congratulations! Your TheTCGBinder email server is working correctly.

Configuration Details:
Provider: ${process.env.EMAIL_PROVIDER}
From Email: ${process.env.FROM_EMAIL}
Server Time: ${new Date().toISOString()}

Your customers will now receive order confirmation and status update emails.
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n💡 Gmail users: Make sure you\'re using an App Password, not your regular password.');
      console.log('   1. Go to Google Account settings');
      console.log('   2. Security > 2-Step Verification > App passwords');
      console.log('   3. Generate an app password for "Mail"');
      console.log('   4. Use that 16-character password in GMAIL_APP_PASSWORD');
    }
    
    process.exit(1);
  }
}

testEmail();
