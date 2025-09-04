"use client";
import { useSellerStore } from "@/store/seller";
import { useAdminStore } from "@/store/admin";
import { staticSellers, type SellerInfo } from "./sellers";

export function useSellerDirectory(): Record<string, SellerInfo> {
  const me = useSellerStore((s) => s.me);
  const admin = useAdminStore((s) => s.sellers);
  const mine: SellerInfo = { id: me.id, name: me.name || "Мой магазин", email: me.email, phone: me.phone, telegram: me.telegram };
  return { ...staticSellers, ...admin, [me.id]: mine };
}
