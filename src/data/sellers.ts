// src/data/sellers.ts
export type SellerInfo = { id: string; name: string; email?: string; phone?: string; telegram?: string };

export const sellerDirectory: Record<string, SellerInfo> = {
  zetachem:  { id: "zetachem",  name: "ZetaChem",  email: "sales@zetachem.example", phone: "+7 700 000-00-00", telegram: "@zetachem_sales" },
  acma:      { id: "acma",      name: "Acm Acma Corp", email: "b2b@acma.example" },
  vialabs:   { id: "vialabs",   name: "Vialabs", email: "orders@vialabs.example", phone: "+7 701 111-11-11" },
  synthoria: { id: "synthoria", name: "SYNTHORIA", email: "deal@synthoria.example", telegram: "@synthoria_deals" },
};

// алиас под формулировку из инструкции
export const staticSellers = sellerDirectory;
