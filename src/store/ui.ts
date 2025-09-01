// src/store/ui.ts
"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Quality = "high" | "low";
type ModalType = null | "cart" | "profile" | "contacts" | "category";

export type CartItem = {
  id: string;        // productId
  title: string;
  seller: string;
  price: number;
  currency?: "₸" | "₽" | "$";
  qty: number;
};

type UIState = {
  qualityMode: Quality;
  locale: "ru" | "kk";
  setLocale: (l: "ru" | "kk") => void;

  activeModal: ModalType;
  openModal: (t: ModalType) => void;
  closeModal: () => void;

  selectedCategory: string | null;
  openCategory: (slug: string) => void;

  productOpen: boolean;
  selectedProductId: string | null;
  openProduct: (id: string) => void;
  closeProduct: () => void;

  // hover для связи с 3D
  hoverCategory: string | null;
  setHoverCategory: (slug: string | null) => void;

  // корзина
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeFromCart: (id: string, seller: string) => void;
  setQty: (id: string, seller: string, qty: number) => void;
  clearCart: () => void;
};

export const useUI = create<UIState>()(
  persist(
    (set, get) => ({
      qualityMode: "high",

      locale: "ru",
      setLocale: (l) => set({ locale: l }),

      activeModal: null,
      openModal: (t) => set({ activeModal: t }),
      closeModal: () => set({ activeModal: null, selectedCategory: null }),

      selectedCategory: null,
      openCategory: (slug) => set({ activeModal: "category", selectedCategory: slug }),

      productOpen: false,
      selectedProductId: null,
      openProduct: (id) => set({ productOpen: true, selectedProductId: id }),
      closeProduct: () => set({ productOpen: false, selectedProductId: null }),

      hoverCategory: null,
      setHoverCategory: (slug) => set({ hoverCategory: slug }),

      cart: [],
      addToCart: (item, qty = 1) => {
        const cur = get().cart;
        const idx = cur.findIndex(c => c.id === item.id && c.seller === item.seller);
        if (idx >= 0) {
          const copy = [...cur]; copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty };
          set({ cart: copy });
        } else {
          set({ cart: [...cur, { ...item, qty }] });
        }
      },
      removeFromCart: (id, seller) => set({ cart: get().cart.filter(c => !(c.id === id && c.seller === seller)) }),
      setQty: (id, seller, qty) => {
        const copy = get().cart.map(c => c.id === id && c.seller === seller ? { ...c, qty } : c);
        set({ cart: copy });
      },
      clearCart: () => set({ cart: [] }),
    }),
    { name: "chem-ui-v4", partialize: (s) => ({ qualityMode: s.qualityMode, locale: s.locale, cart: s.cart }) }
  )
);
