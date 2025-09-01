import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Star, Plus, Minus, Shield, Truck } from 'lucide-react';
import { useProductStore } from '../../store/useProducts';
import { useCartStore } from '../../store/useCart';
import { Button } from '../../components/ui/Button';
import ProductBinder from '../../components/binder/ProductBinder';
import type { Product } from '../../lib/types';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products } = useProductStore();
  const { addItem } = useCartStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (id) {
      const foundProduct = products.find(p => p.id === id);
      setProduct(foundProduct || null);
    }
  }, [id, products]);

  // Handle product navigation from binder
  const handleProductChange = (newProduct: Product) => {
    navigate(`/product/${newProduct.id}`);
    // Scroll to top on mobile after navigation
    setTimeout(() => {
      if (window.innerWidth < 768) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  // Get products from the same category for navigation
  const relatedProducts = product ? products.filter(p => p.categoryId === product.categoryId) : [];

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Product not found</div>
          <Button onClick={() => {
            navigate('/products');
            // Scroll to top on mobile when going back
            setTimeout(() => {
              if (window.innerWidth < 768) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }, 100);
          }}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  // Create image gallery (for now we'll use the same image multiple times to simulate a gallery)
  const productImages = [
    product.image,
    product.image, // In a real app, you'd have multiple product images
    product.image,
  ];

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product.id);
    }
    // You could add a toast notification here
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-slate-600';
      case 'Rare': return 'text-blue-600';
      case 'Super Rare': return 'text-purple-600';
      case 'Ultra Rare': return 'text-orange-600';
      case 'Secret Rare': return 'text-yellow-600';
      case 'Rare Holo': return 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent';
      default: return 'text-slate-600';
    }
  };

  // Create product content to be displayed inside the binder
  const productContent = (
    <div className="p-4 space-y-4 h-full overflow-auto">
      {/* Product Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h1 className="text-lg font-bold text-slate-800 mb-1">{product.title}</h1>
          <div className={`text-sm font-medium ${getRarityColor(product.rarity || '')}`}>
            {product.rarity}
          </div>
        </div>
        <div className="text-xl font-bold text-green-600">
          ${product.price}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 h-full">
        {/* Column 1: Main Product Image */}
        <div className="space-y-3">
          <div className="aspect-square rounded-lg overflow-hidden bg-white border border-slate-300 shadow-md">
            <img
              src={productImages[selectedImageIndex]}
              alt={product.title}
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/200x200/1e293b/64748b?text=Card+Image';
              }}
            />
          </div>
          
          {/* Thumbnail Gallery */}
          <div className="flex space-x-1">
            {productImages.slice(0, 3).map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`w-12 h-12 rounded border overflow-hidden ${
                  selectedImageIndex === index ? 'border-blue-500 border-2' : 'border-slate-300'
                }`}
              >
                <img
                  src={image}
                  alt={`${product.title} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-slate-400'}`}
              />
            ))}
            <span className="text-slate-600 text-xs ml-1">(4.5)</span>
          </div>
        </div>

        {/* Column 2: Product Details */}
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-2">Description</h3>
            <p className="text-slate-700 text-xs leading-relaxed">
              {product.description}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-2">Details</h3>
            <div className="space-y-1 text-xs text-slate-600">
              <div><span className="font-medium">SKU:</span> {product.sku}</div>
              <div><span className="font-medium">Category:</span> {product.categoryId}</div>
              <div><span className="font-medium">Tags:</span> {product.tags.join(', ')}</div>
            </div>
          </div>

          {/* Stock Status */}
          <div className="text-xs">
            {product.stock > 0 ? (
              <span className="text-green-600 font-medium">✓ {product.stock} in stock</span>
            ) : (
              <span className="text-red-600 font-medium">✗ Out of stock</span>
            )}
          </div>

          {/* Features */}
          <div className="pt-2 border-t border-slate-200">
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex items-center">
                <Shield className="w-3 h-3 mr-1" />
                Authentic Guarantee
              </div>
              <div className="flex items-center">
                <Truck className="w-3 h-3 mr-1" />
                Free shipping over $50
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Purchase Options */}
        <div className="space-y-4">
          {/* Quantity Selector */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-2">Quantity</h3>
            <div className="flex items-center border border-slate-300 rounded">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="px-2 py-1 text-slate-800 font-medium text-sm min-w-[2rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock}
                className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full text-xs py-2 flex items-center justify-center space-x-1"
            >
              <ShoppingCart className="w-3 h-3" />
              <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
            </Button>

            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`w-full py-2 px-3 border rounded text-xs transition-colors ${
                isWishlisted
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'border-slate-300 text-slate-600 hover:text-slate-800 hover:border-slate-400'
              }`}
            >
              <Heart className={`w-3 h-3 inline mr-1 ${isWishlisted ? 'fill-current' : ''}`} />
              {isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
            </button>
          </div>

          {/* Total Price */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">Total:</span>
              <span className="text-lg font-bold text-green-600">
                ${(product.price * quantity).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Back Button */}
      <div className="p-4">
        <Button
          onClick={() => {
            navigate('/products');
            // Scroll to top on mobile when going back
            setTimeout(() => {
              if (window.innerWidth < 768) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }, 100);
          }}
          variant="secondary"
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Button>
      </div>

      {/* Product Binder */}
      <div className="container mx-auto px-4 pb-8">
        <ProductBinder 
          product={product}
          allProducts={relatedProducts}
          onProductChange={handleProductChange}
          productContent={productContent}
        />
      </div>
    </div>
  );
};

export default ProductDetail;
