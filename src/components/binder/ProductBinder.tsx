import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye } from 'lucide-react';
import type { Product } from '../../lib/types';
import { useCartStore } from '../../store/useCart';
import { useNotifications } from '../../store/useUi';

interface ProductBinderProps {
  product: Product;
  productContent?: React.ReactNode;
  allProducts?: Product[];
  onProductChange?: (product: Product) => void;
}

const ProductBinder: React.FC<ProductBinderProps> = ({ 
  product, 
  allProducts = [], 
  onProductChange 
}) => {
  const yugiImageUrl = "/yugi-character.png";
  const [quantity, setQuantity] = useState(1);
  const [direction, setDirection] = useState(0);
  const { addItem } = useCartStore();
  const { addNotification } = useNotifications();
  const binderRef = useRef<HTMLDivElement>(null);

  // Scroll to center on mobile when product changes
  useEffect(() => {
    const scrollToCenter = () => {
      if (binderRef.current && window.innerWidth < 768) { // Only on mobile
        const container = binderRef.current;
        const containerHeight = container.clientHeight;
        const scrollHeight = container.scrollHeight;
        const centerPosition = (scrollHeight - containerHeight) / 2;
        
        container.scrollTo({
          top: centerPosition,
          behavior: 'smooth'
        });
      }
    };

    // Small delay to ensure content is rendered
    const timer = setTimeout(scrollToCenter, 100);
    return () => clearTimeout(timer);
  }, [product.id]); // Trigger when product changes

  // Find current product index and related products
  const currentIndex = allProducts.findIndex(p => p.id === product.id);
  const hasNext = currentIndex >= 0 && currentIndex < allProducts.length - 1;
  const hasPrevious = currentIndex > 0;
  
  // Show left page when we're not on the first product
  const shouldShowLeftPage = currentIndex > 0;

  const handleProductNavigation = (newDirection: number) => {
    if (!onProductChange || currentIndex < 0) return;
    
    const newIndex = currentIndex + newDirection;
    if (newIndex >= 0 && newIndex < allProducts.length) {
      setDirection(newDirection);
      
      // Trigger page turn animation and product change
      setTimeout(() => {
        onProductChange(allProducts[newIndex]);
        setDirection(0);
      }, 750); // Half of the animation duration
    }
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(prev + delta, product.stock)));
  };

  const handleAddToCart = () => {
    addItem(product.id, quantity);
    addNotification({
      type: 'success',
      title: 'Added to Cart',
      message: `${quantity} × ${product.title} added to your cart`,
    });
    setQuantity(1); // Reset quantity after adding
  };

  // Helper function to get condition display name
  const getConditionDisplay = (condition?: string) => {
    switch (condition) {
      case 'NM': return 'Near Mint';
      case 'LP': return 'Lightly Played';
      case 'MP': return 'Moderately Played';
      case 'HP': return 'Heavily Played';
      case 'DMG': return 'Damaged';
      default: return 'Near Mint';
    }
  };

  // Helper function to get condition color
  const getConditionColor = (condition?: string) => {
    switch (condition) {
      case 'NM': return 'text-green-600';
      case 'LP': return 'text-yellow-600';
      case 'MP': return 'text-yellow-500';
      case 'HP': return 'text-orange-600';
      case 'DMG': return 'text-red-600';
      default: return 'text-green-600';
    }
  };

  // Create a 9-card grid with product info in surrounding slots and main product in center
  const renderProductGrid = () => {
    const cards = [
      // Position 1: Empty
      <div key="empty1" className="relative w-full h-full aspect-[2.5/3.5] min-w-[120px] max-w-[200px] max-h-[280px] rounded-lg overflow-hidden bg-white shadow-lg flex-shrink-0">
        <div className="h-full flex flex-col justify-center items-center p-3">
          <div className="text-slate-400 text-center">
            <div className="mb-2">📦</div>
            <div className="text-xs">Available Space</div>
          </div>
        </div>
      </div>,
      
      // Position 2: Complete Product Details with Cart
      <div key="details" className="relative w-full h-full aspect-[2.5/3.5] min-w-[120px] max-w-[200px] max-h-[280px] rounded-lg overflow-hidden bg-white shadow-lg flex-shrink-0">
        <div className="h-full p-3 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1">{product.title}</h3>
            <div className="text-slate-600 text-xs">SKU: {product.sku}</div>
          </div>
          <div>
            <div className="text-center mb-2">
              <div className="text-green-600 font-bold text-lg mb-1">${product.price}</div>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <button 
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-6 h-6 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400 rounded-full text-xs transition-colors flex items-center justify-center"
                >
                  -
                </button>
                <span className="text-sm font-medium min-w-[20px] text-center">{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                  className="w-6 h-6 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400 rounded-full text-xs transition-colors flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
            <button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-green-500 text-white py-2 px-3 rounded-lg text-xs font-semibold hover:bg-green-600 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors mb-2"
            >
              {product.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
            </button>
            <div className="text-slate-600 text-xs text-center">Stock: {product.stock}</div>
          </div>
        </div>
      </div>,
      
      // Position 3: Product Details
      <div key="product-details" className="relative w-full h-full aspect-[2.5/3.5] min-w-[120px] max-w-[200px] max-h-[280px] rounded-lg overflow-hidden bg-white shadow-lg flex-shrink-0">
        <div className="h-full p-3">
          <h4 className="text-sm font-semibold text-slate-800 mb-3">Product Details</h4>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="font-medium">Rarity:</span>
              <span className="text-amber-600 font-medium">{product.rarity || 'N/A'}</span>
            </div>
            {product.number && (
              <div className="flex items-center justify-between">
                <span className="font-medium">Number:</span>
                <span className="text-blue-600 font-medium">{product.number}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="font-medium">Set:</span>
              <span className="text-purple-600 font-medium">Coming Soon</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Category:</span>
              <span className="text-slate-800">{product.categoryId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Condition:</span>
              <span className={`${getConditionColor(product.condition)} font-medium`}>
                {getConditionDisplay(product.condition)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Language:</span>
              <span className="text-slate-800">English</span>
            </div>
          </div>
        </div>
      </div>,
      
      // Position 4: Additional Image 1
      <div key="additional1" className="relative w-full h-full aspect-[2.5/3.5] min-w-[120px] max-w-[200px] max-h-[280px] rounded-lg overflow-hidden bg-white shadow-lg flex-shrink-0">
        {product.additionalImage1 ? (
          <div className="relative h-full">
            <img
              src={product.additionalImage1}
              alt={`${product.title} - Additional view 1`}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-2">
              <div className="text-xs font-bold">Additional Image 1</div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col justify-center items-center p-3 border-2 border-dashed border-slate-300">
            <div className="text-center text-slate-400 text-xs">
              <div className="mb-2">📷</div>
              <div>Additional Image 1</div>
              <div className="text-xs mt-1">No image uploaded</div>
            </div>
          </div>
        )}
      </div>,
      
      // Position 5: Main Product Image (center) - Larger
      <div key="main-product" className="group relative w-full h-full aspect-[2.5/3.5] min-w-[140px] max-w-[250px] max-h-[350px] cursor-pointer rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex-shrink-0">
        {/* Card Image */}
        <div className="relative w-full h-full bg-gradient-to-br from-blue-900 to-purple-900">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="bg-white rounded-full p-2 shadow-lg">
                <Eye className="w-5 h-5 text-gray-700" />
              </div>
            </div>
          </div>
          
          {/* Product overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <h3 className="text-white font-bold text-sm mb-1">{product.title}</h3>
            <div className="flex items-center justify-between">
              <span className="text-green-400 font-bold text-lg">${product.price}</span>
              <span className="text-white text-xs bg-black/50 px-2 py-1 rounded">
                Stock: {product.stock}
              </span>
            </div>
          </div>
        </div>
      </div>,
      
      // Position 6: Additional Image 2
      <div key="additional2" className="relative w-full h-full aspect-[2.5/3.5] min-w-[120px] max-w-[200px] max-h-[280px] rounded-lg overflow-hidden bg-white shadow-lg flex-shrink-0">
        {product.additionalImage2 ? (
          <div className="relative h-full">
            <img
              src={product.additionalImage2}
              alt={`${product.title} - Additional view 2`}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-2">
              <div className="text-xs font-bold">Additional Image 2</div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col justify-center items-center p-3 border-2 border-dashed border-slate-300">
            <div className="text-center text-slate-400 text-xs">
              <div className="mb-2">📷</div>
              <div>Additional Image 2</div>
              <div className="text-xs mt-1">No image uploaded</div>
            </div>
          </div>
        )}
      </div>,
      
      // Position 7: Condition & Authenticity
      <div key="authenticity" className="relative w-full h-full aspect-[2.5/3.5] min-w-[120px] max-w-[200px] max-h-[280px] rounded-lg overflow-hidden bg-white shadow-lg flex-shrink-0">
        <div className="h-full p-3">
          <h4 className="text-sm font-semibold text-slate-800 mb-3">Authenticity</h4>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center">
              <span className="text-green-600 mr-1">💎</span>
              Certified authentic
            </div>
            <div className="flex items-center">
              <span className="text-blue-600 mr-1">🔍</span>
              Professionally graded
            </div>
            <div className="flex items-center">
              <span className="text-purple-600 mr-1">🛡️</span>
              Money-back guarantee
            </div>
            <div className="flex items-center">
              <span className="text-orange-600 mr-1">📸</span>
              High-res photos
            </div>
          </div>
        </div>
      </div>,
      
      // Position 8: Shipping & Rating
      <div key="shipping" className="relative w-full h-full aspect-[2.5/3.5] min-w-[120px] max-w-[200px] max-h-[280px] rounded-lg overflow-hidden bg-white shadow-lg flex-shrink-0">
        <div className="h-full p-3">
          <h4 className="text-sm font-semibold text-slate-800 mb-2">Rating</h4>
          <div className="flex items-center space-x-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`w-3 h-3 ${i < 4 ? 'bg-yellow-400' : 'bg-slate-300'} rounded-full`} />
            ))}
            <span className="text-xs text-slate-600 ml-1">(4.5/5)</span>
          </div>
          <h4 className="text-sm font-semibold text-slate-800 mb-2">Shipping</h4>
          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex items-center">
              <span className="text-green-600 mr-1">✓</span>
              Free over $50
            </div>
            <div className="flex items-center">
              <span className="text-blue-600 mr-1">🚚</span>
              Ships in 1-2 days
            </div>
            <div className="flex items-center">
              <span className="text-purple-600 mr-1">↩️</span>
              30-day returns
            </div>
          </div>
        </div>
      </div>,
      
      // Position 9: Wishlist & Actions
      <div key="actions" className="relative w-full h-full aspect-[2.5/3.5] min-w-[120px] max-w-[200px] max-h-[280px] rounded-lg overflow-hidden bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg cursor-pointer flex-shrink-0">
        <div className="h-full flex flex-col justify-center items-center text-white p-3 space-y-3">
          <button className="flex flex-col items-center space-y-1 hover:scale-110 transition-transform">
            <span className="text-2xl">♥</span>
            <span className="text-xs font-semibold">Add to Wishlist</span>
          </button>
          <button className="flex flex-col items-center space-y-1 hover:scale-110 transition-transform">
            <span className="text-xl">📤</span>
            <span className="text-xs font-semibold">Share</span>
          </button>
          <button className="flex flex-col items-center space-y-1 hover:scale-110 transition-transform">
            <span className="text-xl">🔍</span>
            <span className="text-xs font-semibold">Compare</span>
          </button>
        </div>
      </div>
    ];

    return (
      <>
        {/* Desktop: 3x3 Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 h-full p-6 place-items-center">
          {cards}
        </div>
        
        {/* Mobile/Tablet: Vertical Scrollable Column */}
        <div ref={binderRef} className="md:hidden h-full overflow-y-auto">
          <div className="flex flex-col space-y-4 p-4 items-center">
            {cards}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto mt-32"
      >
        <div className="relative overflow-visible">
          {/* Main binder container - Yu-Gi-Oh! themed */}
          <div className="relative bg-gradient-to-br from-amber-800 via-amber-900 to-amber-950 p-4 sm:p-6 md:p-8 lg:p-12 rounded-lg shadow-2xl border-4 border-amber-700" style={{ overflow: 'visible' }}>
            
            {/* Yu-Gi-Oh! Logo - Top Left */}
            <div className="absolute -top-4 left-8 sm:left-10 md:left-12 lg:left-16 z-30">
              <img
                src="/yugioh-logo.webp"
                alt="Yu-Gi-Oh! Trading Card Game"
                className="w-32 sm:w-40 md:w-52 lg:w-64 h-auto drop-shadow-lg opacity-90 hover:opacity-100 transition-opacity"
                onError={(e) => {
                  // Fallback to text if image doesn't load
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              <div 
                className="text-amber-200 font-bold text-sm bg-black/50 px-3 py-2 rounded hidden"
                style={{ display: 'none' }}
              >
                YU-GI-OH!
              </div>
            </div>
            
            {/* Yugi Character - Standing above the Amber Binder */}
            <div className="absolute -top-32 sm:-top-40 md:-top-48 lg:-top-56 right-2 sm:right-4 md:right-6 lg:right-8 z-20 pointer-events-none">
              <motion.img
                src={yugiImageUrl}
                alt="Yugi Character"
                className="w-24 h-auto sm:w-32 md:w-40 lg:w-48 drop-shadow-2xl"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                style={{
                  filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.5))'
                }}
              />
              
              {/* Enhanced glow effect for bigger image */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-yellow-400/15 to-purple-500/15 rounded-full blur-xl -z-10"
                style={{
                  transform: 'scale(1.2)',
                }}
              />
            </div>

            {/* Binder rings with more realistic 3D effect */}
            <div className="absolute left-2 sm:left-3 md:left-4 top-8 sm:top-12 md:top-16 bottom-16 sm:bottom-20 md:bottom-28 flex flex-col justify-between items-center w-4 sm:w-6 md:w-8 z-20">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 border-2 sm:border-3 md:border-4 border-gray-400 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 shadow-inner"
                  style={{
                    transform: 'perspective(100px) rotateX(45deg)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 2px 4px rgba(59, 130, 246, 0.4)'
                  }}
                />
              ))}
            </div>

            {/* Page content area */}
            <div className="ml-4 sm:ml-6 md:ml-8 lg:ml-12 mt-4 sm:mt-6 md:mt-8 rounded shadow-lg relative" style={{ aspectRatio: '8.5/11', overflow: 'visible' }}>
              {/* Turned Page - Left page animation */}
              <AnimatePresence>
                {shouldShowLeftPage && (
                  <motion.div
                    key="left-page"
                    initial={{ x: '0%', rotateY: 0 }}
                    animate={{ x: '-10%', rotateY: -15 }}
                    exit={{ x: '-30%', rotateY: -25, opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="absolute rounded shadow-lg"
                    style={{
                      right: '90%', // Overlaps 10% aligned with ring area
                      top: '0',
                      left: '-90%', // Extends far left but overlaps at ring position
                      bottom: '0',
                      zIndex: 15,
                      transformOrigin: 'right center',
                      transformStyle: 'preserve-3d',
                      backfaceVisibility: 'hidden',
                      background: 'linear-gradient(145deg, #8B4513 0%, #A0522D 30%, #CD853F  70%, #D2691E 100%)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                    }}
                  >
                    <div className="p-4 h-full binder-page-black">
                      {/* Show previous product or empty slots */}
                      <div className="grid grid-cols-3 gap-6 h-full p-6 place-items-center opacity-50">
                        {[...Array(9)].map((_, index) => (
                          <div
                            key={index}
                            className="w-full aspect-[2.5/3.5] bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-600 shadow-md"
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Page binding edge shadow */}
                    <div className="absolute top-0 bottom-0 right-0 w-4 bg-gradient-to-r from-transparent via-black/20 to-black/40 pointer-events-none"></div>
                    
                    {/* Page spine line */}
                    <div className="absolute top-0 bottom-0 right-0 w-1 bg-gray-400 shadow-lg"></div>
                    
                    {/* Page curl effect */}
                    <div className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 transform rotate-45 translate-x-4 -translate-y-4 shadow-xl border border-gray-300"></div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main page content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`product-${product.id}`}
                  initial={direction !== 0 ? { 
                    rotateY: 0,
                    rotateX: 0,
                    x: 0,
                    z: 0,
                    transformOrigin: 'left center'
                  } : false}
                  animate={{ 
                    rotateY: direction > 0 ? [0, -15, -90, -160, -180] : (direction < 0 ? [0, 15, 90, 160, 180] : 0),
                    rotateX: direction !== 0 ? [0, -10, -5, -2, 0] : 0,
                    x: direction > 0 ? [0, 0, -100, -300, -450] : (direction < 0 ? [0, 0, 100, 300, 450] : 0),
                    z: direction !== 0 ? [0, 60, 40, 20, 5] : 0,
                    transformOrigin: 'left center'
                  }}
                  transition={{ 
                    duration: 1.5,
                    ease: [0.22, 1, 0.36, 1],
                    times: [0, 0.25, 0.5, 0.8, 1]
                  }}
                  className="w-full h-full rounded shadow-lg relative"
                  style={{
                    background: 'linear-gradient(145deg, #8B4513 0%, #A0522D 30%, #CD853F  70%, #D2691E 100%)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden',
                    zIndex: direction !== 0 ? 50 : 5
                  }}
                >
                  <div className="p-4 h-full binder-page-black">
                    {renderProductGrid()}
                  </div>
                  
                  {/* Page binding edge shadow */}
                  <div className="absolute top-0 bottom-0 right-0 w-4 bg-gradient-to-r from-transparent via-black/20 to-black/40 pointer-events-none"></div>
                  
                  {/* Page spine line */}
                  <div className="absolute top-0 bottom-0 right-0 w-1 bg-gray-400 shadow-lg"></div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation hands */}
            {allProducts.length > 1 && (
              <>
                {/* Previous hand - Left side */}
                <motion.div
                  onClick={() => !hasPrevious ? null : handleProductNavigation(-1)}
                  className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer z-30 ${
                    !hasPrevious ? 'opacity-20 pointer-events-none' : 'opacity-100'
                  }`}
                  initial={{ x: -20, y: 0, rotateY: -30, rotateX: 10 }}
                  whileHover={hasPrevious ? { 
                    scale: 1.2,
                    x: -10,
                    y: -5,
                    rotateY: -45,
                    rotateX: 15,
                    rotateZ: -5
                  } : {}}
                  whileTap={hasPrevious ? { 
                    scale: 0.9,
                    x: -15,
                    y: 2,
                    rotateY: -50,
                    rotateX: 20
                  } : {}}
                  animate={{
                    y: [0, -8, 0, -4, 0],
                    x: [-20, -15, -20, -18, -20],
                    rotateY: [-30, -35, -30, -32, -30],
                    rotateX: [10, 15, 10, 12, 10],
                    rotateZ: [0, -3, 0, -1, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: [0.4, 0, 0.6, 1],
                    times: [0, 0.2, 0.5, 0.8, 1]
                  }}
                  style={{
                    transformStyle: 'preserve-3d',
                    filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.4))',
                    perspective: '1000px'
                  }}
                >
                  <motion.div
                    className="relative"
                    animate={{
                      rotateZ: [0, -2, 2, -1, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                  >
                    <div 
                      className="text-7xl transform -scale-x-100 select-none"
                      style={{ 
                        textShadow: '4px 4px 8px rgba(0,0,0,0.5), 2px 2px 4px rgba(255,255,255,0.1)',
                        filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))',
                        background: 'linear-gradient(145deg, #FDB863, #F59E0B, #D97706)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      🫴
                    </div>
                    {/* Glow effect */}
                    <div className="absolute inset-0 text-7xl transform -scale-x-100 opacity-30 blur-sm">
                      🫴
                    </div>
                  </motion.div>
                </motion.div>

                {/* Next hand - Right side */}
                <motion.div
                  onClick={() => !hasNext ? null : handleProductNavigation(1)}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 cursor-pointer z-30 ${
                    !hasNext ? 'opacity-20 pointer-events-none' : 'opacity-100'
                  }`}
                  initial={{ x: 20, y: 0, rotateY: 30, rotateX: 10 }}
                  whileHover={hasNext ? { 
                    scale: 1.2,
                    x: 10,
                    y: -5,
                    rotateY: 45,
                    rotateX: 15,
                    rotateZ: 5
                  } : {}}
                  whileTap={hasNext ? { 
                    scale: 0.9,
                    x: 15,
                    y: 2,
                    rotateY: 50,
                    rotateX: 20
                  } : {}}
                  animate={{
                    y: [0, -8, 0, -4, 0],
                    x: [20, 15, 20, 18, 20],
                    rotateY: [30, 35, 30, 32, 30],
                    rotateX: [10, 15, 10, 12, 10],
                    rotateZ: [0, 3, 0, 1, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: [0.4, 0, 0.6, 1],
                    times: [0, 0.2, 0.5, 0.8, 1]
                  }}
                  style={{
                    transformStyle: 'preserve-3d',
                    filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.4))',
                    perspective: '1000px'
                  }}
                >
                  <motion.div
                    className="relative"
                    animate={{
                      rotateZ: [0, 2, -2, 1, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.8
                    }}
                  >
                    <div 
                      className="text-7xl select-none"
                      style={{ 
                        textShadow: '4px 4px 8px rgba(0,0,0,0.5), 2px 2px 4px rgba(255,255,255,0.1)',
                        filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))',
                        background: 'linear-gradient(145deg, #FDB863, #F59E0B, #D97706)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      🫴
                    </div>
                    {/* Glow effect */}
                    <div className="absolute inset-0 text-7xl opacity-30 blur-sm">
                      🫴
                    </div>
                  </motion.div>
                </motion.div>
              </>
            )}

            {/* Decorative corner elements */}
            <div className="absolute top-4 left-4 w-6 h-6 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full shadow-lg"></div>
            <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full shadow-lg"></div>
            <div className="absolute bottom-4 left-4 w-6 h-6 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full shadow-lg"></div>
            <div className="absolute bottom-4 right-4 w-6 h-6 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full shadow-lg"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductBinder;