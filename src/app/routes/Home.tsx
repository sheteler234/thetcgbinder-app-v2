import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import BinderPage from '../../components/binder/BinderPage';
import PokemonBinderPage from '../../components/binder/PokemonBinderPage';
import { useProductStore } from '../../store/useProducts';
import { useUiStore } from '../../store/useUi';

const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setCurrentPage } = useUiStore();
  const { products } = useProductStore();
  const [selectedBinder, setSelectedBinder] = useState<'yugioh' | 'pokemon'>('yugioh');

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const itemsPerPage = 9; // 9 products per page (3x3 grid)
  
  // Filter products based on selected binder
  const filteredProducts = selectedBinder === 'yugioh' 
    ? products.filter(p => p.categoryId === 'yugioh')
    : products.filter(p => p.categoryId === 'pokemon');
    
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Handle page changes
  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    
    // Update URL
    setSearchParams({ page: page.toString() });
  };

  // Get products for current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(currentPage);
  }, [currentPage, setCurrentPage]);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl md:text-6xl font-bold font-display bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
          Welcome to TheTCGBinder
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Discover rare and legendary trading cards from Yu-Gi-Oh! and Pokémon. 
          Browse our collection like a real card binder.
        </p>
        
        {/* Stats */}
        <div className="flex justify-center items-center space-x-8 mt-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">1000+</div>
            <div className="text-sm text-slate-400">Cards Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">24/7</div>
            <div className="text-sm text-slate-400">Customer Support</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">99%</div>
            <div className="text-sm text-slate-400">Satisfaction Rate</div>
          </div>
        </div>
      </motion.div>

      {/* Featured Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto"
      >
        <button
          onClick={() => {
            setSelectedBinder('yugioh');
            // Reset to first page (welcome page) when switching binders
            handlePageChange(1);
          }}
          className={`group relative overflow-hidden rounded-2xl p-6 border transition-all duration-300 text-left ${
            selectedBinder === 'yugioh'
              ? 'bg-gradient-to-br from-amber-500/30 to-yellow-600/30 border-amber-400/70 ring-2 ring-amber-400/50'
              : 'bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border-amber-500/30 hover:border-amber-400/50'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-amber-400 mb-2">Yu-Gi-Oh!</h3>
            <p className="text-slate-300 mb-4">
              Legendary monsters, powerful spells, and devious traps await in our Yu-Gi-Oh! collection.
            </p>
            <div className="text-sm text-amber-300">
              Featured: Blue-Eyes White Dragon, Dark Magician, Exodia
            </div>
            {selectedBinder === 'yugioh' && (
              <div className="mt-3 text-xs text-amber-200 font-medium">
                ✨ Currently viewing this collection
              </div>
            )}
          </div>
        </button>

        <button
          onClick={() => {
            setSelectedBinder('pokemon');
            // Reset to first page (welcome page) when switching binders
            handlePageChange(1);
          }}
          className={`group relative overflow-hidden rounded-2xl p-6 border transition-all duration-300 text-left ${
            selectedBinder === 'pokemon'
              ? 'bg-gradient-to-br from-blue-500/30 to-purple-600/30 border-blue-400/70 ring-2 ring-blue-400/50'
              : 'bg-gradient-to-br from-blue-500/20 to-purple-600/20 border-blue-500/30 hover:border-blue-400/50'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-blue-400 mb-2">Pokémon</h3>
            <p className="text-slate-300 mb-4">
              Catch rare and holographic Pokémon cards from base set classics to modern releases.
            </p>
            <div className="text-sm text-blue-300">
              Featured: Charizard, Pikachu, Mewtwo
            </div>
            {selectedBinder === 'pokemon' && (
              <div className="mt-3 text-xs text-blue-200 font-medium">
                ✨ Currently viewing this collection
              </div>
            )}
          </div>
        </button>
      </motion.div>

      {/* Binder Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            Browse Our {selectedBinder === 'yugioh' ? 'Yu-Gi-Oh!' : 'Pokémon'} Collection
          </h2>
          <p className="text-slate-400">
            Navigate through our {selectedBinder === 'yugioh' ? 'Yu-Gi-Oh!' : 'Pokémon'} cards just like flipping pages in a real binder
          </p>
        </div>

        {selectedBinder === 'yugioh' ? (
          <BinderPage
            products={currentProducts}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        ) : (
          <PokemonBinderPage
            products={currentProducts}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
      >
        <div className="text-center p-6 glass rounded-xl">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-xl">🔒</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Secure Shopping</h3>
          <p className="text-slate-400 text-sm">
            Your transactions are protected with industry-standard encryption
          </p>
        </div>

        <div className="text-center p-6 glass rounded-xl">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-xl">📦</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Fast Shipping</h3>
          <p className="text-slate-400 text-sm">
            Get your cards quickly with our expedited shipping options
          </p>
        </div>

        <div className="text-center p-6 glass rounded-xl">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-xl">✨</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Authentic Cards</h3>
          <p className="text-slate-400 text-sm">
            All cards are guaranteed authentic and in described condition
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
