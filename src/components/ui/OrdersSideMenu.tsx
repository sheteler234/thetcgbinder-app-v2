import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Eye, Search, Download, RefreshCw, Edit, Save, User, MapPin, ShoppingBag, Plus, Trash2 } from 'lucide-react';
import { Button } from './Button';
import { useUiStore } from '../../store/useUi';
import { useNotifications } from '../../store/useUi';
import { emailService } from '../../lib/emailService';
import type { Order } from '../../lib/types';

const OrdersSideMenu: React.FC = () => {
  const { isOrdersMenuOpen, closeOrdersMenu } = useUiStore();
  const { showSuccess, showError } = useNotifications();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  
  // Editing states
  const [editingSection, setEditingSection] = useState<'customer' | 'shipping' | 'items' | null>(null);
  const [editingCustomer, setEditingCustomer] = useState({ name: '', email: '' });
  const [editingShipping, setEditingShipping] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  });
  const [editingItems, setEditingItems] = useState<Order['items']>([]);

  // Load orders from localStorage
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem('orders');
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        setOrders(parsedOrders);
      } else {
        // Add some sample orders for testing
        const sampleOrders: Order[] = [
          {
            id: 'ORD_001',
            userId: 'user_001',
            customerName: 'John Doe',
            customerEmail: 'john@example.com',
            total: 89.97,
            status: 'delivered',
            paymentMethod: 'paypal',
            paymentId: 'PAYPAL_12345',
            createdAt: '2024-12-15T10:30:00Z',
            statusHistory: [
              {
                status: 'pending',
                timestamp: '2024-12-15T10:30:00Z',
                note: 'Order placed'
              },
              {
                status: 'processing',
                timestamp: '2024-12-15T11:00:00Z',
                note: 'Payment confirmed, preparing shipment'
              },
              {
                status: 'shipped',
                timestamp: '2024-12-15T14:30:00Z',
                note: 'Package shipped via UPS'
              },
              {
                status: 'delivered',
                timestamp: '2024-12-16T16:45:00Z',
                note: 'Package delivered successfully'
              }
            ],
            shippingAddress: {
              name: 'John Doe',
              street: '123 Main St',
              city: 'New York',
              state: 'NY',
              zip: '10001',
              country: 'US'
            },
            items: [
              {
                productId: 'PROD_001',
                title: 'Blue-Eyes White Dragon',
                qty: 3,
                priceAtPurchase: 29.99,
                quantity: 3,
                price: 29.99,
                image: '/api/placeholder/200/280'
              }
            ]
          },
          {
            id: 'ORD_002',
            userId: 'user_002',
            customerName: 'Jane Smith',
            customerEmail: 'jane@example.com',
            total: 45.98,
            status: 'processing',
            paymentMethod: 'paypal_test',
            paymentId: 'TEST_PAYPAL_67890',
            createdAt: '2024-12-14T16:45:00Z',
            statusHistory: [
              {
                status: 'pending',
                timestamp: '2024-12-14T16:45:00Z',
                note: 'Test order placed'
              },
              {
                status: 'processing',
                timestamp: '2024-12-14T17:00:00Z',
                note: 'Test payment processed'
              }
            ],
            shippingAddress: {
              name: 'Jane Smith',
              street: '456 Oak Ave',
              city: 'Los Angeles',
              state: 'CA',
              zip: '90210',
              country: 'US'
            },
            items: [
              {
                productId: 'PROD_002',
                title: 'Pikachu Card',
                qty: 2,
                priceAtPurchase: 22.99,
                quantity: 2,
                price: 22.99,
                image: '/api/placeholder/200/280'
              }
            ]
          },
          {
            id: 'ORD_003',
            userId: 'user_003',
            customerName: 'Mike Johnson',
            customerEmail: 'mike@example.com',
            total: 129.99,
            status: 'shipped',
            paymentMethod: 'credit_card',
            paymentId: 'CARD_54321',
            createdAt: '2024-12-13T09:15:00Z',
            statusHistory: [
              {
                status: 'pending',
                timestamp: '2024-12-13T09:15:00Z',
                note: 'Order placed'
              },
              {
                status: 'processing',
                timestamp: '2024-12-13T09:30:00Z',
                note: 'Credit card payment authorized'
              },
              {
                status: 'shipped',
                timestamp: '2024-12-13T15:00:00Z',
                note: 'Package shipped via FedEx'
              }
            ],
            shippingAddress: {
              name: 'Mike Johnson',
              street: '789 Pine St',
              city: 'Chicago',
              state: 'IL',
              zip: '60601',
              country: 'US'
            },
            items: [
              {
                productId: 'PROD_003',
                title: 'Rare Holographic Card',
                qty: 1,
                priceAtPurchase: 129.99,
                quantity: 1,
                price: 129.99,
                image: '/api/placeholder/200/280'
              }
            ]
          }
        ];
        setOrders(sampleOrders);
        localStorage.setItem('orders', JSON.stringify(sampleOrders));
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  }, []);

  // Add new order (called from checkout completion)
  const addOrder = useCallback((orderData: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    setOrders(prevOrders => {
      const updatedOrders = [newOrder, ...prevOrders];
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      return updatedOrders;
    });
  }, []);

  // Expose addOrder function globally for checkout integration
  useEffect(() => {
    const globalWindow = window as Window & { addOrder?: typeof addOrder };
    globalWindow.addOrder = addOrder;
    return () => {
      delete globalWindow.addOrder;
    };
  }, [addOrder]);

  // Filter orders based on search and filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.paymentId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.paymentMethod === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/20';
      case 'processing': return 'text-blue-400 bg-blue-400/20';
      case 'shipped': return 'text-purple-400 bg-purple-400/20';
      case 'delivered': return 'text-green-400 bg-green-400/20';
      case 'cancelled': return 'text-red-400 bg-red-400/20';
      default: return 'text-slate-400 bg-slate-400/20';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'paypal': return '💳 PayPal';
      case 'paypal_test': return '🧪 PayPal Test';
      case 'credit_card': return '💳 Credit Card';
      default: return '💳 Unknown';
    }
  };

  // Helper function to check email configuration status
  const getEmailConfigStatus = useCallback(() => {
    const emailSettings = emailService.getSettings();
    
    if (!emailSettings.enabled) {
      return { 
        isConfigured: false, 
        status: 'disabled', 
        message: 'Email service is disabled',
        color: 'text-yellow-400'
      };
    }

    if (emailSettings.provider === 'gmail-dev' || emailSettings.provider === 'gmail-prod') {
      const configKey = emailSettings.provider === 'gmail-dev' ? 'gmail-dev-config' : 'gmail-prod-config';
      const gmailConfig = localStorage.getItem(configKey);
      
      if (!gmailConfig) {
        return { 
          isConfigured: false, 
          status: 'missing', 
          message: `${emailSettings.provider.toUpperCase()} not configured`,
          color: 'text-red-400'
        };
      }
      
      const config = JSON.parse(gmailConfig);
      if (!config.user || !config.appPassword) {
        return { 
          isConfigured: false, 
          status: 'incomplete', 
          message: `${emailSettings.provider.toUpperCase()} incomplete`,
          color: 'text-orange-400'
        };
      }
      
      return { 
        isConfigured: true, 
        status: 'ready', 
        message: emailSettings.provider === 'gmail-dev' ? 'Gmail Dev' : 'Gmail Prod',
        color: 'text-green-400'
      };
    }

    if (emailSettings.provider === 'smtp') {
      const smtpConfig = localStorage.getItem('smtp-config');
      if (!smtpConfig) {
        return { 
          isConfigured: false, 
          status: 'missing', 
          message: 'SMTP not configured',
          color: 'text-red-400'
        };
      }
      
      const config = JSON.parse(smtpConfig);
      if (!config.host || !config.user || !config.password) {
        return { 
          isConfigured: false, 
          status: 'incomplete', 
          message: 'SMTP incomplete',
          color: 'text-orange-400'
        };
      }
      
      return { 
        isConfigured: true, 
        status: 'ready', 
        message: 'SMTP',
        color: 'text-green-400'
      };
    }

    // This shouldn't be reached with current providers, but included for safety
    return { 
      isConfigured: true, 
      status: 'ready', 
      message: emailSettings.provider === 'gmail-dev' ? 'Gmail Dev' : 
               emailSettings.provider === 'gmail-prod' ? 'Gmail Prod' : 'SMTP',
      color: 'text-green-400'
    };
  }, []);

  const updateOrderStatus = useCallback(async (orderId: string, newStatus: Order['status']) => {
    // Confirm critical status changes
    if (newStatus === 'cancelled') {
      if (!window.confirm('Are you sure you want to cancel this order? This action may require additional processing.')) {
        return;
      }
    }
    
    if (newStatus === 'delivered') {
      if (!window.confirm('Mark this order as delivered? This will complete the order.')) {
        return;
      }
    }
    
    console.log('Updating order status:', orderId, 'to', newStatus);
    setIsUpdating(orderId);
    
    // Find the order to get customer email for notification
    const currentOrder = orders.find(order => order.id === orderId);
    
    // Simulate a brief loading state for better UX
    setTimeout(async () => {
      setOrders(prevOrders => {
        const updatedOrders = prevOrders.map(order => {
          if (order.id === orderId) {
            const statusHistory = order.statusHistory || [];
            return {
              ...order, 
              status: newStatus,
              statusHistory: [
                ...statusHistory,
                {
                  status: newStatus,
                  timestamp: new Date().toISOString(),
                  note: `Status updated to ${newStatus}`
                }
              ]
            };
          }
          return order;
        });
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
        console.log('Orders updated:', updatedOrders);
        return updatedOrders;
      });
      
      // Update selected order if it's the one being updated
      setSelectedOrder(prevSelected => {
        if (prevSelected && prevSelected.id === orderId) {
          const statusHistory = prevSelected.statusHistory || [];
          return {
            ...prevSelected, 
            status: newStatus,
            statusHistory: [
              ...statusHistory,
              {
                status: newStatus,
                timestamp: new Date().toISOString(),
                note: `Status updated to ${newStatus}`
              }
            ]
          };
        }
        return prevSelected;
      });
      
      // Send status update email
      if (currentOrder) {
        try {
          // Get current email settings to check configuration
          const emailSettings = emailService.getSettings();
          
          // Check if email service is enabled
          if (!emailSettings.enabled) {
            showSuccess('Status Updated', `Order ${orderId} status changed to ${newStatus}. (Email service is disabled)`);
            setIsUpdating(null);
            return;
          }
          
          // Check Gmail configuration based on provider
          if (emailSettings.provider === 'gmail-dev' || emailSettings.provider === 'gmail-prod') {
            const configKey = emailSettings.provider === 'gmail-dev' ? 'gmail-dev-config' : 'gmail-prod-config';
            const gmailConfig = localStorage.getItem(configKey);
            
            if (!gmailConfig) {
              showError('Email Configuration Missing', `${emailSettings.provider.toUpperCase()} configuration not found. Please configure in Admin panel.`);
              setIsUpdating(null);
              return;
            }
            
            const config = JSON.parse(gmailConfig);
            if (!config.user || !config.appPassword) {
              showError('Email Configuration Incomplete', `${emailSettings.provider.toUpperCase()} credentials missing. Please complete setup in Admin panel.`);
              setIsUpdating(null);
              return;
            }
          }
          
          // Check SMTP configuration
          if (emailSettings.provider === 'smtp') {
            const smtpConfig = localStorage.getItem('smtp-config');
            if (!smtpConfig) {
              showError('SMTP Configuration Missing', 'SMTP configuration not found. Please configure in Admin panel.');
              setIsUpdating(null);
              return;
            }
            
            const config = JSON.parse(smtpConfig);
            if (!config.host || !config.user || !config.password) {
              showError('SMTP Configuration Incomplete', 'SMTP credentials missing. Please complete setup in Admin panel.');
              setIsUpdating(null);
              return;
            }
          }
          
          const emailSent = await emailService.sendStatusUpdate(currentOrder, newStatus);
          if (emailSent) {
            const providerName = emailSettings.provider === 'gmail-dev' ? 'Gmail Dev' : 
                                emailSettings.provider === 'gmail-prod' ? 'Gmail Prod' : 
                                emailSettings.provider.toUpperCase();
            showSuccess('Status Updated', `Order ${orderId} status changed to ${newStatus}. Email sent via ${providerName}.`);
          } else {
            showSuccess('Status Updated', `Order ${orderId} status changed to ${newStatus}. (Email service unavailable)`);
          }
        } catch (error) {
          console.error('Failed to send email:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          showError('Email Failed', `Status updated to ${newStatus}, but email failed: ${errorMessage}`);
        }
      } else {
        showSuccess('Status Updated', `Order ${orderId} status changed to ${newStatus}`);
      }
      
      setIsUpdating(null);
    }, 300);
  }, [orders, showSuccess, showError]);

  // Editing functions
  const startEditCustomer = () => {
    if (!selectedOrder) return;
    setEditingSection('customer');
    setEditingCustomer({
      name: selectedOrder.customerName,
      email: selectedOrder.customerEmail
    });
  };

  const startEditShipping = () => {
    if (!selectedOrder) return;
    setEditingSection('shipping');
    setEditingShipping(selectedOrder.shippingAddress);
  };

  const startEditItems = () => {
    if (!selectedOrder) return;
    setEditingSection('items');
    setEditingItems([...selectedOrder.items]);
  };

  const saveCustomerEdit = () => {
    if (!selectedOrder) return;
    
    const updatedOrder = {
      ...selectedOrder,
      customerName: editingCustomer.name,
      customerEmail: editingCustomer.email
    };

    updateOrderData(updatedOrder);
    setEditingSection(null);
    showSuccess('Customer Updated', 'Customer details have been saved successfully');
  };

  const saveShippingEdit = () => {
    if (!selectedOrder) return;
    
    const updatedOrder = {
      ...selectedOrder,
      shippingAddress: editingShipping
    };

    updateOrderData(updatedOrder);
    setEditingSection(null);
    showSuccess('Shipping Updated', 'Shipping address has been saved successfully');
  };

  const saveItemsEdit = () => {
    if (!selectedOrder) return;
    
    // Calculate new total
    const newTotal = editingItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const updatedOrder = {
      ...selectedOrder,
      items: editingItems,
      total: newTotal
    };

    updateOrderData(updatedOrder);
    setEditingSection(null);
    showSuccess('Items Updated', 'Order items have been saved successfully');
  };

  const updateOrderData = (updatedOrder: Order) => {
    // Update orders list
    setOrders(prevOrders => {
      const updatedOrders = prevOrders.map(order => 
        order.id === updatedOrder.id ? updatedOrder : order
      );
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      return updatedOrders;
    });

    // Update selected order
    setSelectedOrder(updatedOrder);
  };

  const cancelEdit = () => {
    setEditingSection(null);
  };

  const addItem = () => {
    const newItem = {
      productId: `PROD_${Date.now()}`,
      title: 'New Item',
      qty: 1,
      priceAtPurchase: 0,
      quantity: 1,
      price: 0,
      image: '/api/placeholder/200/280'
    };
    setEditingItems([...editingItems, newItem]);
  };

  const removeItem = (index: number) => {
    setEditingItems(editingItems.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    setEditingItems(editingItems.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        // Update both qty and quantity for consistency
        if (field === 'quantity' || field === 'qty') {
          updatedItem.quantity = value as number;
          updatedItem.qty = value as number;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  if (!isOrdersMenuOpen) return null;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={closeOrdersMenu}
      />

      {/* Side Menu */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-full sm:w-[500px] md:w-[600px] lg:w-[700px] xl:w-[800px] bg-slate-800 shadow-2xl z-50 overflow-y-auto border-l border-slate-700"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700 bg-slate-800/95 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
            <h2 className="text-lg sm:text-xl font-semibold text-white">Orders Management</h2>
          </div>
          <button
            onClick={closeOrdersMenu}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and Search */}
        <div className="p-4 sm:p-6 border-b border-slate-700 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search orders, customers, or payment IDs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Payment</label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="all">All Payments</option>
                <option value="paypal">PayPal</option>
                <option value="paypal_test">PayPal Test</option>
                <option value="credit_card">Credit Card</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">
              {filteredOrders.length} of {orders.length} orders
            </span>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" className="text-xs">
                <Download className="w-3 h-3 mr-1" />
                Export
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs bg-green-600/20 hover:bg-green-600/30 text-green-400"
                onClick={() => {
                  const testOrder = {
                    id: `ORD_TEST_${Date.now()}`,
                    userId: 'test_user',
                    customerName: 'Test Customer',
                    customerEmail: 'test@example.com',
                    total: 99.99,
                    status: 'pending' as const,
                    paymentMethod: 'paypal_test',
                    paymentId: `TEST_${Date.now()}`,
                    statusHistory: [
                      {
                        status: 'pending' as const,
                        timestamp: new Date().toISOString(),
                        note: 'Test order created'
                      }
                    ],
                    shippingAddress: {
                      name: 'Test Customer',
                      street: '123 Test St',
                      city: 'Test City',
                      state: 'TS',
                      zip: '12345',
                      country: 'US'
                    },
                    items: [{
                      productId: 'test-product',
                      title: 'Test Card',
                      qty: 1,
                      priceAtPurchase: 99.99,
                      quantity: 1,
                      price: 99.99,
                      image: '/api/placeholder/200/280'
                    }]
                  };
                  addOrder(testOrder);
                  showSuccess('Test Order Added', 'A test order has been created for testing status updates');
                }}
              >
                + Test Order
              </Button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="p-4 sm:p-6">
          {selectedOrder ? (
            /* Order Detail View */
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-slate-400 hover:text-white text-sm flex items-center space-x-1"
                >
                  <span>← Back to Orders</span>
                </button>
                <span className="text-sm text-slate-400">Order #{selectedOrder.id}</span>
              </div>

              {/* Order Summary */}
              <div className="bg-slate-700/30 rounded-lg p-3 sm:p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer Details
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={startEditCustomer}
                    className="text-slate-400 hover:text-white"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>

                {editingSection === 'customer' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                      <input
                        type="text"
                        value={editingCustomer.name}
                        onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                      <input
                        type="email"
                        value={editingCustomer.email}
                        onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" onClick={saveCustomerEdit}>
                        <Save className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                      <Button variant="ghost" size="sm" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-1">{selectedOrder.customerName}</h3>
                      <p className="text-sm text-slate-400 truncate">{selectedOrder.customerEmail}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-lg sm:text-xl font-bold text-white">${selectedOrder.total.toFixed(2)}</div>
                      <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 text-sm">
                  <div className="flex justify-between sm:block">
                    <span className="text-slate-400">Payment:</span>
                    <span className="text-white sm:ml-2">{getPaymentMethodIcon(selectedOrder.paymentMethod)}</span>
                  </div>
                  <div className="flex justify-between sm:block">
                    <span className="text-slate-400">Payment ID:</span>
                    <span className="text-white sm:ml-2 font-mono text-xs truncate max-w-[150px] sm:max-w-none">{selectedOrder.paymentId}</span>
                  </div>
                  <div className="flex justify-between sm:block">
                    <span className="text-slate-400">Date:</span>
                    <span className="text-white sm:ml-2">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between sm:block">
                    <span className="text-slate-400">Time:</span>
                    <span className="text-white sm:ml-2">{new Date(selectedOrder.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Shipping Address
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={startEditShipping}
                    className="text-slate-400 hover:text-white"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>

                {editingSection === 'shipping' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                      <input
                        type="text"
                        value={editingShipping.name}
                        onChange={(e) => setEditingShipping({ ...editingShipping, name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Street Address</label>
                      <input
                        type="text"
                        value={editingShipping.street}
                        onChange={(e) => setEditingShipping({ ...editingShipping, street: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">City</label>
                        <input
                          type="text"
                          value={editingShipping.city}
                          onChange={(e) => setEditingShipping({ ...editingShipping, city: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">State</label>
                        <input
                          type="text"
                          value={editingShipping.state}
                          onChange={(e) => setEditingShipping({ ...editingShipping, state: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">ZIP Code</label>
                        <input
                          type="text"
                          value={editingShipping.zip}
                          onChange={(e) => setEditingShipping({ ...editingShipping, zip: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Country</label>
                        <input
                          type="text"
                          value={editingShipping.country}
                          onChange={(e) => setEditingShipping({ ...editingShipping, country: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" onClick={saveShippingEdit}>
                        <Save className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                      <Button variant="ghost" size="sm" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-300 space-y-1">
                    <div>{selectedOrder.shippingAddress.name}</div>
                    <div>{selectedOrder.shippingAddress.street}</div>
                    <div>
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}
                    </div>
                    <div>{selectedOrder.shippingAddress.country}</div>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="bg-slate-700/30 rounded-lg p-3 sm:p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Order Items
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={startEditItems}
                    className="text-slate-400 hover:text-white"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>

                {editingSection === 'items' ? (
                  <div className="space-y-4">
                    {editingItems.map((item, index) => (
                      <div key={`editing-${index}`} className="bg-slate-800/50 p-3 rounded border border-slate-600">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-16 bg-slate-600 rounded overflow-hidden flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/api/placeholder/200/280';
                              }}
                            />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div>
                              <label className="block text-xs font-medium text-slate-300 mb-1">Title</label>
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => updateItem(index, 'title', e.target.value)}
                                className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">Quantity</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">Price</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.price}
                                  onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                            <div className="text-xs text-slate-400">
                              Subtotal: ${(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex gap-2 pt-2 border-t border-slate-600">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={addItem}
                        className="text-green-400 hover:text-green-300"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Item
                      </Button>
                      <div className="flex-1"></div>
                      <div className="text-sm text-white font-medium">
                        Total: ${editingItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2 border-t border-slate-600">
                      <Button size="sm" onClick={saveItemsEdit}>
                        <Save className="h-3 w-3 mr-1" />
                        Save Items
                      </Button>
                      <Button variant="ghost" size="sm" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={`${item.productId}-${index}`} className="flex items-center space-x-3">
                        <div className="w-10 h-12 sm:w-12 sm:h-16 bg-slate-600 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/api/placeholder/200/280';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-white text-sm font-medium truncate">{item.title}</h5>
                          <p className="text-slate-400 text-xs">Qty: {item.quantity} × ${item.price}</p>
                        </div>
                        <div className="text-white text-sm font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Update */}
              <div className="bg-slate-700/30 rounded-lg p-3 sm:p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium">Update Status</h4>
                  <div className="text-xs">
                    {(() => {
                      const emailStatus = getEmailConfigStatus();
                      return (
                        <span className={emailStatus.color}>
                          📧 {emailStatus.message}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => updateOrderStatus(selectedOrder.id, status)}
                      disabled={selectedOrder.status === status || isUpdating === selectedOrder.id}
                      className={`px-3 py-2 rounded text-xs font-medium transition-all duration-200 relative ${
                        selectedOrder.status === status
                          ? getStatusColor(status) + ' border border-current cursor-not-allowed'
                          : 'text-slate-400 hover:text-white hover:bg-slate-600 border border-slate-600 hover:border-slate-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      {isUpdating === selectedOrder.id ? (
                        <div className="flex items-center justify-center">
                          <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                          Updating...
                        </div>
                      ) : (
                        <>
                          {selectedOrder.status === status && <span className="mr-1">✓</span>}
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </>
                      )}
                    </button>
                  ))}
                </div>
                <div className="mt-3 text-xs text-slate-400">
                  Current status: <span className="text-white capitalize">{selectedOrder.status}</span>
                  {isUpdating === selectedOrder.id && (
                    <span className="ml-2 text-yellow-400">• Updating...</span>
                  )}
                </div>
                
                {/* Email Configuration Warning */}
                {(() => {
                  const emailStatus = getEmailConfigStatus();
                  if (!emailStatus.isConfigured) {
                    return (
                      <div className="mt-3 p-2 bg-yellow-900/20 border border-yellow-700/50 rounded text-xs">
                        <span className="text-yellow-400">⚠️ {emailStatus.message}</span>
                        <span className="text-yellow-300 ml-1">- Status emails won't be sent</span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
              
              {/* Status History */}
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                  <h4 className="text-white font-medium mb-3">Status History</h4>
                  <div className="space-y-2">
                    {selectedOrder.statusHistory.slice().reverse().map((history, index) => (
                      <div key={`${history.timestamp}-${history.status}-${index}`} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(history.status)}`}>
                            {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                          </div>
                          {history.note && <span className="text-slate-300">{history.note}</span>}
                        </div>
                        <span className="text-slate-400 text-xs">
                          {new Date(history.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Orders List View */
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Orders Found</h3>
                  <p className="text-sm text-slate-400">
                    {searchQuery || statusFilter !== 'all' || paymentFilter !== 'all'
                      ? 'No orders match your current filters.'
                      : 'No orders have been placed yet.'}
                  </p>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-slate-700/30 rounded-lg p-3 sm:p-4 border border-slate-600 hover:border-slate-500 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium text-sm">#{order.id}</span>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </div>
                          {/* Email Status Indicator */}
                          {(() => {
                            const emailStatus = getEmailConfigStatus();
                            if (emailStatus.isConfigured) {
                              return <span className="text-green-400 text-xs">📧</span>;
                            } else if (emailStatus.status === 'disabled') {
                              return <span className="text-yellow-400 text-xs" title="Email disabled">📧</span>;
                            } else {
                              return <span className="text-red-400 text-xs" title="Email not configured">📧</span>;
                            }
                          })()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">${order.total.toFixed(2)}</div>
                        <div className="text-xs text-slate-400">{getPaymentMethodIcon(order.paymentMethod)}</div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-white font-medium truncate">{order.customerName}</div>
                        <div className="text-slate-400 text-xs truncate">{order.customerEmail}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-slate-400 text-xs">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-slate-500 text-xs">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-slate-400 text-xs">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </div>
                      <button className="text-red-400 hover:text-red-300 text-xs flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrdersSideMenu;
