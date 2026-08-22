import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { NormalizedProduct } from '@/types';

interface CompareState {
  items: NormalizedProduct[];
  addItem: (product: NormalizedProduct) => boolean; // returns false if max limit reached
  removeItem: (productId: string) => void;
  toggleItem: (product: NormalizedProduct) => boolean;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const items = get().items;
        if (items.length >= 4) return false; // Max 4 products
        if (!get().isInCompare(product.productId)) {
          set({ items: [...items, product] });
        }
        return true;
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },
      toggleItem: (product) => {
        if (get().isInCompare(product.productId)) {
          get().removeItem(product.productId);
          return true;
        } else {
          return get().addItem(product);
        }
      },
      isInCompare: (productId) => {
        return get().items.some((i) => i.productId === productId);
      },
      clearCompare: () => set({ items: [] }),
    }),
    {
      name: 'kenya-electronics-compare',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : ({} as any))),
    }
  )
);
