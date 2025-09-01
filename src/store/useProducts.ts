import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../lib/types';
import { products as initialProducts } from '../data/seed';

interface ProductState {
  products: Product[];
  updateProduct: (id: string, updates: Partial<Product>) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (categoryId: string) => Product[];
  searchProducts: (query: string) => Product[];
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: initialProducts,

      updateProduct: (id: string, updates: Partial<Product>) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id
              ? { 
                  ...product, 
                  ...updates,
                  updatedAt: new Date().toISOString()
                }
              : product
          ),
        })),

      addProduct: (newProduct: Omit<Product, 'id'>) =>
        set((state) => {
          const id = Math.max(...state.products.map(p => parseInt(p.id)), 0) + 1;
          const product: Product = {
            ...newProduct,
            id: id.toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return {
            products: [...state.products, product],
          };
        }),

      deleteProduct: (id: string) =>
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
        })),

      getProductById: (id: string) => {
        return get().products.find((product) => product.id === id);
      },

      getProductsByCategory: (categoryId: string) => {
        return get().products.filter((product) => product.categoryId === categoryId);
      },

      searchProducts: (query: string) => {
        const lowerQuery = query.toLowerCase();
        return get().products.filter((product) =>
          product.title.toLowerCase().includes(lowerQuery) ||
          product.description.toLowerCase().includes(lowerQuery) ||
          product.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
          product.sku.toLowerCase().includes(lowerQuery)
        );
      },
    }),
    {
      name: 'product-store',
      partialize: (state) => ({ products: state.products }),
    }
  )
);

// Export a function to get products for cart store usage
export const getProductsFromStore = () => {
  return useProductStore.getState().products;
};

// Helper functions for compatibility with existing code
export const getProductsForPage = (page: number, itemsPerPage = 9): Product[] => {
  const products = useProductStore.getState().products;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return products.slice(startIndex, endIndex);
};

export const getTotalPages = (itemsPerPage = 9): number => {
  const products = useProductStore.getState().products;
  return Math.ceil(products.length / itemsPerPage);
};
