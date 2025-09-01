import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/useCart';
import { useUiStore } from '../../store/useUi';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const {
    getCartItems,
    getCartTotal,
    getCartCount,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCartStore();

  const { isCartOpen, closeCart } = useUiStore();

  const cartItems = getCartItems();
  const total = getCartTotal();
  const count = getCartCount();

  if (!isCartOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={closeCart}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="absolute right-0 top-0 h-full w-96 max-w-[90vw] bg-slate-800 shadow-xl flex flex-col border-l border-slate-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Shopping Cart ({count} {count === 1 ? 'item' : 'items'})
            </h2>
            <button
              onClick={closeCart}
              className="text-slate-400 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-700 transition-colors"
            >
              ×
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <div className="text-4xl mb-2">🛒</div>
                <p>Your cart is empty</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center space-x-3 bg-slate-700/50 rounded-lg p-3 border border-slate-600"
                  >
                    {/* Product Image */}
                    <div className="w-12 h-16 bg-slate-600 rounded flex-shrink-0 flex items-center justify-center border border-slate-500">
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.title}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <span className="text-xs text-slate-400">No Image</span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white truncate">
                        {item.product.title}
                      </h3>
                      <p className="text-xs text-slate-400">
                        ${item.product.price} each
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <button
                          onClick={() => updateQuantity(item.productId, item.qty - 1)}
                          disabled={item.qty <= 1}
                          className="w-5 h-5 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-full text-xs transition-colors flex items-center justify-center text-white"
                        >
                          -
                        </button>
                        <span className="text-xs font-medium min-w-[16px] text-center text-white">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.qty + 1)}
                          disabled={item.qty >= item.product.stock}
                          className="w-5 h-5 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-full text-xs transition-colors flex items-center justify-center text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Price and Remove */}
                    <div className="text-right">
                      <div className="text-sm font-semibold text-white">
                        ${(item.product.price * item.qty).toFixed(2)}
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-xs text-red-400 hover:text-red-300 mt-1 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="p-4 border-t border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-semibold text-white">Total:</span>
                <span className="text-lg font-bold text-red-400">
                  ${total.toFixed(2)}
                </span>
              </div>
              
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    navigate('/checkout');
                    closeCart();
                  }}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Checkout
                </button>
                <button
                  onClick={clearCart}
                  className="w-full bg-slate-600 text-slate-300 py-2 px-4 rounded-lg font-semibold hover:bg-slate-700 hover:text-white transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Cart;
