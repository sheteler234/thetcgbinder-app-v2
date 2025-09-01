import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, User, MapPin, Check } from 'lucide-react';
import { useCartStore } from '../../store/useCart';
import { useNotifications } from '../../store/useUi';
import { Button } from './Button';

interface CheckoutFormData {
  // Customer Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Shipping Address
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingCountry: string;
  
  // Billing Address
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  billingCountry: string;
  
  // Payment Information
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  
  // Options
  sameAsShipping: boolean;
}

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ isOpen, onClose }) => {
  const { getCartItems, getCartTotal, clearCart } = useCartStore();
  const { showSuccess, showError } = useNotifications();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    shippingCountry: 'US',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    billingCountry: 'US',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    sameAsShipping: true,
  });

  const cartItems = getCartItems();
  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  // Don't show checkout if cart is empty
  if (cartItems.length === 0) {
    return null;
  }

  const updateFormData = (field: keyof CheckoutFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Customer Info
        return !!(formData.firstName && formData.lastName && formData.email);
      case 2: // Shipping
        return !!(formData.shippingAddress && formData.shippingCity && formData.shippingState && formData.shippingZip);
      case 3: // Payment
        return !!(formData.cardNumber.replace(/\s/g, '').length >= 13 && formData.expiryDate && formData.cvv && formData.cardholderName);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    } else {
      showError('Missing Information', 'Please fill in all required fields.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const processOrder = async () => {
    if (!validateStep(3)) {
      showError('Missing Information', 'Please fill in all required fields.');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Clear cart and show success
      clearCart();
      setOrderComplete(true);
      showSuccess('Order Placed!', 'Your order has been successfully placed. You will receive a confirmation email shortly.');
      
      // Reset after showing success
      setTimeout(() => {
        setOrderComplete(false);
        setCurrentStep(1);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          shippingAddress: '',
          shippingCity: '',
          shippingState: '',
          shippingZip: '',
          shippingCountry: 'US',
          billingAddress: '',
          billingCity: '',
          billingState: '',
          billingZip: '',
          billingCountry: 'US',
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          cardholderName: '',
          sameAsShipping: true,
        });
        onClose();
      }, 2000);
      
    } catch {
      showError('Payment Failed', 'There was an error processing your payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Checkout</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {orderComplete ? (
            // Order Complete Screen
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Order Placed Successfully!</h3>
                <p className="text-slate-400">Thank you for your purchase. You will receive a confirmation email shortly.</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex overflow-hidden">
              {/* Main Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Step Indicator */}
                <div className="p-6 border-b border-slate-700">
                  <div className="flex items-center justify-center space-x-8">
                    {[1, 2, 3].map((step) => (
                      <div key={step} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          step <= currentStep 
                            ? 'bg-red-600 text-white' 
                            : 'bg-slate-600 text-slate-400'
                        }`}>
                          {step}
                        </div>
                        <span className={`ml-2 text-sm ${
                          step <= currentStep ? 'text-white' : 'text-slate-400'
                        }`}>
                          {step === 1 ? 'Customer Info' : step === 2 ? 'Shipping' : 'Payment'}
                        </span>
                        {step < 3 && (
                          <div className={`w-16 h-0.5 ml-4 ${
                            step < currentStep ? 'bg-red-600' : 'bg-slate-600'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-6">
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 mb-4">
                        <User className="w-5 h-5 text-red-400" />
                        <h3 className="text-lg font-semibold text-white">Customer Information</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">First Name *</label>
                          <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => updateFormData('firstName', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="John"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Last Name *</label>
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => updateFormData('lastName', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="Doe"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Email *</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => updateFormData('email', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="john@example.com"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Phone</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => updateFormData('phone', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="(555) 123-4567"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 mb-4">
                        <MapPin className="w-5 h-5 text-red-400" />
                        <h3 className="text-lg font-semibold text-white">Shipping Address</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Address *</label>
                          <input
                            type="text"
                            value={formData.shippingAddress}
                            onChange={(e) => updateFormData('shippingAddress', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="123 Main Street"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">City *</label>
                            <input
                              type="text"
                              value={formData.shippingCity}
                              onChange={(e) => updateFormData('shippingCity', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="New York"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">State *</label>
                            <input
                              type="text"
                              value={formData.shippingState}
                              onChange={(e) => updateFormData('shippingState', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="NY"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">ZIP Code *</label>
                            <input
                              type="text"
                              value={formData.shippingZip}
                              onChange={(e) => updateFormData('shippingZip', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="10001"
                            />
                          </div>
                        </div>

                        {/* Billing Address Option */}
                        <div className="mt-6 pt-4 border-t border-slate-600">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.sameAsShipping}
                              onChange={(e) => {
                                updateFormData('sameAsShipping', e.target.checked);
                                if (e.target.checked) {
                                  updateFormData('billingAddress', formData.shippingAddress);
                                  updateFormData('billingCity', formData.shippingCity);
                                  updateFormData('billingState', formData.shippingState);
                                  updateFormData('billingZip', formData.shippingZip);
                                  updateFormData('billingCountry', formData.shippingCountry);
                                }
                              }}
                              className="w-4 h-4 text-red-600 bg-slate-700 border-slate-600 rounded focus:ring-red-500 focus:ring-2"
                            />
                            <span className="text-sm text-slate-300">Billing address is the same as shipping address</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 mb-4">
                        <CreditCard className="w-5 h-5 text-red-400" />
                        <h3 className="text-lg font-semibold text-white">Payment Information</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Cardholder Name *</label>
                          <input
                            type="text"
                            value={formData.cardholderName}
                            onChange={(e) => updateFormData('cardholderName', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="John Doe"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Card Number *</label>
                          <input
                            type="text"
                            value={formData.cardNumber}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, '');
                              // Format as XXXX XXXX XXXX XXXX
                              value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                              updateFormData('cardNumber', value.slice(0, 19)); // Max 16 digits + 3 spaces
                            }}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Expiry Date *</label>
                            <input
                              type="text"
                              value={formData.expiryDate}
                              onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, '');
                                if (value.length >= 2) {
                                  value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                }
                                updateFormData('expiryDate', value);
                              }}
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="MM/YY"
                              maxLength={5}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">CVV *</label>
                            <input
                              type="text"
                              value={formData.cvv}
                              onChange={(e) => updateFormData('cvv', e.target.value.replace(/\D/g, '').slice(0, 3))}
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="123"
                              maxLength={3}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="p-6 border-t border-slate-700 flex justify-between">
                  <Button
                    variant="ghost"
                    onClick={currentStep === 1 ? onClose : prevStep}
                    disabled={isProcessing}
                  >
                    {currentStep === 1 ? 'Cancel' : 'Back'}
                  </Button>
                  
                  {currentStep < 3 ? (
                    <Button variant="primary" onClick={nextStep}>
                      Next
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={processOrder}
                      disabled={isProcessing}
                      className="min-w-[120px]"
                    >
                      {isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                    </Button>
                  )}
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <div className="w-80 bg-slate-700/50 border-l border-slate-700 p-6 overflow-y-auto">
                <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
                
                {/* Cart Items */}
                <div className="space-y-3 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="flex items-center space-x-3">
                      <div className="w-12 h-16 bg-slate-600 rounded flex-shrink-0 overflow-hidden">
                        <img
                          src={item.product.image}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">
                          {item.product.title}
                        </h4>
                        <p className="text-xs text-slate-400">
                          Qty: {item.qty} × ${item.product.price}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-white">
                        ${(item.product.price * item.qty).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 border-t border-slate-600 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Subtotal:</span>
                    <span className="text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Shipping:</span>
                    <span className="text-white">
                      {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Tax:</span>
                    <span className="text-white">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-slate-600 pt-2">
                    <span className="text-white">Total:</span>
                    <span className="text-red-400">${total.toFixed(2)}</span>
                  </div>
                </div>

                {subtotal < 50 && (
                  <div className="mt-4 p-3 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                    <p className="text-xs text-blue-300">
                      Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Checkout;
