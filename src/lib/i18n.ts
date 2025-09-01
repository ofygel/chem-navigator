// src/lib/i18n.ts
import { useUI } from "@/store/ui";
const dict = {
  ru: { searchPlaceholder: "Поиск по названию, CAS, назначению…", popular: "Популярные разделы" },
  kk: { searchPlaceholder: "Атауы, CAS, тағайындауы бойынша іздеу…", popular: "Танымал бөлімдер" },
} as const;
export function useT() {
  const locale = useUI(s => s.locale);
  return (k: keyof typeof dict["ru"]) => (dict[locale] ?? dict.ru)[k];
}
