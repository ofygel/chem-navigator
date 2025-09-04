"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type BuyerProfile = {
  company?: string;
  contact?: string;
  phone?: string;
  email?: string;
  delivery?: string;
  notes?: string;
};
type BuyerState = {
  profile: BuyerProfile;
  setProfile: (p: Partial<BuyerProfile>) => void;
  reset: () => void;
};

export const useBuyerStore = create<BuyerState>()(
  persist(
    (set) => ({
      profile: { delivery: "Самовывоз / обсуждается" },
      setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
      reset: () => set({ profile: { delivery: "Самовывоз / обсуждается" } }),
    }),
    { name: "buyer-store-v1" }
  )
);
