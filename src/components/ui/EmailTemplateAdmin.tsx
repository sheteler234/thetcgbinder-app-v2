import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Mail, Eye, Edit3, RotateCcw } from 'lucide-react';
import { Button } from './Button';
import { useUiStore } from '../../store/useUi';
import { useNotifications } from '../../store/useUi';
import { emailService, type EmailSettings } from '../../lib/emailService';

interface EmailTemplate {
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

const EmailTemplateAdmin: React.FC = () => {
  const { isEmailTemplateAdminOpen, closeEmailTemplateAdmin } = useUiStore();
  const { showSuccess, showError } = useNotifications();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [editingSubject, setEditingSubject] = useState<string>('');
  const [editingBody, setEditingBody] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [currentEmailSettings, setCurrentEmailSettings] = useState<EmailSettings | null>(null);

  const loadTemplates = useCallback(() => {
    const allTemplates = emailService.getAllTemplates();
    const templateArray: EmailTemplate[] = Object.entries(allTemplates).map(([key, template]) => ({
      name: key,
      subject: template.subject,
      body: template.body,
      variables: extractVariables(template.subject + template.body)
    }));
    setTemplates(templateArray);
  }, []);

  const loadEmailSettings = useCallback(() => {
    try {
      const settings = emailService.getSettings();
      setCurrentEmailSettings(settings);
    } catch (error) {
      console.error('Failed to load email settings:', error);
    }
  }, []);

  // Load templates and email settings on mount
  useEffect(() => {
    if (isEmailTemplateAdminOpen) {
      loadTemplates();
      loadEmailSettings();
    }
  }, [isEmailTemplateAdminOpen, loadTemplates, loadEmailSettings]);

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{([^}]+)\}\}/g);
    if (!matches) return [];
    return [...new Set(matches.map(match => match.slice(2, -2)))];
  };

  const selectTemplate = (templateName: string) => {
    const template = templates.find(t => t.name === templateName);
    if (template) {
      setSelectedTemplate(templateName);
      setEditingSubject(template.subject);
      setEditingBody(template.body);
      setPreviewMode(false);
    }
  };

  const saveTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      await emailService.updateTemplate(selectedTemplate, {
        subject: editingSubject,
        body: editingBody
      });
      
      // Reload templates to reflect changes
      loadTemplates();
      showSuccess('Template Saved', 'Email template saved successfully');
    } catch (error) {
      console.error('Failed to save template:', error);
      showError('Save Failed', 'Failed to save email template');
    }
  };

  const resetTemplate = async () => {
    if (!selectedTemplate) return;
    
    if (window.confirm('Reset this template to default? This will lose all customizations.')) {
      try {
        await emailService.resetTemplate(selectedTemplate);
        
        // Reload templates and update editing state
        loadTemplates();
        const template = templates.find(t => t.name === selectedTemplate);
        if (template) {
          setEditingSubject(template.subject);
          setEditingBody(template.body);
        }
        showSuccess('Template Reset', 'Template reset to default');
      } catch (error) {
        console.error('Failed to reset template:', error);
        showError('Reset Failed', 'Failed to reset template');
      }
    }
  };

  const renderPreview = () => {
    if (!selectedTemplate) return null;

    // Create sample data for preview
    const sampleOrder = {
      id: 'ORD_12345',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      total: 89.97,
      status: 'shipped' as const,
      createdAt: new Date().toISOString(),
      items: [
        { title: 'Charizard V', quantity: 2, price: 29.99 },
        { title: 'Pikachu EX', quantity: 1, price: 29.99 }
      ]
    };

    const processTemplate = (text: string) => {
      return text
        .replace(/\{\{customerName\}\}/g, sampleOrder.customerName)
        .replace(/\{\{orderId\}\}/g, sampleOrder.id)
        .replace(/\{\{status\}\}/g, sampleOrder.status)
        .replace(/\{\{total\}\}/g, `$${sampleOrder.total.toFixed(2)}`)
        .replace(/\{\{date\}\}/g, new Date(sampleOrder.createdAt).toLocaleDateString())
        .replace(/\{\{items\}\}/g, sampleOrder.items.map(item => 
          `• ${item.title} (Qty: ${item.quantity}) - $${item.price}`
        ).join('\n'));
    };

    return (
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-2">Subject Preview</h4>
          <div className="p-3 bg-slate-800 rounded border border-slate-600 text-sm">
            {processTemplate(editingSubject)}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-2">Body Preview</h4>
          <div className="p-3 bg-slate-800 rounded border border-slate-600 text-sm whitespace-pre-line max-h-64 overflow-y-auto">
            {processTemplate(editingBody)}
          </div>
        </div>
      </div>
    );
  };

  if (!isEmailTemplateAdminOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex"
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          className="ml-auto w-full max-w-4xl bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-400" />
              <div>
                <h2 className="text-lg font-semibold text-white">Email Template Admin</h2>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span>Backend API</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Production Ready</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeEmailTemplateAdmin}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Template List */}
            <div className="w-72 border-r border-slate-700 p-4 overflow-y-auto">
              <h3 className="text-sm font-medium text-slate-300 mb-4">Email Templates</h3>
              <div className="space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => selectTemplate(template.name)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedTemplate === template.name
                        ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                        : 'border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="font-medium mb-1">
                      {template.name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {template.variables.length > 0 
                        ? `Variables: ${template.variables.slice(0, 3).join(', ')}${template.variables.length > 3 ? '...' : ''}`
                        : 'No variables'
                      }
                    </div>
                  </button>
                ))}
              </div>

              {/* Email Server Status */}
              <div className="mt-6 pt-4 border-t border-slate-600">
                <h4 className="text-xs font-medium text-slate-400 mb-3">EMAIL SERVER STATUS</h4>
                <div className="bg-slate-800 p-3 rounded border border-slate-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Backend API</span>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="text-xs text-slate-500 mb-2">
                    Endpoint: {import.meta.env.VITE_API_URL || 'https://thetcgbinder.com:3005/api'}
                  </div>
                  
                  {/* Current Provider Info */}
                  {currentEmailSettings && (
                    <div className="mt-3 pt-3 border-t border-slate-600">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400">Provider</span>
                        <span className="text-xs font-medium text-slate-300">
                          {currentEmailSettings.provider.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400">Status</span>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${currentEmailSettings.enabled ? 'bg-green-400' : 'bg-red-400'}`}></div>
                          <span className="text-xs text-slate-300">
                            {currentEmailSettings.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">From</span>
                        <span className="text-xs text-slate-300 truncate ml-2">
                          {currentEmailSettings.fromName} &lt;{currentEmailSettings.fromEmail}&gt;
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  onClick={async () => {
                    try {
                      const apiUrl = import.meta.env.VITE_API_URL || 'https://thetcgbinder.com:3005/api';
                      const response = await fetch(`${apiUrl}/health`);
                      if (response.ok) {
                        const health = await response.json();
                        alert(`✅ Email server is healthy!\nProvider: ${health.emailProvider}\nTimestamp: ${health.timestamp}`);
                      } else {
                        alert('❌ Email server is not responding');
                      }
                    } catch {
                      alert('❌ Cannot connect to email server');
                    }
                  }}
                  className="w-full text-xs mt-2"
                >
                  Test Server Connection
                </Button>
              </div>
            </div>

            {/* Template Editor */}
            <div className="flex-1 p-4 overflow-y-auto">
              {selectedTemplate ? (
                <div className="space-y-6">
                  {/* Template Info */}
                  <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
                    <h3 className="text-lg font-medium text-white mb-2">
                      {selectedTemplate.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </h3>
                    <div className="text-sm text-slate-400">
                      Available variables: {templates.find(t => t.name === selectedTemplate)?.variables.join(', ') || 'None'}
                    </div>
                  </div>

                  {/* Mode Toggle */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant={!previewMode ? "primary" : "ghost"}
                      size="sm"
                      onClick={() => setPreviewMode(false)}
                      className="flex items-center gap-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant={previewMode ? "primary" : "ghost"}
                      size="sm"
                      onClick={() => setPreviewMode(true)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </Button>
                  </div>

                  {previewMode ? (
                    renderPreview()
                  ) : (
                    <div className="space-y-4">
                      {/* Subject Editor */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Subject Line
                        </label>
                        <input
                          type="text"
                          value={editingSubject}
                          onChange={(e) => setEditingSubject(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter email subject..."
                        />
                      </div>

                      {/* Body Editor */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Email Body
                        </label>
                        <textarea
                          value={editingBody}
                          onChange={(e) => setEditingBody(e.target.value)}
                          rows={12}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          placeholder="Enter email body content..."
                        />
                      </div>

                      {/* Variable Help */}
                      <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
                        <h4 className="text-sm font-medium text-slate-300 mb-2">Available Variables</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                          <div>{'{{customerName}}'} - Customer's name</div>
                          <div>{'{{orderId}}'} - Order ID</div>
                          <div>{'{{status}}'} - Order status</div>
                          <div>{'{{total}}'} - Order total</div>
                          <div>{'{{date}}'} - Current date</div>
                          <div>{'{{items}}'} - Order items list</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-700">
                    <Button
                      onClick={saveTemplate}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save Template
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={resetTemplate}
                      className="flex items-center gap-2 text-slate-400 hover:text-white"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset to Default
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <div className="text-center">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a template to edit</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EmailTemplateAdmin;
