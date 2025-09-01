import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu,
  Home,
  Package,
  Package2,
  Settings,
  LogOut,
  X,
  Plus,
  Edit,
  Trash2,
  Folder,
  FolderPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../store/useCart';
import { useAuthStore } from '../../store/useAuth';
import { useUiStore } from '../../store/useUi';
import { useProductStore } from '../../store/useProducts';
import type { Product, Category, Set } from '../../lib/types';
import { Button } from '../../components/ui/Button';
import { categories, sets } from '../../data/seed';

const Header: React.FC = () => {
  const location = useLocation();
  const cartCount = useCartStore(state => state.getCartCount());
  const { user, isAuthenticated, logout } = useAuthStore();
  const { 
    isMobileMenuOpen, 
    toggleMobileMenu, 
    closeMobileMenu,
    toggleCart,
    openSearch,
    toggleAdminMenu,
    toggleOrdersMenu
  } = useUiStore();
  const { products, updateProduct, deleteProduct } = useProductStore();

  // Local state for managing categories and sets
  const [managedCategories, setManagedCategories] = useState<Category[]>(categories);
  const [managedSets, setManagedSets] = useState<Set[]>(sets);

  // Local state for product management menu
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    price: '',
    categoryId: '',
    image: '',
    additionalImage1: '',
    additionalImage2: '',
    description: '',
    rarity: '',
    number: '',
    condition: 'NM' as 'NM' | 'LP' | 'MP' | 'HP' | 'DMG',
    stock: ''
  });

  // Local state for category management
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    parentId: '',
    description: '',
    image: ''
  });

  // Local state for sets management
  const [editingSet, setEditingSet] = useState<Set | null>(null);
  const [setForm, setSetForm] = useState({
    id: '',
    name: '',
    description: '',
    image: '',
    releaseDate: '',
    code: ''
  });

  // Search state for management sections
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [setSearchQuery, setSetSearchQuery] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Products', href: '/products', icon: Package },
  ];

  const handleLogout = async () => {
    await logout();
    closeMobileMenu();
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      title: product.title,
      price: product.price.toString(),
      categoryId: product.categoryId || '',
      image: product.image,
      additionalImage1: product.additionalImage1 || '',
      additionalImage2: product.additionalImage2 || '',
      description: product.description || '',
      rarity: product.rarity || '',
      number: product.number || '',
      condition: product.condition || 'NM',
      stock: product.stock.toString()
    });
  };

  const handleSaveEdit = () => {
    if (!editingProduct) return;
    
    // Update the product in the store
    updateProduct(editingProduct.id, {
      title: editForm.title,
      price: parseFloat(editForm.price),
      categoryId: editForm.categoryId,
      image: editForm.image,
      description: editForm.description,
      rarity: editForm.rarity,
      number: editForm.number,
      condition: editForm.condition,
      stock: parseInt(editForm.stock),
      additionalImage1: editForm.additionalImage1,
      additionalImage2: editForm.additionalImage2
    });
    
    // Reset edit state
    setEditingProduct(null);
    setEditForm({
      title: '',
      price: '',
      categoryId: '',
      image: '',
      additionalImage1: '',
      additionalImage2: '',
      description: '',
      rarity: '',
      number: '',
      condition: 'NM',
      stock: ''
    });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditForm({
      title: '',
      price: '',
      categoryId: '',
      image: '',
      additionalImage1: '',
      additionalImage2: '',
      description: '',
      rarity: '',
      number: '',
      condition: 'NM',
      stock: ''
    });
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      deleteProduct(productId);
      // If we're editing the product being deleted, cancel the edit
      if (editingProduct && editingProduct.id === productId) {
        handleCancelEdit();
      }
    }
  };

  // Category management handlers
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      id: category.id,
      name: category.name,
      parentId: category.parentId || '',
      description: category.description || '',
      image: category.image || ''
    });
  };

  const handleSaveCategoryEdit = () => {
    if (!editingCategory) return;
    
    console.log('Saving category:', categoryForm);
    
    if (editingCategory.id) {
      // Editing existing category
      setManagedCategories(prev => 
        prev.map(cat => 
          cat.id === editingCategory.id 
            ? { ...cat, ...categoryForm }
            : cat
        )
      );
    } else {
      // Adding new category
      if (!categoryForm.id || !categoryForm.name) {
        alert('Please fill in all required fields (ID and Name)');
        return;
      }
      // Check if ID already exists
      if (managedCategories.some(cat => cat.id === categoryForm.id)) {
        alert('A category with this ID already exists');
        return;
      }
      setManagedCategories(prev => [...prev, categoryForm as Category]);
    }
    
    // Reset edit state
    setEditingCategory(null);
    setCategoryForm({
      id: '',
      name: '',
      parentId: '',
      description: '',
      image: ''
    });
  };

  const handleCancelCategoryEdit = () => {
    setEditingCategory(null);
    setCategoryForm({
      id: '',
      name: '',
      parentId: '',
      description: '',
      image: ''
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      console.log('Deleting category:', categoryId);
      // Remove category from local state
      setManagedCategories(prev => prev.filter(cat => cat.id !== categoryId));
      // If we're editing the category being deleted, cancel the edit
      if (editingCategory && editingCategory.id === categoryId) {
        handleCancelCategoryEdit();
      }
    }
  };

  const handleAddNewCategory = () => {
    setCategoryForm({
      id: '',
      name: '',
      parentId: '',
      description: '',
      image: ''
    });
    setEditingCategory({} as Category); // Empty object to trigger form display
  };

  // Sets management handlers
  const handleEditSet = (set: Set) => {
    setEditingSet(set);
    setSetForm({
      id: set.id,
      name: set.name,
      description: set.description || '',
      image: set.image || '',
      releaseDate: set.releaseDate || '',
      code: set.code || ''
    });
  };

  const handleSaveSetEdit = () => {
    if (!editingSet) return;
    
    console.log('Saving set:', setForm);
    
    if (editingSet.id) {
      // Editing existing set
      setManagedSets(prev => 
        prev.map(set => 
          set.id === editingSet.id 
            ? { ...set, ...setForm }
            : set
        )
      );
    } else {
      // Adding new set
      if (!setForm.id || !setForm.name) {
        alert('Please fill in all required fields (ID and Name)');
        return;
      }
      // Check if ID already exists
      if (managedSets.some(set => set.id === setForm.id)) {
        alert('A set with this ID already exists');
        return;
      }
      setManagedSets(prev => [...prev, setForm as Set]);
    }
    
    // Reset edit state
    setEditingSet(null);
    setSetForm({
      id: '',
      name: '',
      description: '',
      image: '',
      releaseDate: '',
      code: ''
    });
  };

  const handleCancelSetEdit = () => {
    setEditingSet(null);
    setSetForm({
      id: '',
      name: '',
      description: '',
      image: '',
      releaseDate: '',
      code: ''
    });
  };

  const handleDeleteSet = (setId: string) => {
    if (window.confirm('Are you sure you want to delete this set? This action cannot be undone.')) {
      console.log('Deleting set:', setId);
      // Remove set from local state
      setManagedSets(prev => prev.filter(set => set.id !== setId));
      // If we're editing the set being deleted, cancel the edit
      if (editingSet && editingSet.id === setId) {
        handleCancelSetEdit();
      }
    }
  };

  const handleAddNewSet = () => {
    setSetForm({
      id: '',
      name: '',
      description: '',
      image: '',
      releaseDate: '',
      code: ''
    });
    setEditingSet({} as Set); // Empty object to trigger form display
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 text-xl font-bold text-white hover:text-red-400 transition-colors"
          >
            <div className="h-16 flex items-center justify-center">
              <img 
                src="/logo-white.png" 
                alt="TheTCGBinder Logo" 
                className="h-16 w-auto object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-red-400 bg-red-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <Button
              variant="ghost"
              size="sm"
              onClick={openSearch}
              className="hidden sm:flex"
            >
              <Search className="w-4 h-4" />
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCart}
              className="relative"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative group">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:block">{user?.name || user?.email}</span>
                </Button>
                
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 rounded-lg shadow-lg border border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-2">
                    {/* Role Display */}
                    {user?.role && (
                      <div className="px-3 py-2 text-xs text-slate-400 border-b border-slate-700 mb-1">
                        <span className="capitalize">{user.role}</span> Account
                      </div>
                    )}
                    
                    {/* Admin Link */}
                    {user?.role === 'admin' && (
                      <button
                        onClick={toggleAdminMenu}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Admin</span>
                      </button>
                    )}
                    
                    {/* Products Link */}
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => setIsProductMenuOpen(true)}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg"
                      >
                        <Package2 className="w-4 h-4" />
                        <span>Products</span>
                      </button>
                    )}
                    
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={toggleOrdersMenu}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg"
                    >
                      <Package className="w-4 h-4" />
                      <span>Orders</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/auth/login">
                <Button variant="primary" size="sm">
                  Login
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="md:hidden"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-slate-800 border-t border-slate-700 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-red-400 bg-red-500/10'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Mobile Search */}
              <button
                onClick={() => {
                  openSearch();
                  closeMobileMenu();
                }}
                className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <Search className="w-5 h-5" />
                <span>Search</span>
              </button>

              {!isAuthenticated && (
                <Link
                  to="/auth/login"
                  onClick={closeMobileMenu}
                  className="block w-full"
                >
                  <Button variant="primary" className="w-full">
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Management Side Menu */}
      <AnimatePresence>
        {isProductMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsProductMenuOpen(false)}
            />

            {/* Side Menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-20 h-[calc(100vh-5rem)] w-96 bg-slate-800 shadow-2xl z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <h2 className="text-xl font-semibold text-white">Product Management</h2>
                <button
                  onClick={() => setIsProductMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Add Product Button */}
              <div className="p-6 border-b border-slate-700">
                <button className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors">
                  <Plus className="w-5 h-5" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Category Management Section */}
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Categories</h3>
                  <button
                    onClick={handleAddNewCategory}
                    className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Category Form */}
                {editingCategory && (
                  <div className="mb-4 p-4 bg-slate-700/30 rounded-lg">
                    <h4 className="text-sm font-medium text-white mb-3">
                      {editingCategory.id ? 'Edit Category' : 'Add New Category'}
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">ID</label>
                        <input
                          type="text"
                          value={categoryForm.id}
                          onChange={(e) => setCategoryForm({ ...categoryForm, id: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="category-id"
                          disabled={!!editingCategory.id}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Name</label>
                        <input
                          type="text"
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Category name"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Parent Category</label>
                        <select
                          value={categoryForm.parentId}
                          onChange={(e) => setCategoryForm({ ...categoryForm, parentId: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">None (Top Level)</option>
                          {managedCategories.filter(cat => !cat.parentId && cat.id !== categoryForm.id).map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                        <textarea
                          value={categoryForm.description}
                          onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                          placeholder="Category description"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Image URL</label>
                        <input
                          type="url"
                          value={categoryForm.image}
                          onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="https://example.com/image.jpg"
                        />
                        {/* Image Preview */}
                        {categoryForm.image && (
                          <div className="mt-2">
                            <div className="w-16 h-16 border border-slate-600 rounded overflow-hidden">
                              <img
                                src={categoryForm.image}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className="hidden w-full h-full flex items-center justify-center bg-slate-700 text-slate-400 text-xs">
                                Invalid URL
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <button
                          onClick={handleSaveCategoryEdit}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelCategoryEdit}
                          className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Category Search */}
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearchQuery}
                    onChange={(e) => setCategorySearchQuery(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Categories List */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {managedCategories
                    .filter(category => 
                      category.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
                      category.description?.toLowerCase().includes(categorySearchQuery.toLowerCase())
                    )
                    .map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 bg-slate-700/50 rounded hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {/* Category Image */}
                        <div className="w-10 h-10 flex-shrink-0">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-full h-full object-cover rounded border border-slate-600"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full flex items-center justify-center bg-slate-600 rounded border border-slate-500 ${category.image ? 'hidden' : ''}`}>
                            <Folder className="w-5 h-5 text-slate-400" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-white text-sm font-medium truncate">{category.name}</h4>
                            {category.parentId && (
                              <span className="text-xs text-slate-400 bg-slate-600 px-2 py-1 rounded">
                                {managedCategories.find(c => c.id === category.parentId)?.name}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-400 text-xs truncate">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => handleEditCategory(category)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-600 rounded transition-colors"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sets Management Section */}
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Sets</h3>
                  <button
                    onClick={handleAddNewSet}
                    className="flex items-center space-x-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Set Form */}
                {editingSet && (
                  <div className="mb-4 p-4 bg-slate-700/30 rounded-lg">
                    <h4 className="text-sm font-medium text-white mb-3">
                      {editingSet.id ? 'Edit Set' : 'Add New Set'}
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">ID</label>
                        <input
                          type="text"
                          value={setForm.id}
                          onChange={(e) => setSetForm({ ...setForm, id: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          placeholder="set-id"
                          disabled={!!editingSet.id}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Name</label>
                        <input
                          type="text"
                          value={setForm.name}
                          onChange={(e) => setSetForm({ ...setForm, name: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          placeholder="Set name"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Code</label>
                        <input
                          type="text"
                          value={setForm.code}
                          onChange={(e) => setSetForm({ ...setForm, code: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          placeholder="SET"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Release Date</label>
                        <input
                          type="date"
                          value={setForm.releaseDate}
                          onChange={(e) => setSetForm({ ...setForm, releaseDate: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                        <textarea
                          value={setForm.description}
                          onChange={(e) => setSetForm({ ...setForm, description: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                          placeholder="Set description"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Image URL</label>
                        <input
                          type="url"
                          value={setForm.image}
                          onChange={(e) => setSetForm({ ...setForm, image: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          placeholder="https://example.com/image.jpg"
                        />
                        {/* Image Preview */}
                        {setForm.image && (
                          <div className="mt-2">
                            <div className="w-16 h-16 border border-slate-600 rounded overflow-hidden">
                              <img
                                src={setForm.image}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className="hidden w-full h-full flex items-center justify-center bg-slate-700 text-slate-400 text-xs">
                                Invalid URL
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <button
                          onClick={handleSaveSetEdit}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelSetEdit}
                          className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Set Search */}
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Search sets..."
                    value={setSearchQuery}
                    onChange={(e) => setSetSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                {/* Sets List */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {managedSets
                    .filter(set => 
                      set.name.toLowerCase().includes(setSearchQuery.toLowerCase()) ||
                      set.description?.toLowerCase().includes(setSearchQuery.toLowerCase()) ||
                      set.code?.toLowerCase().includes(setSearchQuery.toLowerCase())
                    )
                    .map((set) => (
                    <div
                      key={set.id}
                      className="flex items-center justify-between p-3 bg-slate-700/50 rounded hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {/* Set Image */}
                        <div className="w-10 h-10 flex-shrink-0">
                          {set.image ? (
                            <img
                              src={set.image}
                              alt={set.name}
                              className="w-full h-full object-cover rounded border border-slate-600"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full flex items-center justify-center bg-slate-600 rounded border border-slate-500 ${set.image ? 'hidden' : ''}`}>
                            <Package2 className="w-5 h-5 text-slate-400" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-white text-sm font-medium truncate">{set.name}</h4>
                            {set.code && (
                              <span className="text-xs text-slate-400 bg-slate-600 px-2 py-1 rounded">
                                {set.code}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <p className="text-slate-400 text-xs truncate">{set.description}</p>
                            {set.releaseDate && (
                              <span className="text-xs text-slate-500">
                                {new Date(set.releaseDate).getFullYear()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => handleEditSet(set)}
                          className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-slate-600 rounded transition-colors"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => handleDeleteSet(set.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edit Product Form */}
              {editingProduct && (
                <div className="p-6 border-b border-slate-700 bg-slate-700/30">
                  <h3 className="text-lg font-medium text-white mb-4">Edit Product</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Product title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Category ID</label>
                      <input
                        type="text"
                        value={editForm.categoryId}
                        onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Category ID"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Rarity</label>
                      <select
                        value={editForm.rarity}
                        onChange={(e) => setEditForm({ ...editForm, rarity: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">Select rarity</option>
                        <option value="Common">Common</option>
                        <option value="Rare">Rare</option>
                        <option value="Super Rare">Super Rare</option>
                        <option value="Ultra Rare">Ultra Rare</option>
                        <option value="Secret Rare">Secret Rare</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Number</label>
                      <input
                        type="text"
                        value={editForm.number}
                        onChange={(e) => setEditForm({ ...editForm, number: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Card number (e.g., 001/164)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Condition</label>
                      <select
                        value={editForm.condition}
                        onChange={(e) => setEditForm({ ...editForm, condition: e.target.value as 'NM' | 'LP' | 'MP' | 'HP' | 'DMG' })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="NM">NM - Near Mint</option>
                        <option value="LP">LP - Lightly Played</option>
                        <option value="MP">MP - Moderately Played</option>
                        <option value="HP">HP - Heavily Played</option>
                        <option value="DMG">DMG - Damaged</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Stock</label>
                      <input
                        type="number"
                        value={editForm.stock}
                        onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Stock quantity"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Image URL</label>
                      <input
                        type="url"
                        value={editForm.image}
                        onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Additional Image 1 URL</label>
                      <input
                        type="url"
                        value={editForm.additionalImage1}
                        onChange={(e) => setEditForm({ ...editForm, additionalImage1: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="https://example.com/additional-image-1.jpg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Additional Image 2 URL</label>
                      <input
                        type="url"
                        value={editForm.additionalImage2}
                        onChange={(e) => setEditForm({ ...editForm, additionalImage2: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="https://example.com/additional-image-2.jpg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        placeholder="Product description"
                      />
                    </div>

                    <div className="flex space-x-3 pt-2">
                      <button
                        onClick={handleSaveEdit}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Products List */}
              <div className="p-6">
                <h3 className="text-lg font-medium text-white mb-4">Products</h3>
                
                {/* Product Search */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div className="space-y-3">
                  {products
                    .filter(product => 
                      product.title.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                      product.description.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                      product.sku.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                      product.rarity?.toLowerCase().includes(productSearchQuery.toLowerCase())
                    )
                    .map((product: Product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-12 h-16 object-cover rounded border border-slate-600"
                        />
                        <div>
                          <h4 className="text-white font-medium text-sm">{product.title}</h4>
                          <p className="text-slate-400 text-xs">{product.rarity}</p>
                          <p className="text-green-400 text-sm font-medium">${product.price}</p>
                          <p className="text-slate-500 text-xs">
                            Added: {new Date(product.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-600 rounded transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
