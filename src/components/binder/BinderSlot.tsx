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
      <div className="group relative w-full h-full aspect-[2.5/3.5] min-h-[50px] max-w-[70px] sm:max-w-[85px] md:max-w-[100px] lg:max-w-[120px] xl:max-w-[140px] rounded-lg overflow-hidden transition-all duration-300">
        {/* Card Image Container - matches product card structure exactly */}
        <div className="relative w-full h-full rounded-lg">
          {/* Create an invisible image with object-contain to get exact sizing, then overlay the border */}
          <div className="relative w-full h-full">
            {/* Invisible placeholder that mimics object-contain behavior */}
            <div className="w-full h-full object-contain p-1 flex items-center justify-center">
              <div className="aspect-[2.5/3.5] max-w-full max-h-full relative">
                {/* Dashed border overlay */}
                <div className="absolute inset-0 border-2 border-dashed border-gray-400/30 rounded-sm flex items-center justify-center">
                  <span className="text-xs text-gray-500/50 font-medium">Empty</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.stock);
  const rarityColor = getRarityColor(product.rarity);

  return (
    <div 
      className="group relative w-full h-full aspect-[2.5/3.5] min-h-[50px] max-w-[70px] sm:max-w-[85px] md:max-w-[100px] lg:max-w-[120px] xl:max-w-[140px] cursor-pointer rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-105"
      onClick={handleCardClick}
    >
      {/* Card Image */}
      <div className="relative w-full h-full rounded-lg">
        {!imageLoaded && !imageError && (
          <div className="w-full h-full flex items-center justify-center rounded-lg">
            <span className="text-gray-400 text-xs">Loading...</span>
          </div>
        )}
        
        <img
          src={product.image}
          alt={product.title}
          className={`w-full h-full object-contain p-1 ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-all duration-300 group-hover:brightness-75 group-hover:contrast-110`}
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
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-1 sm:p-2">
            <div className="text-sm sm:text-lg font-bold mb-1">🎴</div>
            <div className="text-xs sm:text-xs font-semibold text-center leading-tight">
              {product.title}
            </div>
            <div className="text-xs text-gray-500 mt-1">
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
        <div className="absolute inset-0 transition-all duration-300 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100">
          <div className="text-center p-0.5 sm:p-1 md:p-1.5 space-y-0.5 sm:space-y-1">
            {/* Product Name */}
            <h3 className="text-gray-800 font-bold text-xs sm:text-xs leading-tight line-clamp-2">
              {product.title}
            </h3>
            
            {/* Price */}
            <div className="text-orange-600 font-bold text-xs sm:text-sm">
              {formatCurrency(product.price)}
            </div>
            
            {/* Rarity */}
            <div className="text-gray-600 text-xs">
              {product.rarity}
            </div>
            
            {/* Stock Status */}
            <div className={`text-xs font-medium ${stockStatus.color}`}>
              {stockStatus.label}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-0.5 sm:gap-1 mt-1 sm:mt-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick();
                }}
                className="flex items-center gap-0.5 bg-blue-600 hover:bg-blue-700 text-white px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-md text-xs font-medium transition-colors"
              >
                <Eye className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                <span className="hidden sm:inline">View</span>
              </button>
              
              <button
                onClick={handleAddToCart}
                disabled={stockStatus.label === 'Out of Stock'}
                className="flex items-center gap-0.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-md text-xs font-medium transition-colors"
              >
                <ShoppingCart className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Quick Price Badge (visible when not hovering) */}
        <div className="absolute top-0.5 sm:top-1 left-0.5 sm:left-1 bg-black/80 text-white px-1 sm:px-1.5 py-0.5 sm:py-0.5 rounded-md text-xs font-bold group-hover:opacity-0 transition-opacity">
          {formatCurrency(product.price)}
        </div>
        
        {/* Rarity Badge */}
        <div className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1 bg-purple-600/90 text-white px-1 sm:px-1.5 py-0.5 sm:py-0.5 rounded-md text-xs font-medium group-hover:opacity-0 transition-opacity">
          {product.rarity?.split(' ')[0] || 'Common'}
        </div>
      </div>
    </div>
  );
};

export default BinderSlot;
