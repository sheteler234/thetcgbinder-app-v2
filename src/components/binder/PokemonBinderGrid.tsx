import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BinderSlot from './BinderSlot';
import type { Product } from '../../lib/types';

interface PokemonBinderGridProps {
  products?: Product[];
  externalCurrentPage?: number;
  externalTotalPages?: number;
  onPageChange: (page: number) => void;
}

const PokemonBinderGrid: React.FC<PokemonBinderGridProps> = ({ 
  products = [], 
  externalCurrentPage = 0, 
  externalTotalPages = 3,
  onPageChange 
}) => {
  const [currentPage, setCurrentPage] = useState(externalCurrentPage);
  const [direction, setDirection] = useState(0);
  const [showLeftPage, setShowLeftPage] = useState(false);
  const [leftPageIndex, setLeftPageIndex] = useState<number | null>(null);

  useEffect(() => {
    setCurrentPage(externalCurrentPage);
  }, [externalCurrentPage]);

  const displayProducts = products;

  // Split products into pages of 9
  const pagesData: Product[][] = [];
  for (let i = 0; i < displayProducts.length; i += 9) {
    pagesData.push(displayProducts.slice(i, i + 9));
  }

  // Ensure we have at least the number of pages specified (excluding welcome page)
  while (pagesData.length < externalTotalPages - 1) {
    pagesData.push([]);
  }

  // Total pages including welcome page
  const totalPages = pagesData.length + 1;

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setDirection(1);
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      
      // Set up the left page
      setLeftPageIndex(currentPage);
      setShowLeftPage(true);
      
      onPageChange?.(newPage);
      
      // Reset direction after animation
      setTimeout(() => setDirection(0), 1500);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setDirection(-1);
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      
      // Clear left page when going back
      if (newPage === 0) {
        setShowLeftPage(false);
        setLeftPageIndex(null);
      } else {
        setLeftPageIndex(newPage - 1);
        setShowLeftPage(true);
      }
      
      onPageChange?.(newPage);
      
      // Reset direction after animation
      setTimeout(() => setDirection(0), 1500);
    }
  };

  const goToPage = (pageIndex: number) => {
    if (pageIndex !== currentPage && pageIndex >= 0 && pageIndex < totalPages) {
      setDirection(pageIndex > currentPage ? 1 : -1);
      setCurrentPage(pageIndex);
      
      // Set up the left page
      if (pageIndex === 0) {
        setShowLeftPage(false);
        setLeftPageIndex(null);
      } else {
        setLeftPageIndex(pageIndex - 1);
        setShowLeftPage(true);
      }
      
      onPageChange?.(pageIndex);
      
      // Reset direction after animation
      setTimeout(() => setDirection(0), 1500);
    }
  };

  const renderGrid = (products: Product[]) => (
    <div className="grid grid-cols-3 gap-6 h-full p-6 place-items-center">
      {[...Array(9)].map((_, index) => (
        <BinderSlot
          key={index}
          product={products[index]}
          index={index}
        />
      ))}
    </div>
  );

  const renderEmptyGrid = () => (
    <div className="grid grid-cols-3 gap-6 h-full p-6 place-items-center">
      {[...Array(9)].map((_, index) => (
        <BinderSlot
          key={index}
          index={index}
        />
      ))}
    </div>
  );

  const renderWelcomePage = () => (
    <div className="h-full p-6 flex flex-col items-center justify-center text-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
      <div className="max-w-md mx-auto space-y-6">
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-4">
          Welcome to Your
        </h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-purple-800 mb-6">
          Pokémon Card Binder
        </h2>
        
        <p className="text-blue-700 text-lg leading-relaxed mb-8">
          Discover and collect your favorite Pokémon trading cards. 
          Each page holds up to 9 cards in protective slots.
        </p>
        
        <div className="flex items-center justify-center space-x-2 text-blue-600">
          <span className="text-sm">Swipe or click</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-sm">to start browsing</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative overflow-visible">
      {/* Main binder container - Pokemon themed */}
      <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 p-4 sm:p-6 md:p-8 lg:p-12 rounded-lg shadow-2xl border-4 border-yellow-500" style={{ overflow: 'visible' }}>
        
        {/* Yugi Character - Standing above the Blue Binder */}
        <div className="absolute -top-32 sm:-top-40 md:-top-48 lg:-top-56 right-2 sm:right-4 md:right-6 lg:right-8 z-20 pointer-events-none">
          <motion.img
            src="/yugi-character.png"
            alt="Yugi Muto"
            className="w-24 h-32 sm:w-32 sm:h-40 md:w-40 md:h-52 lg:w-48 lg:h-64 object-contain drop-shadow-xl"
            initial={{ opacity: 0, y: -30, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: 1,
              rotate: [0, 1, -1, 0],
            }}
            transition={{ 
              duration: 0.8,
              rotate: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            onError={(e) => {
              // Fallback to a placeholder if image doesn't load
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDE5MiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxOTIiIGhlaWdodD0iMjU2IiBmaWxsPSIjRkY2QjAwIiByeD0iOCIvPgo8dGV4dCB4PSI5NiIgeT0iMTI4IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9IjAuM2VtIj5ZVUdJPC90ZXh0Pgo8L3N2Zz4=';
            }}
          />
          
          {/* Enhanced glow effect for bigger image */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-yellow-400/15 to-blue-500/15 rounded-full blur-xl -z-10"
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
              className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 border-2 sm:border-3 md:border-4 border-blue-400 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 shadow-inner"
              style={{
                transform: 'perspective(100px) rotateX(45deg)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)'
              }}
            />
          ))}
        </div>

        {/* Page content area */}
        <div className="ml-4 sm:ml-6 md:ml-8 lg:ml-12 mt-4 sm:mt-6 md:mt-8 rounded shadow-lg relative" style={{ aspectRatio: '8.5/11', overflow: 'visible' }}>
          {/* Turned Page - Positioned to the left with exact same dimensions */}
          <AnimatePresence>
            {showLeftPage && leftPageIndex !== null && currentPage > 0 && (
              <motion.div
                key={`left-page-${leftPageIndex}`}
                initial={{ x: '0%', rotateY: 0 }}
                animate={{ 
                  x: window.innerWidth >= 768 && window.innerWidth < 1024 ? '-20%' : '-10%', 
                  rotateY: -15 
                }}
                exit={{ x: '-30%', rotateY: -25, opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="absolute rounded shadow-lg"
                style={{
                  right: 'calc(100% - 4rem)',
                  top: '0',
                  left: 'calc(-100% + 5rem)',
                  bottom: '0',
                  zIndex: 15,
                  transformOrigin: 'right center',
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden'
                }}
              >
                <div className="p-4 h-full binder-page-black">
                  {renderEmptyGrid()}
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

          {/* Current page */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`page-${currentPage}`}
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
              className="p-4 h-full binder-page-black relative"
              style={{ 
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                zIndex: direction !== 0 ? 50 : 5
              }}
            >
              {currentPage === 0 ? renderWelcomePage() : renderGrid(pagesData[currentPage - 1] || [])}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation - aligned with the white page content */}
        <div className="mt-6 sm:mt-8 md:mt-10 lg:mt-14 flex justify-between items-center">
          {/* Page navigation controls - aligned with left edge of white page */}
          <div className="ml-4 sm:ml-6 md:ml-8 lg:ml-12 flex items-center gap-2 sm:gap-3 md:gap-4">
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className="p-1 sm:p-1.5 md:p-2 bg-blue-600 text-white rounded-full disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Page dots - perfectly aligned with card grid */}
            <div className="flex space-x-1 sm:space-x-1.5 md:space-x-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToPage(index)}
                  className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full transition-colors ${
                    index === currentPage ? 'bg-blue-500' : 'bg-blue-200 hover:bg-blue-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              className="p-1 sm:p-1.5 md:p-2 bg-blue-600 text-white rounded-full disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Page indicator - aligned with right edge of white page */}
          <div className="text-blue-200 font-medium text-xs sm:text-sm md:text-base">
            {currentPage + 1} of {totalPages}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonBinderGrid;
