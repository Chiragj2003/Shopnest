import { create } from "zustand";
import type { Product } from "@/lib/types";

export type CartLine = { product: Product; qty: number };

type CartState = {
  lines: CartLine[];
  add: (product: Product) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  has: (productId: string) => boolean;
  count: () => number;
  total: () => number;
};

export const useCart = create<CartState>((set, get) => ({
  lines: [],
  add: (product) =>
    set((s) =>
      s.lines.some((l) => l.product.id === product.id)
        ? s
        : { lines: [...s.lines, { product, qty: 1 }] }
    ),
  remove: (productId) =>
    set((s) => ({ lines: s.lines.filter((l) => l.product.id !== productId) })),
  setQty: (productId, qty) =>
    set((s) => ({
      lines:
        qty <= 0
          ? s.lines.filter((l) => l.product.id !== productId)
          : s.lines.map((l) => (l.product.id === productId ? { ...l, qty } : l)),
    })),
  clear: () => set({ lines: [] }),
  has: (productId) => get().lines.some((l) => l.product.id === productId),
  count: () => get().lines.reduce((n, l) => n + l.qty, 0),
  total: () => get().lines.reduce((n, l) => n + l.qty * l.product.price, 0),
}));
