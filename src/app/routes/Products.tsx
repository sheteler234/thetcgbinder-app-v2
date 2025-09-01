import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Grid3X3, 
  List, 
  SortAsc, 
  SortDesc,
  ShoppingCart,
  Heart,
  Star
} from 'lucide-react';
import { useProductStore } from '../../store/useProducts';
import { useCartStore } from '../../store/useCart';
import { categories } from '../../data/seed';
import { Button } from '../../components/ui/Button';
import type { Product } from '../../lib/types';

const Products: React.FC = () => {
  const { products } = useProductStore();
  const { addItem } = useCartStore();
  
  // State for filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState<'title' | 'price' | 'createdAt'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Get unique rarities from products
  const availableRarities = useMemo(() => {
    const rarities = products
      .map(p => p.rarity)
      .filter((rarity): rarity is string => Boolean(rarity));
    return [...new Set(rarities)];
  }, [products]);

  // Get price range for slider
  const priceMinMax = useMemo(() => {
    const prices = products.map(p => p.price);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices))
    };
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const filtered = products.filter(product => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          product.title.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.tags.some(tag => tag.toLowerCase().includes(query)) ||
          product.sku.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategory && product.categoryId !== selectedCategory) {
        return false;
      }

      // Rarity filter
      if (selectedRarity && product.rarity !== selectedRarity) {
        return false;
      }

      // Price range filter
      if (priceRange.min && product.price < parseFloat(priceRange.min)) {
        return false;
      }
      if (priceRange.max && product.price > parseFloat(priceRange.max)) {
        return false;
      }

      return true;
    });

    // Sort products
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [products, searchQuery, selectedCategory, selectedRarity, priceRange, sortBy, sortOrder]);

  const handleAddToCart = (product: Product) => {
    addItem(product.id);
    // You could add a toast notification here
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedRarity('');
    setPriceRange({ min: '', max: '' });
    setSortBy('title');
    setSortOrder('asc');
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-slate-400';
      case 'Rare': return 'text-blue-400';
      case 'Super Rare': return 'text-purple-400';
      case 'Ultra Rare': return 'text-orange-400';
      case 'Secret Rare': return 'text-yellow-400';
      case 'Rare Holo': return 'text-rainbow bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
              <p className="text-slate-400">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>

            {/* Search and View Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full sm:w-64"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex border border-slate-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'} transition-colors`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'} transition-colors`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto pr-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-72 space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Clear All
                </button>
              </div>

              {/* Sort Options */}
              <div className="space-y-3 mb-6">
                <label className="block text-sm font-medium text-slate-300">Sort By</label>
                <div className="flex space-x-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'title' | 'price' | 'createdAt')}
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="title">Name</option>
                    <option value="price">Price</option>
                    <option value="createdAt">Date Added</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-400 hover:text-white transition-colors"
                  >
                    {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-3 mb-6">
                <label className="block text-sm font-medium text-slate-300">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rarity Filter */}
              <div className="space-y-3 mb-6">
                <label className="block text-sm font-medium text-slate-300">Rarity</label>
                <select
                  value={selectedRarity}
                  onChange={(e) => setSelectedRarity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">All Rarities</option>
                  {availableRarities.map(rarity => (
                    <option key={rarity} value={rarity}>
                      {rarity}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-3 mb-6">
                <label className="block text-sm font-medium text-slate-300">Price Range</label>
                <div className="flex space-x-2 w-full">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="w-1/2 px-2 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="w-1/2 px-2 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Min: ${priceMinMax.min}</span>
                  <span>Max: ${priceMinMax.max}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-slate-400 text-lg mb-2">No products found</div>
                <p className="text-slate-500">Try adjusting your filters or search query</p>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }>
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={
                      viewMode === 'grid'
                        ? 'bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden hover:border-red-500/50 transition-all duration-300 group'
                        : 'bg-slate-800/50 rounded-lg border border-slate-700 p-4 flex items-center space-x-4 hover:border-red-500/50 transition-all duration-300'
                    }
                  >
                    {viewMode === 'grid' ? (
                      // Grid View
                      <>
                        <div className="relative aspect-square overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/300x300/1e293b/64748b?text=Card+Image';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                          
                          {/* Wishlist Button */}
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                          >
                            <Heart 
                              className={`w-4 h-4 ${
                                wishlist.includes(product.id) 
                                  ? 'text-red-500 fill-current' 
                                  : 'text-white'
                              }`} 
                            />
                          </button>

                          {/* Stock Badge */}
                          {product.stock <= 5 && (
                            <div className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white text-xs rounded">
                              {product.stock === 0 ? 'Out of Stock' : `Only ${product.stock} left`}
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
                            {product.title}
                          </h3>
                          
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm font-medium ${getRarityColor(product.rarity || '')}`}>
                              {product.rarity}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-slate-400">4.5</span>
                            </div>
                          </div>

                          <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                            {product.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-green-400">
                              ${product.price}
                            </span>
                            <Button
                              onClick={() => handleAddToCart(product)}
                              disabled={product.stock === 0}
                              className="flex items-center space-x-1 px-3 py-1 text-sm"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              <span>{product.stock === 0 ? 'Sold Out' : 'Add to Cart'}</span>
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      // List View
                      <>
                        <div className="w-20 h-20 flex-shrink-0">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-full object-cover rounded border border-slate-600"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/80x80/1e293b/64748b?text=Card';
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white mb-1 truncate">
                            {product.title}
                          </h3>
                          
                          <div className="flex items-center space-x-4 mb-2">
                            <span className={`text-sm ${getRarityColor(product.rarity || '')}`}>
                              {product.rarity}
                            </span>
                            <span className="text-sm text-slate-400">
                              Stock: {product.stock}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-slate-400">4.5</span>
                            </div>
                          </div>

                          <p className="text-slate-400 text-sm line-clamp-2">
                            {product.description}
                          </p>
                        </div>

                        <div className="flex flex-col items-end space-y-2">
                          <span className="text-xl font-bold text-green-400">
                            ${product.price}
                          </span>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleWishlist(product.id)}
                              className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                            >
                              <Heart 
                                className={`w-4 h-4 ${
                                  wishlist.includes(product.id) 
                                    ? 'text-red-500 fill-current' 
                                    : ''
                                }`} 
                              />
                            </button>
                            
                            <Button
                              onClick={() => handleAddToCart(product)}
                              disabled={product.stock === 0}
                              className="flex items-center space-x-1 px-3 py-1 text-sm"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              <span>{product.stock === 0 ? 'Sold Out' : 'Add'}</span>
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
