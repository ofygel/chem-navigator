// src/components/overlays/ProductDialog.tsx
"use client";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUI } from "@/store/ui";
import { findProduct } from "@/data/catalog";
import GhsIcon from "@/components/catalog/GhsIcon";

export default function ProductDialog() {
  const { productOpen, selectedProductId, closeProduct, openModal, addToCart } = useUI();
  const product = selectedProductId ? findProduct(selectedProductId) : undefined;

  return (
    <Dialog open={productOpen} onOpenChange={(o) => (!o ? closeProduct() : null)}>
      <DialogContent className="max-w-3xl border-white/10 bg-black/60 p-0 backdrop-blur">
        {/* a11y: скрытые заголовок и описание для DialogContent */}
        <DialogTitle className="sr-only">
          {product?.title ?? "Карточка товара"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Детальная информация о товаре и предложения поставщиков.
        </DialogDescription>

        {/* верхний блок — фон/герой */}
        <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-brand.blue/20 via-transparent to-transparent p-6">
          <div className="mx-auto grid grid-cols-1 items-center gap-4 md:grid-cols-[220px_1fr]">
            <div className="relative mx-auto aspect-[3/5] w-[160px] md:w-[220px]">
              {product?.image ? (
                <Image src={product.image} alt={product.title} fill className="object-contain" />
              ) : (
                <div className="absolute inset-0 rounded-xl border border-white/10 bg-black/30" />
              )}
            </div>

            <div className="text-center md:text-left">
              <div className="text-sm uppercase tracking-widest text-white/80">
                {product?.category?.title ?? "Категория"}
              </div>
              <h2 className="mt-1 text-2xl font-semibold md:text-3xl">
                {product?.title ?? "Товар"}
              </h2>
              {product?.cas && <div className="mt-1 text-white/70">CAS {product.cas}</div>}

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                {product?.purity != null && <Badge variant="outline">{product.purity} %</Badge>}
                {product?.volume && (
                  <Badge variant="outline" className="gap-1">
                    <span className="inline-block h-2 w-2 rounded-full bg-red-400" /> {product.volume}
                  </Badge>
                )}
                {product?.tags?.slice(0, 3).map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>

              {/* GHS hazards */}
              {product?.hazards && product.hazards.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                  {product.hazards.map((h) => (
                    <span
                      key={h}
                      className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-black/30 px-2 py-1 text-xs"
                    >
                      <GhsIcon code={h as any} />
                      <span className="capitalize">{h}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* список продавцов */}
        <div className="space-y-3 p-6">
          <div className="rounded-2xl border border-white/10 bg-black/30">
            {product?.offers.map((o, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-3 text-sm [&+div]:border-t [&+div]:border-white/10"
              >
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md border border-white/20 bg-black/40" />
                  <div className="font-medium">{o.seller}</div>
                </div>
                <div className="tabular-nums text-white/90">
                  {o.price.toLocaleString("ru-RU")} {o.currency ?? "₽"}
                </div>
                <div className="flex items-center gap-2">
                  {o.availability === "in-stock" ? (
                    <span className="text-xs text-brand.mint">В наличии</span>
                  ) : (
                    <span className="text-xs text-white/60">Под заказ</span>
                  )}
                  <Button
                    size="sm"
                    className="rounded-xl bg-brand.cyan/20 text-brand.cyan hover:bg-brand.cyan/30"
                    onClick={() => {
                      if (!product) return;
                      addToCart(
                        {
                          id: product.id,
                          title: product.title,
                          seller: o.seller,
                          price: o.price,
                          currency: o.currency ?? "₽",
                        },
                        1
                      );
                      openModal("cart");
                    }}
                  >
                    Купить
                  </Button>
                </div>
              </div>
            ))}
            {!product && <div className="p-4 text-sm text-white/70">Товар не найден.</div>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
