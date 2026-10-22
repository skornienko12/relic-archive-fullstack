import { create } from 'zustand';
import type { Product } from '../types';

export interface CartItem { product: Product; quantity: number }
export interface CartStore {
  items: CartItem[];
  add: (product: Product) => void;
  remove: (id: number) => void;
  clear: () => void;
}

export const useCart = create<CartStore>((set) => ({
  items: [],
  add: (product) => set(({ items }) => {
    const current = items.find((item) => item.product.id === product.id);
    return { items: current
      ? items.map((item) => item.product.id === product.id
        ? { ...item, quantity: Math.min(20, item.quantity + 1) } : item)
      : [...items, { product, quantity: 1 }] };
  }),
  remove: (id) => set(({ items }) => ({ items: items.filter((item) => item.product.id !== id) })),
  clear: () => set({ items: [] }),
}));
