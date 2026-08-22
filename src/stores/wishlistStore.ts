import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { NormalizedProduct } from '@/types';

interface WishlistState {
  items: NormalizedProduct[];
  addItem: (product: NormalizedProduct) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: NormalizedProduct) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        if (!get().isInWishlist(product.productId)) {
          set((state) => ({ items: [...state.items, product] }));
        }
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },
      toggleItem: (product) => {
        if (get().isInWishlist(product.productId)) {
          get().removeItem(product.productId);
        } else {
          get().addItem(product);
        }
      },
      isInWishlist: (productId) => {
        return get().items.some((i) => i.productId === productId);
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'kenya-electronics-wishlist',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : ({} as any))),
    }
  )
);
