// src/components/catalog/ProductTile.tsx
"use client";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useUI } from "@/store/ui";
import { cn } from "@/lib/utils";
import { Store } from "lucide-react";
import { useMergedOffers } from "@/lib/mergeOffers";
import { findProduct } from "@/data/catalog";

export default function ProductTile({
  id, title, image, purity, volume, className,
}: {
  id: string;
  title: string;
  image?: string;
  purity?: number;
  volume?: string;
  className?: string;
}) {
  const { openProduct } = useUI();

  // Получаем полный объект товара для корректного слияния офферов
  const product =
    findProduct(id) ||
    ({ id, title, image, purity, volume, offers: [] } as any);

  const { sellersCount } = useMergedOffers(product);

  return (
    <button
      type="button"
      onClick={() => openProduct(id)}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-3 text-left",
        "transition-colors hover:bg-black/40",
        className
      )}
    >
      <div className="relative h-28 w-full overflow-hidden rounded-xl">
        {image ? (
          <Image src={image} alt={title} fill className="object-contain p-2" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand.cyan/10 via-transparent to-transparent" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent,rgba(0,0,0,0.55))]" />
      </div>

      <div className="mt-3 line-clamp-2 text-sm font-medium leading-snug">{title}</div>

      <div className="mt-2 flex gap-2">
        {purity != null && <Badge variant="outline">{purity} %</Badge>}
        {volume && <Badge variant="outline">{volume}</Badge>}
      </div>

      <div className="mt-2 flex items-center gap-1 text-white/70">
        <Store className="h-4 w-4 opacity-70" />
        {sellersCount ? `${sellersCount} продавц.` : "нет предложений"}
      </div>
    </button>
  );
}
