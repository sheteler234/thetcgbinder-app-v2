import type { Order } from './types';

// Helper function to get the correct logo URL based on environment
const getLogoUrl = (): string => {
  // Use Imgur hosted logo for reliable email delivery
  return 'https://i.imgur.com/qKZEJmp.png';
};

// Helper function to get the correct base URL for links based on environment
const getBaseUrl = (): string => {
  const isDev = import.meta.env.DEV;
  return isDev ? 'http://localhost:5175' : 'https://thetcgbinder.com';
};

// Helper function to get the correct API URL based on environment
const getApiUrl = (): string => {
  const isDev = import.meta.env.DEV;
  return isDev ? 'http://localhost:3005/api' : 'https://thetcgbinder.com:3005/api';
};

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
}

export interface EmailSettings {
  enabled: boolean;
  provider: 'gmail-dev' | 'gmail-prod' | 'smtp';
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpSecure?: boolean;
  fromEmail: string;
  fromName: string;
}

// Default email templates
export const defaultEmailTemplates: EmailTemplate[] = [
  {
    id: 'order_confirmation',
    name: 'Order Confirmation',
    subject: 'Order Confirmation - #{orderId}',
    htmlContent: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <!--[if mso]>
        <noscript>
          <xml>
            <o:OfficeDocumentSettings>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
        </noscript>
        <![endif]-->
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            background-color: #0f172a;
            color: #ffffff;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          }
          
          .header {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><radialGradient id="a" cx="50%" cy="0%" r="100%"><stop offset="0%" stop-color="white" stop-opacity="0.1"/><stop offset="100%" stop-color="white" stop-opacity="0"/></radialGradient></defs><rect width="100" height="20" fill="url(%23a)"/></svg>');
            opacity: 0.3;
          }
          
          .logo {
            max-width: 180px;
            height: auto;
            margin-bottom: 20px;
            filter: brightness(0) invert(1);
            position: relative;
            z-index: 1;
          }
          
          .header h1 {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            position: relative;
            z-index: 1;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #ef4444;
            margin-bottom: 20px;
          }
          
          .message {
            font-size: 16px;
            color: #cbd5e1;
            margin-bottom: 30px;
            line-height: 1.7;
          }
          
          .order-details {
            background: rgba(15, 23, 42, 0.6);
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            border: 1px solid #475569;
            backdrop-filter: blur(10px);
          }
          
          .order-details h3 {
            color: #ef4444;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
          }
          
          .order-details h3::before {
            content: '📋';
            margin-right: 8px;
            font-size: 20px;
          }
          
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #334155;
          }
          
          .detail-row:last-child {
            border-bottom: none;
            font-weight: 600;
            color: #10b981;
            font-size: 18px;
          }
          
          .detail-label {
            color: #94a3b8;
            font-weight: 500;
          }
          
          .detail-value {
            color: #ffffff;
            font-weight: 600;
          }
          
          .items-section {
            background: rgba(15, 23, 42, 0.6);
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            border: 1px solid #475569;
          }
          
          .items-section h3 {
            color: #ef4444;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
          }
          
          .items-section h3::before {
            content: '🛍️';
            margin-right: 8px;
            font-size: 20px;
          }
          
          .item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 0;
            border-bottom: 1px solid #334155;
          }
          
          .item:last-child {
            border-bottom: none;
          }
          
          .item-info {
            flex: 1;
          }
          
          .item-title {
            color: #ffffff;
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 4px;
          }
          
          .item-details {
            color: #94a3b8;
            font-size: 14px;
          }
          
          .item-price {
            color: #10b981;
            font-weight: 700;
            font-size: 16px;
          }
          
          .shipping-section {
            background: rgba(15, 23, 42, 0.6);
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            border: 1px solid #475569;
          }
          
          .shipping-section h3 {
            color: #ef4444;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
          }
          
          .shipping-section h3::before {
            content: '📦';
            margin-right: 8px;
            font-size: 20px;
          }
          
          .address {
            color: #cbd5e1;
            line-height: 1.6;
            font-size: 15px;
          }
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 30px 0;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
            transition: all 0.3s ease;
          }
          
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
          }
          
          .footer {
            background: #0f172a;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #334155;
          }
          
          .footer-links {
            margin-bottom: 20px;
          }
          
          .footer-links a {
            color: #ef4444;
            text-decoration: none;
            margin: 0 15px;
            font-weight: 500;
          }
          
          .footer-links a:hover {
            color: #dc2626;
            text-decoration: underline;
          }
          
          .social-links {
            margin: 20px 0;
          }
          
          .social-links a {
            display: inline-block;
            width: 40px;
            height: 40px;
            background: #334155;
            border-radius: 50%;
            margin: 0 8px;
            text-decoration: none;
            line-height: 40px;
            text-align: center;
            color: #94a3b8;
            transition: all 0.3s ease;
          }
          
          .social-links a:hover {
            background: #ef4444;
            color: #ffffff;
            transform: translateY(-2px);
          }
          
          .footer-info {
            color: #64748b;
            font-size: 14px;
            line-height: 1.6;
          }
          
          .divider {
            width: 60px;
            height: 3px;
            background: linear-gradient(90deg, #ef4444, #dc2626);
            margin: 20px auto;
            border-radius: 2px;
          }
          
          @media (max-width: 600px) {
            .container {
              margin: 10px;
              border-radius: 8px;
            }
            
            .header, .content, .footer {
              padding: 20px;
            }
            
            .header h1 {
              font-size: 24px;
            }
            
            .order-details, .items-section, .shipping-section {
              padding: 20px;
            }
            
            .item {
              flex-direction: column;
              align-items: flex-start;
            }
            
            .item-price {
              margin-top: 8px;
              align-self: flex-end;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${getLogoUrl()}" alt="TheTCGBinder" class="logo" />
            <h1>Order Confirmation</h1>
          </div>
          
          <div class="content">
            <div class="greeting">Hi {customerName}! 👋</div>
            <div class="message">
              Thank you for your order! We've successfully received your payment and are now preparing your items for shipment. 
              You'll receive tracking information as soon as your package is on its way.
            </div>
            
            <div class="order-details">
              <h3>Order Details</h3>
              <div class="detail-row">
                <span class="detail-label">Order ID</span>
                <span class="detail-value">#{orderId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Order Date</span>
                <span class="detail-value">{orderDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Method</span>
                <span class="detail-value">{paymentMethod}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total Amount</span>
                <span class="detail-value">{total}</span>
              </div>
            </div>
            
            <div class="items-section">
              <h3>Items Ordered</h3>
              {itemsList}
            </div>
            
            <div class="shipping-section">
              <h3>Shipping Address</h3>
              <div class="address">
                <strong>{customerName}</strong><br>
                {shippingAddress}<br>
                {shippingCity}, {shippingState} {shippingZip}<br>
                {shippingCountry}
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="${getBaseUrl()}/orders" class="cta-button">Track Your Order</a>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-links">
              <a href="${getBaseUrl()}/">Home</a>
              <a href="${getBaseUrl()}/products">Shop</a>
              <a href="mailto:support@thetcgbinder.com">Support</a>
              <a href="${getBaseUrl()}/terms">Terms</a>
            </div>
            
            <div class="social-links">
              <a href="#">📘</a>
              <a href="#">🐦</a>
              <a href="#">📷</a>
              <a href="#">📺</a>
            </div>
            
            <div class="divider"></div>
            
            <div class="footer-info">
              <strong>TheTCGBinder</strong><br>
              Your premier destination for trading cards<br>
              <br>
              Need help? Reply to this email or contact us at<br>
              <a href="mailto:support@thetcgbinder.com" style="color: #ef4444;">support@thetcgbinder.com</a><br>
              <br>
              © 2025 TheTCGBinder. All rights reserved.
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `
Order Confirmation - #{orderId}

Hi {customerName},

Thank you for your order! We've successfully received your payment and are now preparing your items for shipment.

Order Details:
- Order ID: #{orderId}
- Order Date: {orderDate}
- Payment Method: {paymentMethod}
- Total Amount: {total}

Items Ordered:
{itemsList}

Shipping Address:
{customerName}
{shippingAddress}
{shippingCity}, {shippingState} {shippingZip}
{shippingCountry}

Track your order: ${getBaseUrl()}/orders

Questions? Contact us at support@thetcgbinder.com

TheTCGBinder - Your premier destination for trading cards
© 2025 TheTCGBinder. All rights reserved.
    `,
    variables: ['customerName', 'orderId', 'orderDate', 'total', 'paymentMethod', 'itemsList', 'shippingAddress', 'shippingCity', 'shippingState', 'shippingZip', 'shippingCountry']
  },
  {
    id: 'order_processing',
    name: 'Order Processing',
    subject: 'Your order #{orderId} is being processed',
    htmlContent: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Processing</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            background-color: #0f172a;
            color: #ffffff;
            margin: 0;
            padding: 20px;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          }
          
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
          }
          
          .logo {
            max-width: 180px;
            height: auto;
            margin-bottom: 20px;
            filter: brightness(0) invert(1);
          }
          
          .header h1 {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #3b82f6;
            margin-bottom: 20px;
          }
          
          .message {
            font-size: 16px;
            color: #cbd5e1;
            margin-bottom: 30px;
            line-height: 1.7;
          }
          
          .status-box {
            background: rgba(15, 23, 42, 0.6);
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            border: 1px solid #475569;
            text-align: center;
          }
          
          .status-icon {
            font-size: 48px;
            margin-bottom: 15px;
          }
          
          .status-title {
            color: #3b82f6;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 10px;
          }
          
          .order-total {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            font-size: 18px;
            font-weight: 600;
            margin: 20px 0;
          }
          
          .timeline {
            margin: 30px 0;
          }
          
          .timeline-item {
            display: flex;
            align-items: center;
            margin: 15px 0;
            padding: 15px;
            background: rgba(59, 130, 246, 0.1);
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
          }
          
          .timeline-icon {
            margin-right: 15px;
            font-size: 20px;
          }
          
          .footer {
            background: #0f172a;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #334155;
          }
          
          .footer-links {
            margin-bottom: 20px;
          }
          
          .footer-links a {
            color: #3b82f6;
            text-decoration: none;
            margin: 0 15px;
            font-weight: 500;
          }
          
          .footer-links a:hover {
            color: #2563eb;
            text-decoration: underline;
          }
          
          .social-links {
            margin: 20px 0;
          }
          
          .social-links a {
            display: inline-block;
            width: 40px;
            height: 40px;
            background: #334155;
            border-radius: 50%;
            margin: 0 8px;
            text-decoration: none;
            line-height: 40px;
            text-align: center;
            color: #94a3b8;
            transition: all 0.3s ease;
          }
          
          .social-links a:hover {
            background: #3b82f6;
            color: #ffffff;
            transform: translateY(-2px);
          }
          
          .footer-info {
            color: #64748b;
            font-size: 14px;
            line-height: 1.6;
          }
          
          .divider {
            width: 60px;
            height: 3px;
            background: linear-gradient(90deg, #3b82f6, #2563eb);
            margin: 20px auto;
            border-radius: 2px;
          }
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${getLogoUrl()}" alt="TheTCGBinder" class="logo" />
            <h1>Order Processing</h1>
          </div>
          
          <div class="content">
            <div class="greeting">Hi {customerName}! 🚀</div>
            <div class="message">
              Great news! Your order <strong>#{orderId}</strong> is now being processed. Our team is carefully preparing your items for shipment.
            </div>
            
            <div class="status-box">
              <div class="status-icon">⚡</div>
              <div class="status-title">Processing Your Order</div>
              <div style="color: #94a3b8; font-size: 14px;">
                We're getting your cards ready with care and attention to detail
              </div>
            </div>
            
            <div class="order-total">
              Order Total: {total}
            </div>
            
            <div class="timeline">
              <div class="timeline-item">
                <span class="timeline-icon">✅</span>
                <div>
                  <strong style="color: #10b981;">Order Received</strong><br>
                  <span style="color: #94a3b8; font-size: 14px;">Your order and payment have been confirmed</span>
                </div>
              </div>
              <div class="timeline-item">
                <span class="timeline-icon">⚡</span>
                <div>
                  <strong style="color: #3b82f6;">Processing</strong><br>
                  <span style="color: #94a3b8; font-size: 14px;">We're preparing your items for shipment</span>
                </div>
              </div>
              <div class="timeline-item" style="opacity: 0.5;">
                <span class="timeline-icon">📦</span>
                <div>
                  <strong style="color: #94a3b8;">Shipping</strong><br>
                  <span style="color: #64748b; font-size: 14px;">You'll receive tracking info soon</span>
                </div>
              </div>
              <div class="timeline-item" style="opacity: 0.5;">
                <span class="timeline-icon">🎉</span>
                <div>
                  <strong style="color: #94a3b8;">Delivered</strong><br>
                  <span style="color: #64748b; font-size: 14px;">Enjoy your new cards!</span>
                </div>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="${getBaseUrl()}/orders" class="cta-button">Track Your Order</a>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-links">
              <a href="${getBaseUrl()}/">Home</a>
              <a href="${getBaseUrl()}/products">Shop</a>
              <a href="mailto:support@thetcgbinder.com">Support</a>
              <a href="${getBaseUrl()}/terms">Terms</a>
            </div>
            
            <div class="social-links">
              <a href="#">📘</a>
              <a href="#">🐦</a>
              <a href="#">📷</a>
              <a href="#">📺</a>
            </div>
            
            <div class="divider"></div>
            
            <div class="footer-info">
              <strong>TheTCGBinder</strong><br>
              Your premier destination for trading cards<br>
              <br>
              Questions? Reply to this email or contact us at<br>
              <a href="mailto:support@thetcgbinder.com" style="color: #3b82f6;">support@thetcgbinder.com</a><br>
              <br>
              © 2025 TheTCGBinder. All rights reserved.
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `
Your order #{orderId} is being processed

Hi {customerName},

Great news! Your order #{orderId} is now being processed.

We're carefully preparing your items for shipment. You'll receive another email when your order ships.

Order Total: {total}

Status Timeline:
✅ Order Received - Your order and payment have been confirmed
⚡ Processing - We're preparing your items for shipment
📦 Shipping - You'll receive tracking info soon
🎉 Delivered - Enjoy your new cards!

Track your order: ${getBaseUrl()}/orders

Questions? Contact us at support@thetcgbinder.com

TheTCGBinder
© 2025 TheTCGBinder. All rights reserved.
    `,
    variables: ['customerName', 'orderId', 'total']
  },
  {
    id: 'order_shipped',
    name: 'Order Shipped',
    subject: 'Your order #{orderId} has shipped!',
    htmlContent: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Shipped</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            background-color: #0f172a;
            color: #ffffff;
            margin: 0;
            padding: 20px;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          }
          
          .header {
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
          }
          
          .logo {
            max-width: 180px;
            height: auto;
            margin-bottom: 20px;
            filter: brightness(0) invert(1);
          }
          
          .header h1 {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #8b5cf6;
            margin-bottom: 20px;
          }
          
          .message {
            font-size: 16px;
            color: #cbd5e1;
            margin-bottom: 30px;
            line-height: 1.7;
          }
          
          .shipping-box {
            background: rgba(15, 23, 42, 0.6);
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            border: 1px solid #475569;
          }
          
          .shipping-icon {
            text-align: center;
            font-size: 64px;
            margin-bottom: 20px;
          }
          
          .shipping-title {
            color: #8b5cf6;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 15px;
            text-align: center;
          }
          
          .tracking-info {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          
          .tracking-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
          }
          
          .tracking-label {
            font-weight: 500;
          }
          
          .tracking-value {
            font-weight: 600;
          }
          
          .delivery-estimate {
            background: rgba(139, 92, 246, 0.1);
            border: 2px solid #8b5cf6;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
          }
          
          .delivery-date {
            color: #8b5cf6;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 5px;
          }
          
          .delivery-note {
            color: #94a3b8;
            font-size: 14px;
          }
          
          .footer {
            background: #0f172a;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #334155;
          }
          
          .footer-links {
            margin-bottom: 20px;
          }
          
          .footer-links a {
            color: #8b5cf6;
            text-decoration: none;
            margin: 0 15px;
            font-weight: 500;
          }
          
          .footer-links a:hover {
            color: #7c3aed;
            text-decoration: underline;
          }
          
          .social-links {
            margin: 20px 0;
          }
          
          .social-links a {
            display: inline-block;
            width: 40px;
            height: 40px;
            background: #334155;
            border-radius: 50%;
            margin: 0 8px;
            text-decoration: none;
            line-height: 40px;
            text-align: center;
            color: #94a3b8;
            transition: all 0.3s ease;
          }
          
          .social-links a:hover {
            background: #8b5cf6;
            color: #ffffff;
            transform: translateY(-2px);
          }
          
          .footer-info {
            color: #64748b;
            font-size: 14px;
            line-height: 1.6;
          }
          
          .divider {
            width: 60px;
            height: 3px;
            background: linear-gradient(90deg, #8b5cf6, #7c3aed);
            margin: 20px auto;
            border-radius: 2px;
          }
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${getLogoUrl()}" alt="TheTCGBinder" class="logo" />
            <h1>Order Shipped!</h1>
          </div>
          
          <div class="content">
            <div class="greeting">Hi {customerName}! 📦</div>
            <div class="message">
              Exciting news! Your order <strong>#{orderId}</strong> has been shipped and is on its way to you. 
              We've carefully packed your cards to ensure they arrive in perfect condition.
            </div>
            
            <div class="shipping-box">
              <div class="shipping-icon">🚚</div>
              <div class="shipping-title">Your Package is on the Way!</div>
              
              <div class="tracking-info">
                <div class="tracking-row">
                  <span class="tracking-label">Carrier:</span>
                  <span class="tracking-value">Standard Shipping</span>
                </div>
                <div class="tracking-row">
                  <span class="tracking-label">Service:</span>
                  <span class="tracking-value">Ground Delivery</span>
                </div>
                <div class="tracking-row">
                  <span class="tracking-label">Order #:</span>
                  <span class="tracking-value">#{orderId}</span>
                </div>
              </div>
              
              <div class="delivery-estimate">
                <div class="delivery-date">Estimated Delivery</div>
                <div style="font-size: 24px; font-weight: 700; color: #8b5cf6; margin: 10px 0;">3-5 Business Days</div>
                <div class="delivery-note">
                  We'll send you another email when your package is delivered
                </div>
              </div>
            </div>
            
            <div style="background: rgba(15, 23, 42, 0.6); border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #475569;">
              <h4 style="color: #8b5cf6; margin-top: 0; margin-bottom: 15px;">📝 What's Next?</h4>
              <ul style="color: #cbd5e1; margin: 0; padding-left: 20px;">
                <li>Keep an eye on your email for delivery confirmation</li>
                <li>Make sure someone is available to receive the package</li>
                <li>Check the package immediately upon arrival</li>
                <li>Contact us if there are any issues</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${getBaseUrl()}/orders" class="cta-button">Track Your Order</a>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-links">
              <a href="${getBaseUrl()}/">Home</a>
              <a href="${getBaseUrl()}/products">Shop</a>
              <a href="mailto:support@thetcgbinder.com">Support</a>
              <a href="${getBaseUrl()}/terms">Terms</a>
            </div>
            
            <div class="social-links">
              <a href="#">📘</a>
              <a href="#">🐦</a>
              <a href="#">📷</a>
              <a href="#">📺</a>
            </div>
            
            <div class="divider"></div>
            
            <div class="footer-info">
              <strong>TheTCGBinder</strong><br>
              Your premier destination for trading cards<br>
              <br>
              Questions about your shipment? We're here to help!<br>
              <a href="mailto:support@thetcgbinder.com" style="color: #8b5cf6;">support@thetcgbinder.com</a><br>
              <br>
              © 2025 TheTCGBinder. All rights reserved.
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `
Your order #{orderId} has shipped!

Hi {customerName},

Exciting news! Your order #{orderId} has been shipped and is on its way to you!

Shipping Information:
- Carrier: Standard Shipping
- Service: Ground Delivery  
- Order #: #{orderId}
- Estimated Delivery: 3-5 business days

What's Next?
- Keep an eye on your email for delivery confirmation
- Make sure someone is available to receive the package
- Check the package immediately upon arrival
- Contact us if there are any issues

Track your order: ${getBaseUrl()}/orders

Questions? Contact us at support@thetcgbinder.com

TheTCGBinder
© 2025 TheTCGBinder. All rights reserved.
    `,
    variables: ['customerName', 'orderId']
  },
  {
    id: 'order_delivered',
    name: 'Order Delivered',
    subject: 'Your order #{orderId} has been delivered',
    htmlContent: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Delivered</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            background-color: #0f172a;
            color: #ffffff;
            margin: 0;
            padding: 20px;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          }
          
          .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
          }
          
          .logo {
            max-width: 180px;
            height: auto;
            margin-bottom: 20px;
            filter: brightness(0) invert(1);
          }
          
          .header h1 {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #10b981;
            margin-bottom: 20px;
          }
          
          .message {
            font-size: 16px;
            color: #cbd5e1;
            margin-bottom: 30px;
            line-height: 1.7;
          }
          
          .celebration-box {
            background: rgba(16, 185, 129, 0.1);
            border: 2px solid #10b981;
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            text-align: center;
          }
          
          .celebration-icon {
            font-size: 64px;
            margin-bottom: 20px;
          }
          
          .celebration-title {
            color: #10b981;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 10px;
          }
          
          .celebration-subtitle {
            color: #cbd5e1;
            font-size: 16px;
            margin-bottom: 20px;
          }
          
          .review-section {
            background: rgba(15, 23, 42, 0.6);
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            border: 1px solid #475569;
            text-align: center;
          }
          
          .review-title {
            color: #f59e0b;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .review-title::before {
            content: '⭐';
            margin-right: 8px;
            font-size: 24px;
          }
          
          .star-rating {
            display: flex;
            justify-content: center;
            gap: 5px;
            margin: 20px 0;
          }
          
          .star {
            font-size: 32px;
            color: #f59e0b;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .support-box {
            background: rgba(15, 23, 42, 0.6);
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #3b82f6;
          }
          
          .support-title {
            color: #3b82f6;
            font-weight: 600;
            margin-bottom: 10px;
          }
          
          .footer {
            background: #0f172a;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #334155;
          }
          
          .footer-info {
            color: #64748b;
            font-size: 14px;
            line-height: 1.6;
          }
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 10px;
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
          }
          
          .secondary-button {
            display: inline-block;
            background: transparent;
            color: #10b981;
            border: 2px solid #10b981;
            text-decoration: none;
            padding: 13px 28px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${getLogoUrl()}" alt="TheTCGBinder" class="logo" />
            <h1>Order Delivered!</h1>
          </div>
          
          <div class="content">
            <div class="greeting">Hi {customerName}! 🎉</div>
            <div class="message">
              Fantastic news! Your order <strong>#{orderId}</strong> has been successfully delivered. 
              We hope you're thrilled with your new cards and that they exceed your expectations!
            </div>
            
            <div class="celebration-box">
              <div class="celebration-icon">📦✨</div>
              <div class="celebration-title">Successfully Delivered!</div>
              <div class="celebration-subtitle">
                Your cards should be safely in your hands now. Time to add them to your collection!
              </div>
            </div>
            
            <div class="review-section">
              <div class="review-title">How was your experience?</div>
              <div style="color: #94a3b8; margin-bottom: 20px;">
                Your feedback helps us serve collectors like you even better
              </div>
              <div class="star-rating">
                <span class="star">⭐</span>
                <span class="star">⭐</span>
                <span class="star">⭐</span>
                <span class="star">⭐</span>
                <span class="star">⭐</span>
              </div>
              <div style="margin-top: 20px;">
                <a href="${getBaseUrl()}/review?order={orderId}" class="cta-button">Leave a Review</a>
              </div>
            </div>
            
            <div class="support-box">
              <div class="support-title">🛡️ Quality Guarantee</div>
              <div style="color: #cbd5e1; font-size: 14px;">
                If there are any issues with your order, please contact us within 24 hours of delivery. 
                We stand behind every card we ship and want to make sure you're completely satisfied.
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${getBaseUrl()}/products" class="secondary-button">Continue Shopping</a>
              <a href="${getBaseUrl()}/support" class="secondary-button">Get Support</a>
            </div>
          </div>
          
          <div class="footer">
            <div style="color: #10b981; font-weight: 600; margin-bottom: 15px;">
              Thank you for choosing TheTCGBinder! 🙏
            </div>
            <div class="footer-info">
              <strong>TheTCGBinder</strong><br>
              Your premier destination for trading cards<br>
              <br>
              Questions or concerns? We're here to help!<br>
              <a href="mailto:support@thetcgbinder.com" style="color: #10b981;">support@thetcgbinder.com</a><br>
              <br>
              © 2025 TheTCGBinder. All rights reserved.
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `
Your order #{orderId} has been delivered

Hi {customerName},

Fantastic news! Your order #{orderId} has been successfully delivered.

We hope you're thrilled with your new cards and that they exceed your expectations!

📦✨ Successfully Delivered!
Your cards should be safely in your hands now. Time to add them to your collection!

⭐ How was your experience?
Your feedback helps us serve collectors like you even better.
Leave a review: ${getBaseUrl()}/review?order={orderId}

🛡️ Quality Guarantee
If there are any issues with your order, please contact us within 24 hours of delivery. 
We stand behind every card we ship and want to make sure you're completely satisfied.

Continue shopping: ${getBaseUrl()}/products
Get support: ${getBaseUrl()}/support

Thank you for choosing TheTCGBinder! 🙏

Questions? Contact us at support@thetcgbinder.com

TheTCGBinder - Your premier destination for trading cards
© 2025 TheTCGBinder. All rights reserved.
    `,
    variables: ['customerName', 'orderId']
  },
  {
    id: 'order_cancelled',
    name: 'Order Cancelled',
    subject: 'Your order #{orderId} has been cancelled',
    htmlContent: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Cancelled</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            background-color: #0f172a;
            color: #ffffff;
            margin: 0;
            padding: 20px;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          }
          
          .header {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
          }
          
          .logo {
            max-width: 180px;
            height: auto;
            margin-bottom: 20px;
            filter: brightness(0) invert(1);
          }
          
          .header h1 {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #ef4444;
            margin-bottom: 20px;
          }
          
          .message {
            font-size: 16px;
            color: #cbd5e1;
            margin-bottom: 30px;
            line-height: 1.7;
          }
          
          .cancellation-box {
            background: rgba(239, 68, 68, 0.1);
            border: 2px solid #ef4444;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            text-align: center;
          }
          
          .cancellation-icon {
            font-size: 48px;
            margin-bottom: 15px;
          }
          
          .cancellation-title {
            color: #ef4444;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 10px;
          }
          
          .refund-info {
            background: rgba(15, 23, 42, 0.6);
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            border: 1px solid #475569;
          }
          
          .refund-title {
            color: #10b981;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
          }
          
          .refund-title::before {
            content: '💳';
            margin-right: 8px;
            font-size: 20px;
          }
          
          .refund-timeline {
            margin: 20px 0;
          }
          
          .timeline-item {
            display: flex;
            align-items: center;
            margin: 15px 0;
            padding: 15px;
            background: rgba(16, 185, 129, 0.1);
            border-radius: 8px;
            border-left: 4px solid #10b981;
          }
          
          .timeline-icon {
            margin-right: 15px;
            font-size: 20px;
          }
          
          .help-section {
            background: rgba(15, 23, 42, 0.6);
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #f59e0b;
          }
          
          .help-title {
            color: #f59e0b;
            font-weight: 600;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
          }
          
          .help-title::before {
            content: '❓';
            margin-right: 8px;
            font-size: 18px;
          }
          
          .footer {
            background: #0f172a;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #334155;
          }
          
          .footer-info {
            color: #64748b;
            font-size: 14px;
            line-height: 1.6;
          }
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 10px;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          }
          
          .secondary-button {
            display: inline-block;
            background: transparent;
            color: #94a3b8;
            border: 2px solid #475569;
            text-decoration: none;
            padding: 13px 28px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${getLogoUrl()}" alt="TheTCGBinder" class="logo" />
            <h1>Order Cancelled</h1>
          </div>
          
          <div class="content">
            <div class="greeting">Hi {customerName},</div>
            <div class="message">
              We're writing to inform you that your order <strong>#{orderId}</strong> has been cancelled. 
              We apologize for any inconvenience this may cause and want to make this right.
            </div>
            
            <div class="cancellation-box">
              <div class="cancellation-icon">⏹️</div>
              <div class="cancellation-title">Order Cancelled</div>
              <div style="color: #94a3b8; font-size: 14px;">
                Order #{orderId} has been successfully cancelled
              </div>
            </div>
            
            <div class="refund-info">
              <div class="refund-title">Refund Information</div>
              <div style="color: #cbd5e1; margin-bottom: 20px;">
                If payment was processed, a refund will be automatically initiated and should appear in your account within the timeframe below:
              </div>
              
              <div class="refund-timeline">
                <div class="timeline-item">
                  <span class="timeline-icon">💳</span>
                  <div>
                    <strong style="color: #10b981;">Credit/Debit Cards</strong><br>
                    <span style="color: #94a3b8; font-size: 14px;">3-5 business days</span>
                  </div>
                </div>
                <div class="timeline-item">
                  <span class="timeline-icon">🏦</span>
                  <div>
                    <strong style="color: #10b981;">Bank Transfer</strong><br>
                    <span style="color: #94a3b8; font-size: 14px;">5-7 business days</span>
                  </div>
                </div>
                <div class="timeline-item">
                  <span class="timeline-icon">📱</span>
                  <div>
                    <strong style="color: #10b981;">PayPal</strong><br>
                    <span style="color: #94a3b8; font-size: 14px;">1-3 business days</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="help-section">
              <div class="help-title">Didn't request this cancellation?</div>
              <div style="color: #cbd5e1; font-size: 14px;">
                If you didn't request this cancellation or have questions about your order, 
                please contact our support team immediately. We're here to help resolve any issues.
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${getBaseUrl()}/products" class="cta-button">Continue Shopping</a>
              <a href="mailto:support@thetcgbinder.com" class="secondary-button">Contact Support</a>
            </div>
          </div>
          
          <div class="footer">
            <div style="color: #ef4444; font-weight: 600; margin-bottom: 15px;">
              We're sorry to see this order cancelled 😔
            </div>
            <div class="footer-info">
              <strong>TheTCGBinder</strong><br>
              We're committed to providing the best experience possible<br>
              <br>
              Questions about your cancellation or refund?<br>
              <a href="mailto:support@thetcgbinder.com" style="color: #ef4444;">support@thetcgbinder.com</a><br>
              <br>
              © 2025 TheTCGBinder. All rights reserved.
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `
Your order #{orderId} has been cancelled

Hi {customerName},

We're writing to inform you that your order #{orderId} has been cancelled.

⏹️ Order Cancelled
Order #{orderId} has been successfully cancelled

💳 Refund Information
If payment was processed, a refund will be automatically initiated:

- Credit/Debit Cards: 3-5 business days
- Bank Transfer: 5-7 business days  
- PayPal: 1-3 business days

❓ Didn't request this cancellation?
If you didn't request this cancellation or have questions about your order, 
please contact our support team immediately.

Continue shopping: ${getBaseUrl()}/products
Contact support: support@thetcgbinder.com

We're sorry to see this order cancelled 😔

Questions about your cancellation or refund?
Contact us at support@thetcgbinder.com

TheTCGBinder
© 2025 TheTCGBinder. All rights reserved.
    `,
    variables: ['customerName', 'orderId']
  }
];

class EmailService {
  private settings!: EmailSettings;
  private templates!: EmailTemplate[];

  constructor() {
    this.loadSettings();
    this.loadTemplates();
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem('emailSettings');
      this.settings = saved ? JSON.parse(saved) : {
        enabled: true,
        provider: 'gmail-dev', // Use Gmail dev by default
        fromEmail: 'noreply@thetcgbinder.com',
        fromName: 'TheTCGBinder'
      };
    } catch (error) {
      console.error('Failed to load email settings:', error);
      this.settings = {
        enabled: true,
        provider: 'gmail-dev', // Use Gmail dev by default
        fromEmail: 'noreply@thetcgbinder.com',
        fromName: 'TheTCGBinder'
      };
    }
  }

  private loadTemplates() {
    try {
      const saved = localStorage.getItem('emailTemplates');
      this.templates = saved ? JSON.parse(saved) : defaultEmailTemplates;
    } catch (error) {
      console.error('Failed to load email templates:', error);
      this.templates = defaultEmailTemplates;
    }
  }

  public saveSettings(settings: EmailSettings) {
    this.settings = settings;
    localStorage.setItem('emailSettings', JSON.stringify(settings));
  }

  public getSettings(): EmailSettings {
    return this.settings;
  }

  public saveTemplates(templates: EmailTemplate[]) {
    this.templates = templates;
    localStorage.setItem('emailTemplates', JSON.stringify(templates));
  }

  public getTemplates(): EmailTemplate[] {
    return this.templates;
  }

  public getAllTemplates(): Record<string, { subject: string; body: string }> {
    const result: Record<string, { subject: string; body: string }> = {};
    this.templates.forEach(template => {
      result[template.id] = {
        subject: template.subject,
        body: template.htmlContent
      };
    });
    return result;
  }

  public async updateTemplate(templateId: string, updates: { subject: string; body: string }): Promise<void> {
    const templateIndex = this.templates.findIndex(t => t.id === templateId);
    if (templateIndex === -1) {
      throw new Error(`Template ${templateId} not found`);
    }

    this.templates[templateIndex] = {
      ...this.templates[templateIndex],
      subject: updates.subject,
      htmlContent: updates.body,
      textContent: updates.body.replace(/<[^>]*>/g, '') // Simple HTML to text conversion
    };

    this.saveTemplates(this.templates);
  }

  public async resetTemplate(templateId: string): Promise<void> {
    const defaultTemplate = defaultEmailTemplates.find(t => t.id === templateId);
    if (!defaultTemplate) {
      throw new Error(`Default template ${templateId} not found`);
    }

    const templateIndex = this.templates.findIndex(t => t.id === templateId);
    if (templateIndex === -1) {
      throw new Error(`Template ${templateId} not found`);
    }

    this.templates[templateIndex] = { ...defaultTemplate };
    this.saveTemplates(this.templates);
  }

  public getTemplate(id: string): EmailTemplate | undefined {
    return this.templates.find(template => template.id === id);
  }

  private replaceVariables(content: string, variables: Record<string, string>): string {
    let result = content;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{${key}}`, 'g');
      result = result.replace(regex, value);
    }
    return result;
  }

  private formatItemsList(items: Order['items'], isHtml: boolean = false): string {
    if (isHtml) {
      return items.map(item => `
        <div class="item">
          <div class="item-info">
            <div class="item-title">${item.title}</div>
            <div class="item-details">Quantity: ${item.quantity} × $${item.price.toFixed(2)} each</div>
          </div>
          <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
      `).join('');
    } else {
      return items.map(item => 
        `${item.title} - Qty: ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
      ).join('\n');
    }
  }

  public async sendOrderConfirmation(order: Order): Promise<boolean> {
    console.log('sendOrderConfirmation called:', { orderId: order.id, emailEnabled: this.settings.enabled });
    
    if (!this.settings.enabled) {
      console.log('Email service is disabled');
      return false;
    }

    const template = this.getTemplate('order_confirmation');
    if (!template) {
      console.error('Order confirmation template not found');
      console.log('Available templates:', this.templates.map(t => t.id));
      return false;
    }

    console.log('Found confirmation template, sending email to:', order.customerEmail);

    const variables = {
      customerName: order.customerName,
      orderId: order.id,
      orderDate: new Date(order.createdAt).toLocaleDateString(),
      total: order.total.toFixed(2),
      paymentMethod: order.paymentMethod.replace('_', ' ').toUpperCase(),
      itemsList: this.formatItemsList(order.items, true),
      shippingAddress: order.shippingAddress.street,
      shippingCity: order.shippingAddress.city,
      shippingState: order.shippingAddress.state,
      shippingZip: order.shippingAddress.zip,
      shippingCountry: order.shippingAddress.country
    };

    return this.sendEmail(
      order.customerEmail,
      this.replaceVariables(template.subject, variables),
      this.replaceVariables(template.htmlContent, variables),
      this.replaceVariables(template.textContent, variables)
    );
  }

  public async sendStatusUpdate(order: Order, newStatus: Order['status']): Promise<boolean> {
    console.log('sendStatusUpdate called:', { orderId: order.id, newStatus, emailEnabled: this.settings.enabled });
    
    if (!this.settings.enabled) {
      console.log('Email service is disabled');
      return false;
    }

    // Only send emails for certain status changes
    if (!['processing', 'shipped', 'delivered', 'cancelled'].includes(newStatus)) {
      console.log('Status change does not require email notification:', newStatus);
      return false;
    }

    const templateId = `order_${newStatus}`;
    const template = this.getTemplate(templateId);
    if (!template) {
      console.warn(`Template for status ${newStatus} not found (looking for: ${templateId})`);
      console.log('Available templates:', this.templates.map(t => t.id));
      return false;
    }

    console.log('Found template:', templateId, 'sending email to:', order.customerEmail);

    const variables = {
      customerName: order.customerName,
      orderId: order.id,
      total: order.total.toFixed(2)
    };

    return this.sendEmail(
      order.customerEmail,
      this.replaceVariables(template.subject, variables),
      this.replaceVariables(template.htmlContent, variables),
      this.replaceVariables(template.textContent, variables)
    );
  }

  private async sendEmail(
    to: string, 
    subject: string, 
    htmlContent: string, 
    textContent: string
  ): Promise<boolean> {
    try {
      console.log('Sending email:', { to, subject, provider: this.settings.provider });

      // Use Gmail for development and production Gmail
      if (this.settings.provider === 'gmail-dev' || this.settings.provider === 'gmail-prod') {
        return this.sendViaGmail(to, subject, htmlContent, textContent);
      }

      // Use SMTP server
      if (this.settings.provider === 'smtp') {
        return this.sendViaSMTP(to, subject, htmlContent, textContent);
      }

      // Fallback to simulation in development
      console.log('Using email simulation for development');
      return this.simulateEmailSending(to, subject, htmlContent, textContent);

    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  private async sendViaGmail(
    to: string, 
    subject: string, 
    htmlContent: string, 
    textContent: string
  ): Promise<boolean> {
    // Get Gmail configuration from localStorage
    const gmailConfig = this.getGmailConfig();
    if (!gmailConfig.user || !gmailConfig.appPassword) {
      throw new Error('Gmail configuration is incomplete. Please set Gmail address and app password in admin settings.');
    }

    // Use the local email server for Gmail
    const apiUrl = getApiUrl();
    
    try {
      const response = await fetch(`${apiUrl}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          htmlContent,
          textContent,
          provider: this.settings.provider, // gmail-dev or gmail-prod
          gmailConfig
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Email sent successfully via Gmail:', result);
      return true;
    } catch (error) {
      // If local server is not available, fall back to simulation in development
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn('Local email server not available, simulating Gmail email sending');
        return this.simulateEmailSending(to, subject, htmlContent, textContent);
      }
      throw error;
    }
  }

  private async sendViaSMTP(
    to: string, 
    subject: string, 
    htmlContent: string, 
    textContent: string
  ): Promise<boolean> {
    // Get SMTP configuration from localStorage
    const smtpConfig = this.getSMTPConfig();
    if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.password) {
      throw new Error('SMTP configuration is incomplete. Please set all SMTP settings in admin panel.');
    }

    // Use the local email server for SMTP
    const apiUrl = getApiUrl();
    
    try {
      const response = await fetch(`${apiUrl}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          htmlContent,
          textContent,
          provider: 'smtp',
          smtpConfig
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Email sent successfully via SMTP:', result);
      return true;
    } catch (error) {
      // If local server is not available, fall back to simulation in development
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn('Local email server not available, simulating SMTP email sending');
        return this.simulateEmailSending(to, subject, htmlContent, textContent);
      }
      throw error;
    }
  }

  private getGmailConfig() {
    const provider = this.settings.provider;
    const configKey = provider === 'gmail-dev' ? 'gmail-dev-config' : 'gmail-prod-config';
    
    try {
      const saved = localStorage.getItem(configKey);
      return saved ? JSON.parse(saved) : {
        user: '',
        appPassword: '',
        testEmail: ''
      };
    } catch (error) {
      console.error(`Failed to load ${configKey}:`, error);
      return {
        user: '',
        appPassword: '',
        testEmail: ''
      };
    }
  }

  private getSMTPConfig() {
    try {
      const saved = localStorage.getItem('smtp-config');
      return saved ? JSON.parse(saved) : {
        host: '',
        port: 587,
        user: '',
        password: '',
        secure: false,
        testEmail: ''
      };
    } catch (error) {
      console.error('Failed to load SMTP config:', error);
      return {
        host: '',
        port: 587,
        user: '',
        password: '',
        secure: false,
        testEmail: ''
      };
    }
  }

  private async simulateEmailSending(
    to: string, 
    subject: string, 
    htmlContent: string, 
    textContent: string
  ): Promise<boolean> {
    console.log('📧 Simulating email send (development mode):', {
      to,
      subject,
      htmlPreview: htmlContent.substring(0, 100) + '...',
      textPreview: textContent.substring(0, 100) + '...'
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  }

}

export const emailService = new EmailService();
