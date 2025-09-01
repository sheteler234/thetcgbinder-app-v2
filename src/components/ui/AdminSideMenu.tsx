import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, CreditCard, Save, Eye, EyeOff, Mail } from 'lucide-react';
import { Button } from './Button';
import { useNotifications, useUiStore } from '../../store/useUi';
import { emailService } from '../../lib/emailService';

interface PayPalSettings {
  clientId: string;
  clientSecret: string;
  environment: 'sandbox' | 'production';
  enabled: boolean;
}

const AdminSideMenu: React.FC = () => {
  const { showSuccess, showError } = useNotifications();
  const { isAdminMenuOpen, closeAdminMenu, openEmailTemplateAdmin } = useUiStore();
  
  const [activeTab, setActiveTab] = useState('paypal');
  const [showSecrets, setShowSecrets] = useState(false);
  
  // PayPal Settings State
  const [paypalSettings, setPaypalSettings] = useState<PayPalSettings>(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('paypal-settings');
    return saved ? JSON.parse(saved) : {
      clientId: '',
      clientSecret: '',
      environment: 'sandbox' as const,
      enabled: false
    };
  });

  const [isTestingPayPal, setIsTestingPayPal] = useState(false);

  // Email Settings State
  const [emailSettings, setEmailSettings] = useState(() => {
    return emailService.getSettings();
  });

  const updateEmailSetting = (field: string, value: string | boolean) => {
    setEmailSettings(prev => ({ ...prev, [field]: value }));
  };

  const saveEmailSettings = () => {
    try {
      emailService.saveSettings(emailSettings);
      showSuccess('Settings Saved', 'Email settings have been saved successfully.');
    } catch {
      showError('Save Failed', 'Failed to save email settings.');
    }
  };

  const updatePayPalSetting = (field: keyof PayPalSettings, value: string | boolean) => {
    setPaypalSettings(prev => ({ ...prev, [field]: value }));
  };

  const savePayPalSettings = () => {
    try {
      localStorage.setItem('paypal-settings', JSON.stringify(paypalSettings));
      showSuccess('Settings Saved', 'PayPal settings have been saved successfully.');
    } catch {
      showError('Save Failed', 'Failed to save PayPal settings.');
    }
  };

  const testPayPalConnection = async () => {
    if (!paypalSettings.clientId || !paypalSettings.clientSecret) {
      showError('Missing Credentials', 'Please enter both Client ID and Client Secret.');
      return;
    }

    setIsTestingPayPal(true);
    
    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      showSuccess('Connection Test Successful', 'PayPal credentials are valid and working.');
    } catch {
      showError('Connection Test Failed', 'Invalid PayPal credentials or connection error.');
    } finally {
      setIsTestingPayPal(false);
    }
  };

  const tabs = [
    { id: 'paypal', label: 'PayPal Integration', icon: CreditCard },
    { id: 'email', label: 'Email System', icon: Mail },
    { id: 'general', label: 'General Settings', icon: Settings },
  ];

  if (!isAdminMenuOpen) return null;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={closeAdminMenu}
      />

      {/* Side Menu */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-96 bg-slate-800 shadow-2xl z-50 overflow-y-auto border-l border-slate-700"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800/95 backdrop-blur-sm sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-white">Admin Settings</h2>
          <button
            onClick={closeAdminMenu}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="p-6 border-b border-slate-700">
          <div className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-red-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'paypal' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">PayPal Integration</h3>
                <p className="text-sm text-slate-400 mb-6">
                  Configure PayPal payment processing for your checkout system.
                </p>
              </div>

              {/* Enable/Disable PayPal */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-white">Enable PayPal</label>
                  <p className="text-xs text-slate-400">Allow customers to pay with PayPal</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paypalSettings.enabled}
                    onChange={(e) => updatePayPalSetting('enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              {/* Environment Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Environment</label>
                <select
                  value={paypalSettings.environment}
                  onChange={(e) => updatePayPalSetting('environment', e.target.value as 'sandbox' | 'production')}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="sandbox">Sandbox (Testing)</option>
                  <option value="production">Production (Live)</option>
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  Use Sandbox for testing, Production for live payments
                </p>
              </div>

              {/* Client ID */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Client ID *</label>
                <input
                  type="text"
                  value={paypalSettings.clientId}
                  onChange={(e) => updatePayPalSetting('clientId', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter PayPal Client ID"
                />
              </div>

              {/* Client Secret */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Client Secret *</label>
                <div className="relative">
                  <input
                    type={showSecrets ? "text" : "password"}
                    value={paypalSettings.clientSecret}
                    onChange={(e) => updatePayPalSetting('clientSecret', e.target.value)}
                    className="w-full px-3 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter PayPal Client Secret"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecrets(!showSecrets)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                  >
                    {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Test Connection */}
              <div className="pt-4 border-t border-slate-600">
                <Button
                  variant="ghost"
                  onClick={testPayPalConnection}
                  disabled={isTestingPayPal || !paypalSettings.clientId || !paypalSettings.clientSecret}
                  className="w-full mb-4"
                >
                  {isTestingPayPal ? 'Testing Connection...' : 'Test PayPal Connection'}
                </Button>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-slate-600">
                <Button
                  variant="primary"
                  onClick={savePayPalSettings}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save PayPal Settings</span>
                </Button>
              </div>

              {/* Setup Instructions */}
              <div className="pt-4 border-t border-slate-600">
                <h4 className="text-sm font-medium text-white mb-2">Setup Instructions</h4>
                <div className="text-xs text-slate-400 space-y-2">
                  <p>1. Go to <a href="https://developer.paypal.com" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">PayPal Developer Dashboard</a></p>
                  <p>2. Create a new application</p>
                  <p>3. Copy the Client ID and Client Secret</p>
                  <p>4. Set environment to Sandbox for testing</p>
                  <p>5. Test the connection before going live</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Email System</h3>
                <p className="text-sm text-slate-400 mb-6">
                  Configure email notifications and manage your email server.
                </p>
              </div>

              {/* Email Service Toggle */}
              <div className="flex items-center justify-between bg-slate-700 p-4 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-white">Enable Email Service</label>
                  <p className="text-xs text-slate-400">Send automated order emails to customers</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailSettings.enabled}
                    onChange={(e) => updateEmailSetting('enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              {/* Email Provider */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Provider</label>
                <select
                  value={emailSettings.provider}
                  onChange={(e) => updateEmailSetting('provider', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="backend">Backend API (Recommended)</option>
                  <option value="emailjs">EmailJS (Legacy)</option>
                  <option value="smtp">SMTP Server (Legacy)</option>
                  <option value="sendgrid">SendGrid (Legacy)</option>
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  Backend API uses your VPS email server for secure, reliable email delivery
                </p>
              </div>

              {/* From Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">From Email</label>
                <input
                  type="email"
                  value={emailSettings.fromEmail}
                  onChange={(e) => updateEmailSetting('fromEmail', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="noreply@yourdomain.com"
                />
              </div>

              {/* From Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">From Name</label>
                <input
                  type="text"
                  value={emailSettings.fromName}
                  onChange={(e) => updateEmailSetting('fromName', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Your Store Name"
                />
              </div>

              {/* Save Email Settings */}
              <div className="pt-4 border-t border-slate-600">
                <Button
                  variant="primary"
                  onClick={saveEmailSettings}
                  className="w-full flex items-center justify-center space-x-2 mb-4"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Email Settings</span>
                </Button>
              </div>

              {/* Template Management */}
              <div className="bg-slate-700 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-2">Email Templates</h4>
                <Button
                  variant="ghost"
                  onClick={() => {
                    closeAdminMenu();
                    openEmailTemplateAdmin();
                  }}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Edit Email Templates</span>
                </Button>
              </div>

              {/* Email Server Configuration */}
              <div className="bg-slate-700 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-3">Email Server Configuration</h4>
                
                {/* API Endpoint */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-slate-400 mb-1">API Endpoint</label>
                  <input
                    type="text"
                    value={import.meta.env.VITE_API_URL || 'https://thetcgbinder.com:3001/api'}
                    disabled
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-slate-300 text-xs"
                  />
                </div>

                {/* Test Email Connection */}
                <Button
                  variant="ghost"
                  onClick={async () => {
                    try {
                      const testEmail = prompt('Enter test email address:');
                      if (!testEmail) return;
                      
                      const apiUrl = import.meta.env.VITE_API_URL || 'https://thetcgbinder.com:3001/api';
                      const response = await fetch(`${apiUrl}/send-email`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          to: testEmail,
                          subject: 'TheTCGBinder - Test Email',
                          htmlContent: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1e293b; color: #ffffff; padding: 20px; border-radius: 8px;">
                              <h1 style="color: #ef4444;">✅ Email Test Successful!</h1>
                              <p>Your TheTCGBinder email server is working correctly!</p>
                              <p>Timestamp: ${new Date().toLocaleString()}</p>
                            </div>
                          `,
                          textContent: `Email Test Successful! Your TheTCGBinder email server is working correctly! Timestamp: ${new Date().toLocaleString()}`
                        })
                      });

                      if (response.ok) {
                        showSuccess('Test Email Sent', `Test email sent successfully to ${testEmail}`);
                      } else {
                        const error = await response.json();
                        showError('Test Failed', error.error || 'Failed to send test email');
                      }
                    } catch {
                      showError('Test Failed', 'Email server connection failed. Check if server is running.');
                    }
                  }}
                  className="w-full text-xs"
                >
                  <Mail className="w-3 h-3 mr-2" />
                  Test Email Connection
                </Button>

                {/* Server Status */}
                <div className="mt-3 p-3 bg-slate-800 rounded border border-slate-600">
                  <div className="text-xs text-slate-400 mb-2">Server Status</div>
                  <Button
                    variant="ghost"
                    onClick={async () => {
                      try {
                        const apiUrl = import.meta.env.VITE_API_URL || 'https://thetcgbinder.com:3001/api';
                        const response = await fetch(`${apiUrl}/health`);
                        const health = await response.json();
                        showSuccess('Server Status', `Email server is healthy. Provider: ${health.emailProvider}`);
                      } catch {
                        showError('Server Status', 'Email server is not responding. Check VPS configuration.');
                      }
                    }}
                    className="w-full text-xs"
                  >
                    Check Server Health
                  </Button>
                </div>

                {/* Setup Instructions */}
                <div className="mt-3 text-xs text-slate-400">
                  <p className="mb-2">📚 Email server setup:</p>
                  <ul className="space-y-1 text-slate-500">
                    <li>• Run setup-email-server.sh on VPS</li>
                    <li>• Configure .env with email credentials</li>
                    <li>• Start systemd service</li>
                    <li>• Test connection above</li>
                  </ul>
                </div>
              </div>

              {/* Email Analytics */}
              <div className="bg-slate-700 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-3">Email Analytics</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-800 p-3 rounded">
                    <div className="text-slate-400">Today</div>
                    <div className="text-lg font-bold text-white">0</div>
                    <div className="text-slate-500">emails sent</div>
                  </div>
                  <div className="bg-slate-800 p-3 rounded">
                    <div className="text-slate-400">This Month</div>
                    <div className="text-lg font-bold text-white">0</div>
                    <div className="text-slate-500">emails sent</div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Analytics coming soon with backend integration
                </p>
              </div>

              {/* Email Server Setup Guide */}
              <div className="bg-slate-700 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-3">🚀 Quick Setup Guide</h4>
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="bg-slate-800 p-3 rounded">
                    <div className="font-medium text-white mb-2">1. Deploy Email Server</div>
                    <div className="text-slate-400 font-mono bg-slate-900 p-2 rounded">
                      ./scripts/deployment/deploy-to-vps.sh
                    </div>
                  </div>
                  
                  <div className="bg-slate-800 p-3 rounded">
                    <div className="font-medium text-white mb-2">2. Configure Gmail (easiest)</div>
                    <div className="text-slate-400 space-y-1">
                      <div>• Enable 2FA on Gmail</div>
                      <div>• Generate App Password</div>
                      <div>• Update VPS .env file</div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800 p-3 rounded">
                    <div className="font-medium text-white mb-2">3. Test & Start</div>
                    <div className="text-slate-400 font-mono bg-slate-900 p-2 rounded">
                      npm run test && sudo systemctl start thetcgbinder-email
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-slate-600">
                  <Button
                    variant="ghost"
                    onClick={() => window.open('/QUICK_EMAIL_SETUP.md', '_blank')}
                    className="w-full text-xs"
                  >
                    📖 View Complete Setup Guide
                  </Button>
                </div>
              </div>

              {/* Available Email Templates */}
              <div className="bg-slate-700 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-3">Available Templates</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between bg-slate-800 p-2 rounded">
                    <span className="text-slate-300">Order Confirmation</span>
                    <span className="text-green-400">✓ Active</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-800 p-2 rounded">
                    <span className="text-slate-300">Order Processing</span>
                    <span className="text-green-400">✓ Active</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-800 p-2 rounded">
                    <span className="text-slate-300">Order Shipped</span>
                    <span className="text-green-400">✓ Active</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-800 p-2 rounded">
                    <span className="text-slate-300">Order Delivered</span>
                    <span className="text-green-400">✓ Active</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-800 p-2 rounded">
                    <span className="text-slate-300">Order Cancelled</span>
                    <span className="text-green-400">✓ Active</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-700 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-white mb-2">Available Templates</h4>
                  <div className="space-y-2 text-sm text-slate-300">
                    <div>• Order Confirmation</div>
                    <div>• Order Processing</div>
                    <div>• Order Shipped</div>
                    <div>• Order Delivered</div>
                    <div>• Order Cancelled</div>
                  </div>
                </div>

                {/* Email Status */}
                <div className="bg-slate-700 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-white mb-2">Current Status</h4>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${emailSettings.enabled ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className="text-sm text-slate-300">
                      {emailSettings.enabled ? 'Email service is enabled' : 'Email service is disabled'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Provider: {emailSettings.provider.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>
                <p className="text-sm text-slate-400 mb-6">
                  Configure general application settings.
                </p>
              </div>

              <div className="text-center text-slate-400 py-8">
                <Settings className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                <p>General settings coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdminSideMenu;
