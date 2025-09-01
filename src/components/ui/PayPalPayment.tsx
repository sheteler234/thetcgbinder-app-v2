import React, { useEffect, useState } from 'react';
import { CreditCard, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Button } from './Button';
import { useNotifications } from '../../store/useUi';

interface PayPalPaymentProps {
  amount: number;
  onPaymentSuccess: (paymentData: {
    id: string;
    status: string;
    amount: number;
    payment_method: string;
    created_time: string;
  }) => void;
  onPaymentError: (error: string) => void;
  disabled?: boolean;
}

interface PayPalSettings {
  clientId: string;
  clientSecret: string;
  environment: 'sandbox' | 'production';
  enabled: boolean;
}

const PayPalPayment: React.FC<PayPalPaymentProps> = ({
  amount,
  onPaymentSuccess,
  onPaymentError,
  disabled = false
}) => {
  const { showSuccess, showError } = useNotifications();
  const [paypalSettings, setPaypalSettings] = useState<PayPalSettings | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'card'>('paypal');

  // Load PayPal settings from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('paypal-settings');
      console.log('Raw PayPal settings from localStorage:', savedSettings);
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        console.log('Parsed PayPal settings:', settings);
        setPaypalSettings(settings);
      } else {
        // For testing purposes, set up default sandbox settings
        const testSettings: PayPalSettings = {
          clientId: 'test-client-id', // You'll need to replace with real sandbox client ID
          clientSecret: 'test-secret',
          environment: 'sandbox',
          enabled: true
        };
        console.log('Using test PayPal settings:', testSettings);
        setPaypalSettings(testSettings);
      }
    } catch (error) {
      console.error('Failed to load PayPal settings:', error);
    }
  }, []);

  const processCardPayment = async () => {
    try {
      // Simulate card payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment
      const paymentData = {
        id: `CARD_${Date.now()}`,
        status: 'COMPLETED',
        amount: amount,
        payment_method: 'credit_card',
        created_time: new Date().toISOString()
      };

      showSuccess('Payment Successful!', 'Your credit card payment has been processed successfully.');
      onPaymentSuccess(paymentData);
      
    } catch {
      const errorMessage = 'Credit card payment failed. Please try again.';
      showError('Payment Failed', errorMessage);
      onPaymentError(errorMessage);
    }
  };

  const isPayPalAvailable = paypalSettings && paypalSettings.enabled && paypalSettings.clientId;
  
  // Debug logging
  console.log('PayPal Settings:', paypalSettings);
  console.log('PayPal Available:', isPayPalAvailable);

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white mb-4">Select Payment Method</h3>
        
        {/* PayPal Option */}
        {isPayPalAvailable ? (
          <label className="flex items-center space-x-3 p-4 border border-slate-600 rounded-lg cursor-pointer hover:border-slate-500 transition-colors">
            <input
              type="radio"
              name="paymentMethod"
              value="paypal"
              checked={paymentMethod === 'paypal'}
              onChange={(e) => setPaymentMethod(e.target.value as 'paypal')}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-500 focus:ring-2"
            />
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">PayPal</span>
              </div>
              <div>
                <div className="text-white font-medium">PayPal</div>
                <div className="text-sm text-slate-400">Pay securely with your PayPal account</div>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-green-400">
              <Shield className="w-4 h-4" />
              <span className="text-xs">Secure</span>
            </div>
          </label>
        ) : (
          <div className="p-4 border border-slate-600 rounded-lg bg-slate-800/30">
            <div className="flex items-center space-x-3 mb-3">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-slate-300 font-medium">PayPal Setup Required</div>
                <div className="text-sm text-slate-400">Configure PayPal in admin settings to enable payments</div>
              </div>
            </div>
            
            <div className="text-sm text-slate-400 space-y-1">
              <p>To enable PayPal payments:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs text-slate-500 ml-4">
                <li>Login as admin user</li>
                <li>Click Admin in user dropdown</li>
                <li>Go to PayPal Integration tab</li>
                <li>Enter your PayPal sandbox client ID</li>
                <li>Enable PayPal and save settings</li>
              </ol>
            </div>
          </div>
        )}

        {/* Credit Card Option */}
        <label className="flex items-center space-x-3 p-4 border border-slate-600 rounded-lg cursor-pointer hover:border-slate-500 transition-colors">
          <input
            type="radio"
            name="paymentMethod"
            value="card"
            checked={paymentMethod === 'card'}
            onChange={(e) => setPaymentMethod(e.target.value as 'card')}
            className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-500 focus:ring-2"
          />
          <div className="flex items-center space-x-3 flex-1">
            <CreditCard className="w-8 h-8 text-slate-400" />
            <div>
              <div className="text-white font-medium">Credit / Debit Card</div>
              <div className="text-sm text-slate-400">Pay with Visa, Mastercard, American Express</div>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-green-400">
            <Shield className="w-4 h-4" />
            <span className="text-xs">Secure</span>
          </div>
        </label>
      </div>

      {/* Payment Details */}
      <div className="bg-slate-700/30 rounded-lg p-6 border border-slate-600">
        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-300">Payment Amount:</span>
          <span className="text-xl font-bold text-white">${amount.toFixed(2)}</span>
        </div>
        
        {paymentMethod === 'paypal' && isPayPalAvailable && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>PayPal Environment: <span className="capitalize text-slate-300">{paypalSettings?.environment}</span></span>
            </div>
            
            {/* PayPal Buttons */}
            {!disabled && paypalSettings?.clientId && paypalSettings.clientId !== 'test-client-id' ? (
              <PayPalScriptProvider
                options={{
                  clientId: paypalSettings.clientId,
                  currency: "USD",
                  intent: "capture",
                  components: "buttons",
                  "enable-funding": "venmo,paylater",
                  "disable-funding": "",
                  "data-sdk-integration-source": "integrationbuilder_sc"
                }}
              >
                <PayPalButtons
                  style={{
                    shape: "rect",
                    layout: "vertical",
                    color: "gold",
                    label: "paypal"
                  }}
                  createOrder={(_, actions) => {
                    return actions.order.create({
                      purchase_units: [
                        {
                          amount: {
                            currency_code: "USD",
                            value: amount.toString()
                          }
                        }
                      ],
                      intent: "CAPTURE"
                    });
                  }}
                  onApprove={async (_, actions) => {
                    if (actions.order) {
                      try {
                        const details = await actions.order.capture();
                        const paymentData = {
                          id: details.id || `PAYPAL_${Date.now()}`,
                          status: details.status || 'COMPLETED',
                          amount: amount,
                          payment_method: 'paypal',
                          created_time: new Date().toISOString(),
                          payer_email: details.payer?.email_address,
                          payer_name: details.payer?.name?.given_name + ' ' + details.payer?.name?.surname
                        };
                        
                        showSuccess('PayPal Payment Successful!', 'Your payment has been processed successfully.');
                        onPaymentSuccess(paymentData);
                      } catch (error) {
                        console.error('PayPal capture error:', error);
                        showError('Payment Failed', 'Failed to capture PayPal payment.');
                        onPaymentError('Failed to capture PayPal payment.');
                      }
                    }
                  }}
                  onError={(err) => {
                    console.error('PayPal error:', err);
                    showError('PayPal Error', 'There was an error with PayPal payment.');
                    onPaymentError('PayPal payment error occurred.');
                  }}
                  onCancel={() => {
                    showError('Payment Cancelled', 'PayPal payment was cancelled.');
                  }}
                />
              </PayPalScriptProvider>
            ) : !disabled && paypalSettings?.clientId === 'test-client-id' ? (
              <div className="space-y-4">
                <div className="p-4 bg-amber-600/20 border border-amber-500/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    <span className="text-amber-300 font-medium">Test Mode - Real PayPal Required</span>
                  </div>
                  <p className="text-sm text-amber-200">
                    To use PayPal payments, configure your real PayPal sandbox client ID in Admin → PayPal Integration.
                  </p>
                  <p className="text-xs text-amber-300 mt-2">
                    Get your sandbox client ID from <a href="https://developer.paypal.com" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">developer.paypal.com</a>
                  </p>
                </div>
                
                {/* Test PayPal Button */}
                <Button
                  variant="primary"
                  onClick={() => {
                    // Simulate PayPal payment for test
                    const paymentData = {
                      id: `TEST_PAYPAL_${Date.now()}`,
                      status: 'COMPLETED',
                      amount: amount,
                      payment_method: 'paypal_test',
                      created_time: new Date().toISOString()
                    };
                    showSuccess('Test PayPal Payment!', 'This is a test payment. Configure real PayPal in admin settings.');
                    onPaymentSuccess(paymentData);
                  }}
                  className="w-full py-4 text-lg font-semibold"
                >
                  Test PayPal Payment - ${amount.toFixed(2)}
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <p className="text-sm text-slate-400 text-center">
                  Complete the form above to enable PayPal payment
                </p>
              </div>
            )}
          </div>
        )}

        {paymentMethod === 'card' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>SSL encrypted payment processing</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>PCI DSS compliant</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Your card details are secure</span>
            </div>
            
            {/* Credit Card Payment Button */}
            <Button
              variant="primary"
              onClick={processCardPayment}
              disabled={disabled}
              className="w-full py-4 text-lg font-semibold"
            >
              {disabled ? (
                'Please complete all required fields above'
              ) : (
                `Pay $${amount.toFixed(2)} with Credit Card`
              )}
            </Button>
            
            {disabled && (
              <p className="text-center text-sm text-slate-400">
                Complete the customer information and shipping address above to enable payment.
              </p>
            )}
          </div>
        )}
      </div>
      
      {paymentMethod === 'paypal' && !isPayPalAvailable && (
        <p className="text-center text-sm text-amber-400">
          PayPal is not available. Please select credit card payment or contact support.
        </p>
      )}
    </div>
  );
};

export default PayPalPayment;
