// src/lib/smartSearch.ts
import Fuse from "fuse.js";
import { CATALOG, type Category, type Product } from "@/data/catalog";

export type SearchDoc = {
  id: string;
  type: "product" | "category";
  title: string;          // Заголовок (товар/категория)
  text?: string;          // Описание, свободный текст
  cas?: string;
  tags?: string[];
  synonyms?: string[];    // Синонимы, латынь/просторечные варианты
  seller?: string[];      // Имена продавцов из offers
  payload: any;           // Сам объект для открытия
};

export type SmartResult = { doc: SearchDoc; score: number };

const RU = {
  normalize(s: string) {
    return (s || "")
      .toLowerCase()
      .replaceAll("ё", "е")
      .replace(/[ъь]/g, "")
      .replace(/[^a-z0-9а-я\s\-\.\,\/]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  },
  // грубая транслитерация лат⇄кирилл, чтобы понимать "aceton" ~ "ацетон"
  lat2ru(s: string) {
    let out = (s || "").toLowerCase();
    // сначала многобуквенные сочетания
    out = out.replace(/sch/g, "щ")
             .replace(/sh/g, "ш")
             .replace(/ch/g, "ч")
             .replace(/yo/g, "ё")
             .replace(/yu/g, "ю")
             .replace(/ya/g, "я")
             .replace(/kh/g, "х")
             .replace(/ts/g, "ц");
    const map: Record<string, string> = {
      a:"а", b:"б", v:"в", g:"г", d:"д", e:"е", z:"з", i:"и", j:"й", k:"к", l:"л",
      m:"м", n:"н", o:"о", p:"п", r:"р", s:"с", t:"т", u:"у", f:"ф", h:"х", c:"к",
      y:"ы", q:"к", w:"в", x:"кс"
    };
    out = out.replace(/[a-z]/g, (ch) => map[ch] ?? ch);
    return out;
  },
  ru2lat(s: string) {
    let out = (s || "").toLowerCase();
    out = out.replace(/щ/g, "sch")
             .replace(/ш/g, "sh")
             .replace(/ч/g, "ch")
             .replace(/ё/g, "yo")
             .replace(/ю/g, "yu")
             .replace(/я/g, "ya")
             .replace(/х/g, "kh")
             .replace(/ц/g, "ts");
    const map: Record<string, string> = {
      а:"a", б:"b", в:"v", г:"g", д:"d", е:"e", ж:"zh", з:"z", и:"i", й:"j", к:"k", л:"l",
      м:"m", н:"n", о:"o", п:"p", р:"r", с:"s", т:"t", у:"u", ф:"f", ъ:"", ь:"", ы:"y"
    };
    out = out.replace(/[абвгдеёжзийклмнопрстуфьыъ]/g, (ch) => (map as any)[ch] ?? ch);
    return out;
  },
};

function buildDocsFromCatalog(): SearchDoc[] {
  const docs: SearchDoc[] = [];
  for (const cat of CATALOG as Category[]) {
    docs.push({
      id: `cat:${cat.slug ?? cat.title}`,
      type: "category",
      title: cat.title,
      text: "",
      payload: cat,
    });
    for (const p of cat.products as Product[]) {
      const sellers = (p.offers ?? []).map((o) => o.seller);
      const syn: string[] = [];
      // автосинонимы: транслитерации и нормализованные формы
      syn.push(RU.ru2lat(p.title), RU.lat2ru(p.title), RU.normalize(p.title));
      docs.push({
        id: `prod:${p.id}`,
        type: "product",
        title: p.title,
        cas: p.cas,
        tags: p.tags,
        synonyms: syn,
        seller: sellers,
        payload: { product: p, category: cat },
      });
    }
  }
  return docs;
}

const DOCS: SearchDoc[] = buildDocsFromCatalog();

const FUSE = new Fuse(DOCS, {
  includeScore: true,
  threshold: 0.42,            // допускаем опечатки 1–2 символа
  ignoreLocation: true,
  minMatchCharLength: 2,
  keys: [
    { name: "title", weight: 0.55 },
    { name: "cas", weight: 0.9 },
    { name: "tags", weight: 0.2 },
    { name: "synonyms", weight: 0.35 },
    { name: "seller", weight: 0.15 },
  ],
});

const CAS_RE = /^\d{1,7}-\d{2}-\d$/;

export function smartSearch(raw: string, limit = 10): SmartResult[] {
  const q = (raw || "").trim();
  if (!q) return [];

  const variants = Array.from(
    new Set([q, RU.normalize(q), RU.lat2ru(q), RU.ru2lat(q)].filter(Boolean))
  );

  const best = new Map<string, SmartResult>();

  for (const v of variants) {
    const hits = FUSE.search(v, { limit: limit * 2 });
    for (const h of hits) {
      const id = h.item.id;
      const prev = best.get(id);
      let score = h.score ?? 1;

      // буст точного совпадения CAS
      if (CAS_RE.test(v) && h.item.cas && RU.normalize(h.item.cas) === RU.normalize(v)) {
        score *= 0.2;
      }

      if (!prev || score < prev.score) {
        best.set(id, { doc: h.item, score });
      }
    }
  }

  const arr = [...best.values()].sort((a, b) => a.score - b.score).slice(0, limit);
  return arr;
}
