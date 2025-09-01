import type { Order } from './types';

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
  provider: 'backend' | 'emailjs' | 'smtp' | 'sendgrid';
  emailjsServiceId?: string;
  emailjsTemplateId?: string;
  emailjsPublicKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpSecure?: boolean;
  sendgridApiKey?: string;
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1e293b; color: #ffffff; padding: 20px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://via.placeholder.com/200x80/ef4444/ffffff?text=TheTCGBinder" alt="TheTCGBinder" style="max-width: 200px;">
          <h1 style="color: #ef4444; margin: 20px 0;">Order Confirmation</h1>
        </div>
        
        <div style="background-color: #334155; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #ef4444; margin-top: 0;">Hi {customerName},</h2>
          <p>Thank you for your order! We've received your order and are processing it.</p>
          
          <div style="margin: 20px 0;">
            <strong>Order Details:</strong><br>
            Order ID: <strong>{orderId}</strong><br>
            Order Date: <strong>{orderDate}</strong><br>
            Total Amount: <strong>{total}</strong><br>
            Payment Method: <strong>{paymentMethod}</strong>
          </div>
        </div>
        
        <div style="background-color: #334155; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #ef4444;">Items Ordered:</h3>
          {itemsList}
        </div>
        
        <div style="background-color: #334155; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #ef4444;">Shipping Address:</h3>
          <p>
            {shippingAddress}<br>
            {shippingCity}, {shippingState} {shippingZip}<br>
            {shippingCountry}
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #475569;">
          <p style="color: #94a3b8;">
            Questions? Contact us at <a href="mailto:support@thetcgbinder.com" style="color: #ef4444;">support@thetcgbinder.com</a>
          </p>
        </div>
      </div>
    `,
    textContent: `
Order Confirmation - #{orderId}

Hi {customerName},

Thank you for your order! We've received your order and are processing it.

Order Details:
Order ID: {orderId}
Order Date: {orderDate}
Total Amount: {total}
Payment Method: {paymentMethod}

Items Ordered:
{itemsList}

Shipping Address:
{shippingAddress}
{shippingCity}, {shippingState} {shippingZip}
{shippingCountry}

Questions? Contact us at support@thetcgbinder.com
    `,
    variables: ['customerName', 'orderId', 'orderDate', 'total', 'paymentMethod', 'itemsList', 'shippingAddress', 'shippingCity', 'shippingState', 'shippingZip', 'shippingCountry']
  },
  {
    id: 'order_processing',
    name: 'Order Processing',
    subject: 'Your order #{orderId} is being processed',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1e293b; color: #ffffff; padding: 20px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://via.placeholder.com/200x80/ef4444/ffffff?text=TheTCGBinder" alt="TheTCGBinder" style="max-width: 200px;">
          <h1 style="color: #3b82f6; margin: 20px 0;">Order Processing</h1>
        </div>
        
        <div style="background-color: #334155; padding: 20px; border-radius: 8px;">
          <h2 style="color: #3b82f6; margin-top: 0;">Hi {customerName},</h2>
          <p>Great news! Your order <strong>#{orderId}</strong> is now being processed.</p>
          <p>We're carefully preparing your items for shipment. You'll receive another email when your order ships.</p>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #1e293b; border-radius: 6px;">
            <strong>Order Total: {total}</strong>
          </div>
        </div>
      </div>
    `,
    textContent: `
Your order #{orderId} is being processed

Hi {customerName},

Great news! Your order #{orderId} is now being processed.

We're carefully preparing your items for shipment. You'll receive another email when your order ships.

Order Total: {total}
    `,
    variables: ['customerName', 'orderId', 'total']
  },
  {
    id: 'order_shipped',
    name: 'Order Shipped',
    subject: 'Your order #{orderId} has shipped!',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1e293b; color: #ffffff; padding: 20px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://via.placeholder.com/200x80/ef4444/ffffff?text=TheTCGBinder" alt="TheTCGBinder" style="max-width: 200px;">
          <h1 style="color: #8b5cf6; margin: 20px 0;">Order Shipped!</h1>
        </div>
        
        <div style="background-color: #334155; padding: 20px; border-radius: 8px;">
          <h2 style="color: #8b5cf6; margin-top: 0;">Hi {customerName},</h2>
          <p>Your order <strong>#{orderId}</strong> has been shipped and is on its way to you!</p>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #1e293b; border-radius: 6px;">
            <strong>Tracking Information:</strong><br>
            Carrier: Standard Shipping<br>
            Estimated Delivery: 3-5 business days
          </div>
          
          <p>You'll receive another email when your order is delivered.</p>
        </div>
      </div>
    `,
    textContent: `
Your order #{orderId} has shipped!

Hi {customerName},

Your order #{orderId} has been shipped and is on its way to you!

Tracking Information:
Carrier: Standard Shipping
Estimated Delivery: 3-5 business days

You'll receive another email when your order is delivered.
    `,
    variables: ['customerName', 'orderId']
  },
  {
    id: 'order_delivered',
    name: 'Order Delivered',
    subject: 'Your order #{orderId} has been delivered',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1e293b; color: #ffffff; padding: 20px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://via.placeholder.com/200x80/ef4444/ffffff?text=TheTCGBinder" alt="TheTCGBinder" style="max-width: 200px;">
          <h1 style="color: #10b981; margin: 20px 0;">Order Delivered!</h1>
        </div>
        
        <div style="background-color: #334155; padding: 20px; border-radius: 8px;">
          <h2 style="color: #10b981; margin-top: 0;">Hi {customerName},</h2>
          <p>Great news! Your order <strong>#{orderId}</strong> has been delivered.</p>
          <p>We hope you're happy with your purchase. If you have any issues, please don't hesitate to contact us.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Leave a Review
            </a>
          </div>
        </div>
      </div>
    `,
    textContent: `
Your order #{orderId} has been delivered

Hi {customerName},

Great news! Your order #{orderId} has been delivered.

We hope you're happy with your purchase. If you have any issues, please don't hesitate to contact us.

Leave a review at: [website]
    `,
    variables: ['customerName', 'orderId']
  },
  {
    id: 'order_cancelled',
    name: 'Order Cancelled',
    subject: 'Your order #{orderId} has been cancelled',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1e293b; color: #ffffff; padding: 20px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://via.placeholder.com/200x80/ef4444/ffffff?text=TheTCGBinder" alt="TheTCGBinder" style="max-width: 200px;">
          <h1 style="color: #ef4444; margin: 20px 0;">Order Cancelled</h1>
        </div>
        
        <div style="background-color: #334155; padding: 20px; border-radius: 8px;">
          <h2 style="color: #ef4444; margin-top: 0;">Hi {customerName},</h2>
          <p>Your order <strong>#{orderId}</strong> has been cancelled.</p>
          <p>If you didn't request this cancellation, please contact us immediately.</p>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #1e293b; border-radius: 6px;">
            <strong>Refund Information:</strong><br>
            If payment was processed, a refund will be issued within 3-5 business days.
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Browse Products
            </a>
          </div>
        </div>
      </div>
    `,
    textContent: `
Your order #{orderId} has been cancelled

Hi {customerName},

Your order #{orderId} has been cancelled.

If you didn't request this cancellation, please contact us immediately.

Refund Information:
If payment was processed, a refund will be issued within 3-5 business days.

Browse our products at: [website]
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
        provider: 'backend', // Use backend API by default
        fromEmail: 'noreply@thetcgbinder.com',
        fromName: 'TheTCGBinder'
      };
    } catch (error) {
      console.error('Failed to load email settings:', error);
      this.settings = {
        enabled: true,
        provider: 'backend', // Use backend API by default
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
        <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #475569;">
          <div>
            <strong>${item.title}</strong><br>
            <span style="color: #94a3b8;">Quantity: ${item.quantity}</span>
          </div>
          <div style="text-align: right;">
            <strong>$${(item.price * item.quantity).toFixed(2)}</strong><br>
            <span style="color: #94a3b8;">$${item.price.toFixed(2)} each</span>
          </div>
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

      // Use backend email API for production
      if (this.settings.provider === 'backend' || import.meta.env.PROD) {
        return this.sendViaBackendAPI(to, subject, htmlContent, textContent);
      }

      // Fallback to simulation in development
      console.log('Using email simulation for development');
      return this.simulateEmailSending(to, subject, htmlContent, textContent);

    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  private async sendViaBackendAPI(
    to: string, 
    subject: string, 
    htmlContent: string, 
    textContent: string
  ): Promise<boolean> {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://thetcgbinder.com:3001/api';
    
    const response = await fetch(`${apiUrl}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        htmlContent,
        textContent
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Email sent successfully via backend API:', result);
    return true;
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
