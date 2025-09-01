import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, User, MapPin, Check, ArrowLeft } from 'lucide-react';
import { useCartStore } from '../../store/useCart';
import { useNotifications } from '../../store/useUi';
import { Button } from '../../components/ui/Button';
import PayPalPayment from '../../components/ui/PayPalPayment';
import { emailService } from '../../lib/emailService';

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
  
  // Options
  sameAsShipping: boolean;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { getCartItems, getCartTotal, clearCart } = useCartStore();
  const { showSuccess, showError } = useNotifications();
  
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
    sameAsShipping: true,
  });

  const cartItems = getCartItems();
  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  // For testing when cart is empty
  const isTestMode = cartItems.length === 0 && import.meta.env.DEV;
  const testTotal = isTestMode ? 29.99 : total;

  // Redirect if cart is empty (but allow for testing)
  useEffect(() => {
    if (cartItems.length === 0 && !orderComplete) {
      // Only redirect if not in development mode or if explicitly going from cart
      const isDevelopment = import.meta.env.DEV;
      if (!isDevelopment) {
        navigate('/');
      }
    }
  }, [cartItems.length, orderComplete, navigate]);

  const updateFormData = (field: keyof CheckoutFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    // Check customer info
    if (!formData.firstName || !formData.lastName || !formData.email) {
      showError('Missing Information', 'Please fill in all required customer information fields.');
      return false;
    }

    // Check shipping address
    if (!formData.shippingAddress || !formData.shippingCity || !formData.shippingState || !formData.shippingZip) {
      showError('Missing Information', 'Please fill in all required shipping address fields.');
      return false;
    }

    return true;
  };

  const isFormValid = (): boolean => {
    // Silent validation check without showing errors
    return !!(
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      formData.shippingAddress &&
      formData.shippingCity &&
      formData.shippingState &&
      formData.shippingZip
    );
  };

  const processOrder = async (paymentData?: { 
    id: string; 
    status: string; 
    amount: number; 
    payment_method: string; 
    created_time: string; 
  }) => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    
    try {
      const cartItems = getCartItems();
      
      // Create order data
      const orderData = {
        userId: 'current_user', // In a real app, this would come from auth
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        total: testTotal,
        status: 'pending' as const,
        paymentMethod: paymentData?.payment_method || 'unknown',
        paymentId: paymentData?.id || `MANUAL_${Date.now()}`,
        shippingAddress: {
          name: `${formData.firstName} ${formData.lastName}`,
          street: formData.shippingAddress,
          city: formData.shippingCity,
          state: formData.shippingState,
          zip: formData.shippingZip,
          country: formData.shippingCountry
        },
        items: cartItems.map(item => ({
          productId: item.product.id,
          title: item.product.title,
          qty: item.qty,
          priceAtPurchase: item.product.price,
          quantity: item.qty,
          price: item.product.price,
          image: item.product.image
        }))
      };

      // Save order using the global function from OrdersSideMenu
      const globalWindow = window as Window & { 
        addOrder?: (order: typeof orderData) => void 
      };
      if (globalWindow.addOrder) {
        globalWindow.addOrder(orderData);
        
        // Send confirmation email
        try {
          const fullOrderData = {
            ...orderData,
            id: `ORD_${Date.now()}`,
            createdAt: new Date().toISOString()
          };
          const emailSent = await emailService.sendOrderConfirmation(fullOrderData);
          if (emailSent) {
            console.log('Order confirmation email sent successfully');
          }
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
        }
      }
      
      // Clear cart and show success
      clearCart();
      setOrderComplete(true);
      showSuccess('Order Placed!', 'Your order has been successfully placed. You will receive a confirmation email shortly.');
      
      // Redirect to home after showing success
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch {
      showError('Order Failed', 'There was an error processing your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Order Placed Successfully!</h1>
          <p className="text-slate-400 mb-6">Thank you for your purchase. You will receive a confirmation email shortly.</p>
          <p className="text-sm text-slate-500">Redirecting to home page...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-slate-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <h1 className="text-3xl font-bold text-white">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Form Content */}
          <div className="space-y-8">
            {/* Customer Information */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                <User className="w-6 h-6 text-red-400" />
                <h2 className="text-xl font-semibold text-white">Customer Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateFormData('firstName', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                <MapPin className="w-6 h-6 text-red-400" />
                <h2 className="text-xl font-semibold text-white">Shipping Address</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Address *</label>
                  <input
                    type="text"
                    value={formData.shippingAddress}
                    onChange={(e) => updateFormData('shippingAddress', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="123 Main Street"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">City *</label>
                    <input
                      type="text"
                      value={formData.shippingCity}
                      onChange={(e) => updateFormData('shippingCity', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="New York"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">State *</label>
                    <input
                      type="text"
                      value={formData.shippingState}
                      onChange={(e) => updateFormData('shippingState', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="NY"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">ZIP Code *</label>
                    <input
                      type="text"
                      value={formData.shippingZip}
                      onChange={(e) => updateFormData('shippingZip', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="10001"
                    />
                  </div>
                </div>

                {/* Billing Address Option */}
                <div className="pt-6 border-t border-slate-600">
                  <label className="flex items-center space-x-3">
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
                      className="w-5 h-5 text-red-600 bg-slate-700 border-slate-600 rounded focus:ring-red-500 focus:ring-2"
                    />
                    <span className="text-slate-300">Billing address is the same as shipping address</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                <CreditCard className="w-6 h-6 text-red-400" />
                <h2 className="text-xl font-semibold text-white">Payment</h2>
              </div>
              
              <PayPalPayment
                amount={testTotal}
                onPaymentSuccess={(paymentData) => {
                  processOrder(paymentData);
                }}
                onPaymentError={(error) => {
                  showError('Payment Failed', error);
                }}
                disabled={!isFormValid()}
              />
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              disabled={isProcessing}
              className="px-8 py-3"
            >
              Back to Cart
            </Button>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6 sticky top-6">
            <h3 className="text-xl font-semibold text-white mb-6">Order Summary</h3>
            
            {/* Test Mode Indicator */}
            {isTestMode && (
              <div className="mb-6 p-4 bg-amber-600/20 border border-amber-500/30 rounded-lg">
                <p className="text-sm text-amber-300 font-medium">
                  🧪 Test Mode - Add items to cart for real checkout
                </p>
              </div>
            )}
            
            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {isTestMode ? (
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-20 bg-slate-600 rounded flex-shrink-0 overflow-hidden flex items-center justify-center">
                    <span className="text-slate-400 text-xs">Test</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">
                      Sample Product (Test)
                    </h4>
                    <p className="text-xs text-slate-400">
                      Qty: 1 × $29.99
                    </p>
                  </div>
                  <div className="text-sm font-medium text-white">
                    $29.99
                  </div>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.productId} className="flex items-center space-x-3">
                    <div className="w-16 h-20 bg-slate-600 rounded flex-shrink-0 overflow-hidden">
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
                ))
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 border-t border-slate-600 pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal:</span>
                <span className="text-white">${isTestMode ? '29.99' : subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Shipping:</span>
                <span className="text-white">
                  {(isTestMode ? 29.99 : subtotal) > 50 ? 'Free' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Tax:</span>
                <span className="text-white">${isTestMode ? '0.00' : tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-slate-600 pt-3">
                <span className="text-white">Total:</span>
                <span className="text-red-400">${testTotal.toFixed(2)}</span>
              </div>
            </div>

            {!isTestMode && subtotal < 50 && (
              <div className="mt-6 p-4 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-300">
                  Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
