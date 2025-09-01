import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '../lib/types';
import { getProductsFromStore } from './useProducts';

interface CartState {
  items: CartItem[];
  addItem: (productId: string, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  getCartItems: () => Array<CartItem & { product: Product }>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId: string, qty = 1) => {
        set((state) => {
          const existingItem = state.items.find(item => item.productId === productId);
          
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.productId === productId
                  ? { ...item, qty: item.qty + qty }
                  : item
              ),
            };
          } else {
            return {
              items: [
                ...state.items,
                {
                  productId,
                  qty,
                  addedAt: new Date().toISOString(),
                },
              ],
            };
          }
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter(item => item.productId !== productId),
        }));
      },

      updateQuantity: (productId: string, qty: number) => {
        if (qty <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map(item =>
            item.productId === productId
              ? { ...item, qty }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getCartTotal: () => {
        const { items } = get();
        const products = getProductsFromStore();
        
        return items.reduce((total, item) => {
          const product = products.find((p: Product) => p.id === item.productId);
          return total + (product ? product.price * item.qty : 0);
        }, 0);
      },

      getCartCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.qty, 0);
      },

      getCartItems: () => {
        const { items } = get();
        const products = getProductsFromStore();
        
        return items.map(item => {
          const product = products.find((p: Product) => p.id === item.productId);
          return {
            ...item,
            product: product!,
          };
        }).filter(item => item.product);
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
