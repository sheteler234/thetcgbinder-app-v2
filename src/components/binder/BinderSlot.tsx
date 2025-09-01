import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import type { Product } from '../../lib/types';
import { formatCurrency, getRarityColor, getStockStatus } from '../../lib/format';
import { useCartStore } from '../../store/useCart';

interface BinderSlotProps {
  product?: Product;
  index: number;
}

const BinderSlot: React.FC<BinderSlotProps> = ({ product }) => {
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleCardClick = () => {
    if (product) {
      navigate(`/product/${product.id}`);
      // Scroll to top on mobile after navigation
      setTimeout(() => {
        if (window.innerWidth < 768) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product) {
      addItem(product.id);
    }
  };

  if (!product) {
    return (
      <div className="relative w-full h-full aspect-[2.5/3.5] min-h-[80px] max-w-[120px] sm:max-w-[150px] md:max-w-[180px] lg:max-w-[200px] rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800 flex items-center justify-center">
        <span className="text-xs text-gray-400 font-medium">Empty Slot</span>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.stock);
  const rarityColor = getRarityColor(product.rarity);

  return (
    <div 
      className="group relative w-full h-full aspect-[2.5/3.5] min-h-[80px] max-w-[120px] sm:max-w-[150px] md:max-w-[180px] lg:max-w-[200px] cursor-pointer rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      onClick={handleCardClick}
    >
      {/* Card Image */}
      <div className="relative w-full h-full bg-gradient-to-br from-blue-900 to-purple-900">
        {!imageLoaded && !imageError && (
          <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
            <span className="text-gray-400 text-xs">Loading...</span>
          </div>
        )}
        <img
          src={product.image}
          alt={product.title}
          className={`w-full h-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onError={() => {
            console.log('Image failed to load:', product.image);
            setImageError(true);
            setImageLoaded(true); // Show the fallback
          }}
          onLoad={() => {
            console.log('Image loaded successfully:', product.image);
            setImageLoaded(true);
            setImageError(false);
          }}
        />
        
        {/* Fallback content when image fails */}
        {imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-800 to-amber-900 flex flex-col items-center justify-center text-white p-1 sm:p-2">
            <div className="text-sm sm:text-lg font-bold mb-1">🎴</div>
            <div className="text-xs sm:text-xs font-semibold text-center leading-tight">
              {product.title}
            </div>
            <div className="text-xs text-amber-200 mt-1">
              {product.rarity}
            </div>
          </div>
        )}
        
        {/* Rarity border */}
        <div 
          className={`absolute inset-0 border-3 ${rarityColor} rounded-lg`}
        />
        
        {/* Stock overlay */}
        {stockStatus.label === 'Out of Stock' && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="text-white text-xs font-bold bg-red-600 px-2 py-1 rounded">Out of Stock</span>
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/80 transition-all duration-300 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100">
          <div className="text-center p-1 sm:p-2 md:p-3 space-y-1 sm:space-y-2">
            {/* Product Name */}
            <h3 className="text-white font-bold text-xs sm:text-sm leading-tight line-clamp-2">
              {product.title}
            </h3>
            
            {/* Price */}
            <div className="text-yellow-400 font-bold text-sm sm:text-lg">
              {formatCurrency(product.price)}
            </div>
            
            {/* Rarity */}
            <div className="text-gray-300 text-xs">
              {product.rarity}
            </div>
            
            {/* Stock Status */}
            <div className={`text-xs font-medium ${stockStatus.color}`}>
              {stockStatus.label}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-1 sm:gap-2 mt-2 sm:mt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick();
                }}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs font-medium transition-colors"
              >
                <Eye className="w-2 h-2 sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">View</span>
              </button>
              
              <button
                onClick={handleAddToCart}
                disabled={stockStatus.label === 'Out of Stock'}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs font-medium transition-colors"
              >
                <ShoppingCart className="w-2 h-2 sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Quick Price Badge (visible when not hovering) */}
        <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-black/80 text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs font-bold group-hover:opacity-0 transition-opacity">
          {formatCurrency(product.price)}
        </div>
        
        {/* Rarity Badge */}
        <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-purple-600/90 text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs font-medium group-hover:opacity-0 transition-opacity">
          {product.rarity?.split(' ')[0] || 'Common'}
        </div>
      </div>
    </div>
  );
};

export default BinderSlot;
