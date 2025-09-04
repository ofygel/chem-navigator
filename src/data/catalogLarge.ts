// src/data/catalogLarge.ts
import { CATALOG } from "@/data/catalog";

// Возвращаем копию CATALOG, но расширенную до perCat SKU в каждой категории.
// Генерация детерминированная (на основании индексов), без сторонних зависимостей.
let LARGE: any[] | null = null;

function padCas(baseCas?: string, i?: number) {
  // примитивная вариация CAS (только для демо UI)
  if (!baseCas) return undefined;
  const n = (i ?? 0) % 97;
  return baseCas.replace(/\d+$/, (m) => {
    const v = parseInt(m, 10);
    return String(v + n);
  });
}

function cloneProduct(p: any, idx: number) {
  const suffix = `–${(idx + 1).toString().padStart(3, "0")}`;
  return {
    ...p,
    id: `${p.id}__v${idx + 1}`,
    title: `${p.title} ${suffix}`,
    cas: padCas(p.cas, idx),
    tags: Array.isArray(p.tags) ? [...p.tags] : [],
    offers: [], // по умолчанию без продавцов — продавец отметит сам
  };
}

export function getLargeCatalog(perCat = 500) {
  if (LARGE) return LARGE;
  LARGE = CATALOG.map((cat: any) => {
    const base = Array.isArray(cat.products) ? cat.products : [];
    const out = [...base];
    let i = 0;
    // расширяем, копируя первые элементы с вариациями
    while (out.length < perCat && base.length > 0) {
      const tpl = base[i % base.length];
      out.push(cloneProduct(tpl, i));
      i++;
    }
    return { ...cat, products: out };
  });
  return LARGE;
}
