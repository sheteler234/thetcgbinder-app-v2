import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Eye, Search, Download, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { useUiStore } from '../../store/useUi';
import { useNotifications } from '../../store/useUi';
import { emailService } from '../../lib/emailService';
import type { Order } from '../../lib/types';

const OrdersSideMenu: React.FC = () => {
  const { isOrdersMenuOpen, closeOrdersMenu } = useUiStore();
  const { showSuccess } = useNotifications();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

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
          const emailSent = await emailService.sendStatusUpdate(currentOrder, newStatus);
          if (emailSent) {
            showSuccess('Status Updated', `Order ${orderId} status changed to ${newStatus}. Email notification sent.`);
          } else {
            showSuccess('Status Updated', `Order ${orderId} status changed to ${newStatus}. (Email service unavailable)`);
          }
        } catch (error) {
          console.error('Failed to send email:', error);
          showSuccess('Status Updated', `Order ${orderId} status changed to ${newStatus}. (Email failed to send)`);
        }
      } else {
        showSuccess('Status Updated', `Order ${orderId} status changed to ${newStatus}`);
      }
      
      setIsUpdating(null);
    }, 300);
  }, [orders, showSuccess]);

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
        className="fixed right-0 top-0 h-full w-[600px] bg-slate-800 shadow-2xl z-50 overflow-y-auto border-l border-slate-700"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800/95 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <Package className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-semibold text-white">Orders Management</h2>
          </div>
          <button
            onClick={closeOrdersMenu}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and Search */}
        <div className="p-6 border-b border-slate-700 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search orders, customers, or payment IDs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-3">
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
        <div className="p-6">
          {selectedOrder ? (
            /* Order Detail View */
            <div className="space-y-6">
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
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{selectedOrder.customerName}</h3>
                    <p className="text-sm text-slate-400">{selectedOrder.customerEmail}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">${selectedOrder.total.toFixed(2)}</div>
                    <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Payment:</span>
                    <span className="text-white ml-2">{getPaymentMethodIcon(selectedOrder.paymentMethod)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Payment ID:</span>
                    <span className="text-white ml-2 font-mono text-xs">{selectedOrder.paymentId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Date:</span>
                    <span className="text-white ml-2">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Time:</span>
                    <span className="text-white ml-2">{new Date(selectedOrder.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                <h4 className="text-white font-medium mb-2">Shipping Address</h4>
                <div className="text-sm text-slate-300 space-y-1">
                  <div>{selectedOrder.shippingAddress.name}</div>
                  <div>{selectedOrder.shippingAddress.street}</div>
                  <div>
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}
                  </div>
                  <div>{selectedOrder.shippingAddress.country}</div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                <h4 className="text-white font-medium mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
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
              </div>

              {/* Status Update */}
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                <h4 className="text-white font-medium mb-3">Update Status</h4>
                <div className="grid grid-cols-2 gap-2">
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
              </div>
              
              {/* Status History */}
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                  <h4 className="text-white font-medium mb-3">Status History</h4>
                  <div className="space-y-2">
                    {selectedOrder.statusHistory.slice().reverse().map((history, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
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
                    className="bg-slate-700/30 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">#{order.id}</span>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">${order.total.toFixed(2)}</div>
                        <div className="text-xs text-slate-400">{getPaymentMethodIcon(order.paymentMethod)}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <div className="text-white font-medium">{order.customerName}</div>
                        <div className="text-slate-400 text-xs">{order.customerEmail}</div>
                      </div>
                      <div className="text-right">
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
