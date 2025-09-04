// src/data/schema.ts
export type SellerId = string;
export type ProductId = string;

export type Offer = {
  sellerId: SellerId;
  price: number;           // за базовую фасовку
  currency?: string;       // "₸" | "₽" | "$" и т.п.
  pack?: string;           // "1 л", "5 кг", ...
  qty?: number;            // складской остаток (опционально)
  leadTime?: string;       // "2–3 дня"
};

export type Product = {
  id: ProductId;
  title: string;
  cas?: string;
  purity?: string;
  tags?: string[];
  hazards?: string[];      // GHS
  documents?: { kind: "MSDS" | "CoA" | "Spec"; url: string }[];
  offers?: Offer[];        // продавцы и цены
};

export type Category = {
  slug: string;
  title: string;
  products: Product[];
};

export type Seller = {
  id: SellerId;
  name: string;
  email?: string;
  phone?: string;
  telegram?: string;
  // в будущем: адреса, БИН/ИИН, график и т.п.
};
