import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { NormalizedProduct } from '@/types';

export interface CartItem {
  product: NormalizedProduct;
  quantity: number;
  selectedVariantId?: string;
  addedAt: string;
}

interface CartState {
  items: CartItem[];
  deliveryZoneId: string;
  isPickup: boolean;
  addItem: (product: NormalizedProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setDeliveryZone: (zoneId: string) => void;
  setIsPickup: (isPickup: boolean) => void;
  getTotalItems: () => number;
  getSellerGroups: () => Record<string, CartItem[]>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      deliveryZoneId: 'zone-nairobi-cbd',
      isPickup: false,

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.product.productId === product.productId
          );
          if (existingIndex > -1) {
            const updated = [...state.items];
            updated[existingIndex]!.quantity += quantity;
            return { items: updated };
          }
          return {
            items: [
              ...state.items,
              {
                product,
                quantity,
                addedAt: new Date().toISOString(),
              },
            ],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.productId === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      setDeliveryZone: (zoneId) => set({ deliveryZoneId: zoneId }),
      setIsPickup: (isPickup) => set({ isPickup }),

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSellerGroups: () => {
        const items = get().items;
        const groups: Record<string, CartItem[]> = {};

        for (const item of items) {
          const sellerKey = item.product.sourceFolder
            ? `seller-${item.product.sourceFolder}`
            : 'seller-platform-managed';
          if (!groups[sellerKey]) {
            groups[sellerKey] = [];
          }
          groups[sellerKey].push(item);
        }

        return groups;
      },
    }),
    {
      name: 'kenya-electronics-cart',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : ({} as any))),
    }
  )
);
