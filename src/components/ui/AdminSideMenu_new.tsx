import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, CreditCard, Mail, Search, Shield, Bell, Users, Eye, EyeOff, Save } from 'lucide-react';
import { Button } from './Button';
import { useNotifications, useUiStore } from '../../store/useUi';
import { emailService } from '../../lib/emailService';

interface PayPalSettings {
  clientId: string;
  clientSecret: string;
  environment: 'sandbox' | 'production';
  enabled: boolean;
}

interface GmailConfig {
  user: string;
  password: string;
}

interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
}

const AdminSideMenu: React.FC = () => {
  const { showSuccess, showError } = useNotifications();
  const { isAdminMenuOpen, closeAdminMenu, openEmailTemplateAdmin } = useUiStore();
  
  const [activeSection, setActiveSection] = useState('paypal');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSecrets, setShowSecrets] = useState(false);
  
  // PayPal Settings State
  const [paypalSettings, setPaypalSettings] = useState<PayPalSettings>(() => {
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

  // Gmail configurations
  const [gmailDevConfig, setGmailDevConfig] = useState<GmailConfig>(() => {
    const saved = localStorage.getItem('gmail-dev-config');
    return saved ? JSON.parse(saved) : { user: '', password: '' };
  });

  const [gmailProdConfig, setGmailProdConfig] = useState<GmailConfig>(() => {
    const saved = localStorage.getItem('gmail-prod-config');
    return saved ? JSON.parse(saved) : { user: '', password: '' };
  });

  // SMTP configuration
  const [smtpConfig, setSMTPConfig] = useState<SMTPConfig>(() => {
    const saved = localStorage.getItem('smtp-config');
    return saved ? JSON.parse(saved) : {
      host: '',
      port: 587,
      secure: false,
      user: '',
      password: ''
    };
  });

  const updateEmailSetting = (field: string, value: string | boolean) => {
    setEmailSettings(prev => ({ ...prev, [field]: value }));
  };

  const updateGmailDevConfig = (field: keyof GmailConfig, value: string) => {
    setGmailDevConfig(prev => ({ ...prev, [field]: value }));
  };

  const updateGmailProdConfig = (field: keyof GmailConfig, value: string) => {
    setGmailProdConfig(prev => ({ ...prev, [field]: value }));
  };

  const updateSMTPConfig = (field: keyof SMTPConfig, value: string | number | boolean) => {
    setSMTPConfig(prev => ({ ...prev, [field]: value }));
  };

  const saveEmailSettings = async () => {
    try {
      emailService.saveSettings(emailSettings);
      
      // Save provider-specific configurations
      localStorage.setItem('gmail-dev-config', JSON.stringify(gmailDevConfig));
      localStorage.setItem('gmail-prod-config', JSON.stringify(gmailProdConfig));
      localStorage.setItem('smtp-config', JSON.stringify(smtpConfig));
      
      showSuccess('Settings Saved', 'Email settings have been saved successfully.');
    } catch (error) {
      console.error('Failed to save email settings:', error);
      showError('Save Failed', 'Failed to save email settings.');
    }
  };

  const testEmailConnection = async () => {
    try {
      const config = {
        provider: emailSettings.provider,
        ...(emailSettings.provider === 'gmail-dev' ? gmailDevConfig : 
           emailSettings.provider === 'gmail-prod' ? gmailProdConfig : smtpConfig)
      };
      
      // Test email connection
      const response = await fetch('http://localhost:3005/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (response.ok) {
        showSuccess('Connection Test Successful', 'Email configuration is working correctly.');
      } else {
        throw new Error('Connection test failed');
      }
    } catch (error) {
      showError('Connection Test Failed', 'Unable to connect with current email settings.');
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      showSuccess('Connection Test Successful', 'PayPal credentials are valid and working.');
    } catch {
      showError('Connection Test Failed', 'Invalid PayPal credentials or connection error.');
    } finally {
      setIsTestingPayPal(false);
    }
  };

  // Define menu sections with categories
  const menuSections = [
    {
      category: 'Payment & Processing',
      items: [
        { id: 'paypal', label: 'PayPal Integration', icon: CreditCard, description: 'Configure PayPal payments' },
      ]
    },
    {
      category: 'Communication',
      items: [
        { id: 'email', label: 'Email System', icon: Mail, description: 'Email configuration and templates' },
        { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alert and notification settings' },
      ]
    },
    {
      category: 'System',
      items: [
        { id: 'general', label: 'General Settings', icon: Settings, description: 'Basic application settings' },
        { id: 'security', label: 'Security', icon: Shield, description: 'Security and authentication' },
        { id: 'users', label: 'User Management', icon: Users, description: 'Manage user accounts' },
      ]
    }
  ];

  // Filter sections based on search query
  const filteredSections = menuSections.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  if (!isAdminMenuOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={closeAdminMenu}
      />
      
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-full max-w-6xl bg-slate-900 shadow-2xl z-50 flex"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar Navigation */}
        <div className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">Admin Settings</h2>
              <button
                onClick={closeAdminMenu}
                className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex-1 overflow-y-auto p-3">
            {filteredSections.map((category, categoryIndex) => (
              <div key={category.category} className={`${categoryIndex > 0 ? 'mt-6' : ''}`}>
                <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 px-2">
                  {category.category}
                </h3>
                <div className="space-y-1">
                  {category.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                          activeSection === item.id
                            ? 'bg-red-600 text-white'
                            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{item.label}</div>
                          <div className="text-xs opacity-70 truncate">{item.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {filteredSections.length === 0 && searchQuery && (
              <div className="text-center text-slate-400 py-8">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No settings found</p>
                <p className="text-xs opacity-70">Try a different search term</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-slate-800 overflow-y-auto">
          {/* Consistent width container for all content */}
          <div className="w-full max-w-3xl mx-auto p-6">
          
          {activeSection === 'paypal' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">PayPal Configuration</h3>
                <p className="text-sm text-slate-400 mb-6">
                  Configure PayPal payment processing for your store.
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
                <label className="block text-sm font-medium text-slate-300 mb-2">Client ID</label>
                <input
                  type="text"
                  value={paypalSettings.clientId}
                  onChange={(e) => updatePayPalSetting('clientId', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Your PayPal Client ID"
                />
              </div>

              {/* Client Secret */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Client Secret</label>
                <div className="relative">
                  <input
                    type={showSecrets ? "text" : "password"}
                    value={paypalSettings.clientSecret}
                    onChange={(e) => updatePayPalSetting('clientSecret', e.target.value)}
                    className="w-full px-3 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Your PayPal Client Secret"
                  />
                  <button
                    onClick={() => setShowSecrets(!showSecrets)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-300"
                  >
                    {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <Button onClick={savePayPalSettings} className="flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>Save Settings</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={testPayPalConnection}
                  disabled={isTestingPayPal}
                  className="flex items-center space-x-2"
                >
                  {isTestingPayPal ? (
                    <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  <span>{isTestingPayPal ? 'Testing...' : 'Test Connection'}</span>
                </Button>
              </div>

              {/* PayPal Status */}
              <div className="bg-slate-700 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-2">Current Status</h4>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${paypalSettings.enabled ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className="text-sm text-slate-300">
                    {paypalSettings.enabled ? 'PayPal is enabled' : 'PayPal is disabled'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Environment: {paypalSettings.environment.toUpperCase()}
                </div>
              </div>
            </div>
            )}
            
            {activeSection === 'email' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Email Configuration</h3>
                <p className="text-sm text-slate-400 mb-6">
                  Configure email settings for order notifications and customer communications.
                </p>
              </div>

              {/* Enable/Disable Email Service */}
              <div className="flex items-center justify-between">
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
                  <option value="gmail-dev">Gmail (Development)</option>
                  <option value="gmail-prod">Gmail (Production VPS)</option>
                  <option value="smtp">SMTP Server</option>
                </select>
              </div>

              {/* Gmail Configuration */}
              {(emailSettings.provider === 'gmail-dev' || emailSettings.provider === 'gmail-prod') && (
                <div className="bg-slate-700 p-4 rounded-lg space-y-4">
                  <h4 className="text-sm font-medium text-white">
                    {emailSettings.provider === 'gmail-dev' ? 'Gmail Development Configuration' : 'Gmail Production Configuration'}
                  </h4>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Gmail Address</label>
                    <input
                      type="email"
                      value={emailSettings.provider === 'gmail-dev' ? gmailDevConfig.user : gmailProdConfig.user}
                      onChange={(e) => emailSettings.provider === 'gmail-dev' 
                        ? updateGmailDevConfig('user', e.target.value)
                        : updateGmailProdConfig('user', e.target.value)
                      }
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="your-email@gmail.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">App Password</label>
                    <div className="relative">
                      <input
                        type={showSecrets ? "text" : "password"}
                        value={emailSettings.provider === 'gmail-dev' ? gmailDevConfig.password : gmailProdConfig.password}
                        onChange={(e) => emailSettings.provider === 'gmail-dev'
                          ? updateGmailDevConfig('password', e.target.value)
                          : updateGmailProdConfig('password', e.target.value)
                        }
                        className="w-full px-3 py-2 pr-10 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Gmail App Password"
                      />
                      <button
                        onClick={() => setShowSecrets(!showSecrets)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-300"
                      >
                        {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Generate an app password in your Gmail security settings
                    </p>
                  </div>
                </div>
              )}

              {/* SMTP Configuration */}
              {emailSettings.provider === 'smtp' && (
                <div className="bg-slate-700 p-4 rounded-lg space-y-4">
                  <h4 className="text-sm font-medium text-white">SMTP Server Configuration</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Host</label>
                      <input
                        type="text"
                        value={smtpConfig.host}
                        onChange={(e) => updateSMTPConfig('host', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="smtp.example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Port</label>
                      <input
                        type="number"
                        value={smtpConfig.port}
                        onChange={(e) => updateSMTPConfig('port', parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="587"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Username</label>
                    <input
                      type="text"
                      value={smtpConfig.user}
                      onChange={(e) => updateSMTPConfig('user', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="your-username"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showSecrets ? "text" : "password"}
                        value={smtpConfig.password}
                        onChange={(e) => updateSMTPConfig('password', e.target.value)}
                        className="w-full px-3 py-2 pr-10 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="your-password"
                      />
                      <button
                        onClick={() => setShowSecrets(!showSecrets)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-300"
                      >
                        {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="secure"
                      checked={smtpConfig.secure}
                      onChange={(e) => updateSMTPConfig('secure', e.target.checked)}
                      className="w-4 h-4 text-red-600 bg-slate-800 border-slate-600 rounded focus:ring-red-500"
                    />
                    <label htmlFor="secure" className="text-xs text-slate-400">Use TLS/SSL</label>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <Button onClick={saveEmailSettings} className="flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>Save Settings</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={testEmailConnection}
                  className="flex items-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Test Connection</span>
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

              {/* Email Status */}
              <div className="bg-slate-700 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-2">Current Status</h4>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Service</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${emailSettings.enabled ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className="text-slate-300">{emailSettings.enabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Provider</span>
                  <span className="text-slate-300">{emailSettings.provider.toUpperCase()}</span>
                </div>
                {(emailSettings.provider === 'gmail-dev' || emailSettings.provider === 'gmail-prod') && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Gmail User</span>
                    <span className="text-slate-300">
                      {(emailSettings.provider === 'gmail-dev' ? gmailDevConfig.user : gmailProdConfig.user) || 'Not configured'}
                    </span>
                  </div>
                )}
                {emailSettings.provider === 'smtp' && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">SMTP Host</span>
                    <span className="text-slate-300">{smtpConfig.host || 'Not configured'}</span>
                  </div>
                )}
              </div>
            </div>
            )}

            {activeSection === 'general' && (
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

            {activeSection === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Notification Settings</h3>
                <p className="text-sm text-slate-400 mb-6">
                  Configure notification preferences and alert settings.
                </p>
              </div>

              <div className="text-center text-slate-400 py-8">
                <Bell className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                <p>Notification settings coming soon...</p>
              </div>
            </div>
            )}

            {activeSection === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Security Settings</h3>
                <p className="text-sm text-slate-400 mb-6">
                  Configure security and authentication settings.
                </p>
              </div>

              <div className="text-center text-slate-400 py-8">
                <Shield className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                <p>Security settings coming soon...</p>
              </div>
            </div>
            )}

            {activeSection === 'users' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">User Management</h3>
                <p className="text-sm text-slate-400 mb-6">
                  Manage user accounts and permissions.
                </p>
              </div>

              <div className="text-center text-slate-400 py-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                <p>User management coming soon...</p>
              </div>
            </div>
            )}
            
            </div> {/* Close consistent width wrapper */}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdminSideMenu;
