// src/lib/i18n.ts
"use client";
import { useUI } from "@/store/ui";

const dict = {
  ru: {
    popular: "Популярные разделы",
    searchPlaceholder: "Поиск по названию, CAS, назначению…",
  },
  kk: {
    popular: "Танымал бөлімдер",
    searchPlaceholder: "Атауы, CAS немесе мақсаты бойынша іздеу…",
  },
} as const;

export function useT() {
  const { locale } = useUI();
  return (k: keyof typeof dict["ru"]) => (dict as any)[locale]?.[k] ?? (dict as any)["ru"][k];
}
