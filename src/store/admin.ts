"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Seller } from "@/data/schema";

type AdminState = {
  sellers: Record<string, Seller>; // дополняет/переопределяет статический справочник
  upsertSeller: (s: Seller) => void;
  removeSeller: (id: string) => void;
  reset: () => void;
};

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      sellers: {},
      upsertSeller: (s) =>
        set((st) => ({ sellers: { ...st.sellers, [s.id]: s } })),
      removeSeller: (id) =>
        set((st) => {
          const copy = { ...st.sellers };
          delete copy[id];
          return { sellers: copy };
        }),
      reset: () => set({ sellers: {} }),
    }),
    { name: "admin-store-v1" }
  )
);
