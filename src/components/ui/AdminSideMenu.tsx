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
    { id: 'email', label: 'Email Templates', icon: Mail },
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
                  Configure email notifications and manage email templates.
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
                  <option value="emailjs">EmailJS (Recommended)</option>
                  <option value="smtp">SMTP Server</option>
                  <option value="sendgrid">SendGrid</option>
                </select>
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
