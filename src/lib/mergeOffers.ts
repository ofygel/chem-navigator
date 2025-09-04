// src/lib/mergeOffers.ts
"use client";
import { useSellerStore } from "@/store/seller";

// Минимальный набор полей, который нам реально нужен для слияния офферов
type MinimalOffer = {
  sellerId?: string;
  seller?: string;
  price?: number;
  currency?: string;
  pack?: string;
  qty?: number;
  leadTime?: string;
};
type MinimalProduct = {
  id: string;
  offers?: MinimalOffer[];
};

export function useMergedOffers<P extends MinimalProduct>(product?: P) {
  const sellerOffers = useSellerStore((s) => s.offersByProduct);

  // оффер «моего» продавца из локального стора
  const mine = product && sellerOffers[product.id] ? [sellerOffers[product.id] as MinimalOffer] : [];
  const base = (product?.offers ?? []) as MinimalOffer[];
  const offers = [...base, ...mine];

  const sellersCount = new Set(
    offers.map((o) => (o.sellerId ?? o.seller)).filter(Boolean)
  ).size;

  return { offers, sellersCount };
}
