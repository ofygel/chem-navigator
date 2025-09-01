// src/store/ui.ts
"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Quality = "high" | "low";
type UIState = {
  introDone: boolean;
  qualityMode: Quality;
  setIntroDone: (v: boolean) => void;
  setQuality: (q: Quality) => void;
};

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      introDone: false,
      qualityMode: "high",
      setIntroDone: (v) => set({ introDone: v }),
      setQuality: (q) => set({ qualityMode: q }),
    }),
    {
      name: "chem-ui-v2",
      // сохраняем ТОЛЬКО качество, introDone не пишем в localStorage
      partialize: (s) => ({ qualityMode: s.qualityMode }),
    }
  )
);
