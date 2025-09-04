// src/store/seller.ts
"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SellerId } from "@/data/schema";

export type Availability = "in-stock" | "preorder" | "out-of-stock";
export type PublishState = "draft" | "published";

export type MinimalOffer = {
  sellerId: SellerId;
  price: number;
  currency?: string;
  pack?: string;
  qty?: number;
  leadTime?: string;
  availability?: Availability;
  state?: PublishState;
  updatedAt?: number;
};

type SellerProfile = {
  id: SellerId;
  name: string;
  email?: string;
  phone?: string;
  telegram?: string;
};

export type CustomProduct = { id: string; title: string; cas?: string; purity?: string | number };

type SellerState = {
  me: SellerProfile;

  defaults: {
    currency: string;
    pack: string;
    leadTime: string;
    availability: Availability;
    state: PublishState;
  };

  offersByProduct: Record<string, MinimalOffer>;
  customProducts: Record<string, CustomProduct>;
  onboardingDone: boolean;

  // profile/defaults
  setProfile: (patch: Partial<SellerProfile>) => void;
  setDefaults: (patch: Partial<SellerState["defaults"]>) => void;
  setOnboardingDone: (v: boolean) => void;

  // offers
  upsertOffer: (productId: string, patch?: Partial<MinimalOffer>) => void;
  removeOffer: (productId: string) => void;
  bulkUpsertOffers: (productIds: string[], patch?: Partial<MinimalOffer>) => void;
  setOfferField: (productId: string, field: keyof MinimalOffer, value: any) => void;
  publish: (productIds: string[]) => void;
  unpublish: (productIds: string[]) => void;

  // custom SKU
  addCustomProduct: (p: CustomProduct) => void;
  removeCustomProduct: (id: string) => void;

  clearAll: () => void;
};

export const useSellerStore = create<SellerState>()(
  persist(
    (set, get) => ({
      me: { id: "my-seller", name: "Мой магазин" },
      defaults: {
        currency: "₸",
        pack: "1 ед.",
        leadTime: "2–3 дня",
        availability: "in-stock",
        state: "draft",
      },
      offersByProduct: {},
      customProducts: {},
      onboardingDone: false,

      setProfile: (patch) => set((s) => ({ me: { ...s.me, ...patch } })),
      setDefaults: (patch) => set((s) => ({ defaults: { ...s.defaults, ...patch } })),
      setOnboardingDone: (v) => set({ onboardingDone: v }),

      upsertOffer: (productId, patch = {}) =>
        set((s) => {
          const d = s.defaults;
          const base: MinimalOffer =
            s.offersByProduct[productId] ?? {
              sellerId: s.me.id,
              price: 0,
              currency: d.currency,
              pack: d.pack,
              qty: 0,
              leadTime: d.leadTime,
              availability: d.availability,
              state: d.state,
            };
          return {
            offersByProduct: {
              ...s.offersByProduct,
              [productId]: { ...base, ...patch, sellerId: s.me.id, updatedAt: Date.now() },
            },
          };
        }),

      removeOffer: (productId) =>
        set((s) => {
          const copy = { ...s.offersByProduct };
          delete copy[productId];
          return { offersByProduct: copy };
        }),

      bulkUpsertOffers: (ids, patch = {}) =>
        set((s) => {
          const d = s.defaults;
          const out = { ...s.offersByProduct };
          for (const pid of ids) {
            const base: MinimalOffer =
              out[pid] ?? {
                sellerId: s.me.id,
                price: 0,
                currency: d.currency,
                pack: d.pack,
                qty: 0,
                leadTime: d.leadTime,
                availability: d.availability,
                state: d.state,
              };
            out[pid] = { ...base, ...patch, sellerId: s.me.id, updatedAt: Date.now() };
          }
          return { offersByProduct: out };
        }),

      setOfferField: (productId, field, value) =>
        set((s) => {
          if (!s.offersByProduct[productId]) return {};
          return {
            offersByProduct: {
              ...s.offersByProduct,
              [productId]: { ...s.offersByProduct[productId], [field]: value, updatedAt: Date.now() },
            },
          };
        }),

      publish: (ids) => get().bulkUpsertOffers(ids, { state: "published" }),
      unpublish: (ids) => get().bulkUpsertOffers(ids, { state: "draft" }),

      addCustomProduct: (p) =>
        set((s) => ({
          customProducts: { ...s.customProducts, [p.id]: p },
        })),
      removeCustomProduct: (id) =>
        set((s) => {
          const cp = { ...s.customProducts };
          delete cp[id];
          // и оффер, если был привязан к кастомному SKU
          const obp = { ...s.offersByProduct };
          delete obp[id];
          return { customProducts: cp, offersByProduct: obp };
        }),

      clearAll: () => set({ offersByProduct: {}, customProducts: {} }),
    }),
    { name: "seller-store-v3" }
  )
);
