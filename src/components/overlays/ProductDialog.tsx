// src/components/overlays/ProductDialog.tsx
"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUI } from "@/store/ui";
import { findProduct } from "@/data/catalog";
import GhsIcon from "@/components/catalog/GhsIcon";
import { Store } from "lucide-react";
import BackButton from "@/components/common/BackButton";

// НОВОЕ: слияние офферов + клиентский справочник продавцов
import { useMergedOffers } from "@/lib/mergeOffers";
import { useSellerDirectory } from "@/data/sellersClient";

export default function ProductDialog() {
  const { productOpen, selectedProductId, closeProduct } = useUI();
  const product = selectedProductId ? findProduct(selectedProductId) : undefined;

  // офферы уже слиты (самопродажи, дубли и т.п.)
  const { offers } = useMergedOffers(product);
  // справочник продавцов (может переопределяться на клиенте)
  const directory = useSellerDirectory();

  // универсальные хелперы под разные сторы
  const ui = useUI() as any;

  function addToCartSafe(item: any) {
    if (typeof ui.addToCart === "function") return ui.addToCart(item);
    if (typeof ui.cartAdd === "function") return ui.cartAdd(item);
    if (typeof ui.setCart === "function") {
      const cur = Array.isArray(ui.cart) ? ui.cart : [];
      ui.setCart([...cur, item]);
    }
  }

  function goCheckoutFor(p: any, offer: any) {
    const sid = offer?.sellerId ?? offer?.seller;
    addToCartSafe({
      id: `${p.id}:${sid}:${offer?.pack ?? "base"}`,
      title: p.title,
      price: offer.price,
      currency: offer.currency ?? "₸",
      qty: 1,
      seller: (directory[sid]?.name ?? sid),
    });
    if (typeof ui.openModal === "function") ui.openModal("checkout");
    else if (typeof ui.setActiveModal === "function") ui.setActiveModal("checkout");
  }

  return (
    <Dialog open={productOpen} onOpenChange={(o) => (!o ? closeProduct() : null)}>
      <DialogContent className="max-w-3xl ring-1 ring-white/10 bg-white/5 p-0 backdrop-blur-xl">
        {/* a11y-заголовки */}
        <DialogTitle className="sr-only">
          {product?.title ?? "Карточка товара"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Спецификации, GHS, предложения продавцов.
        </DialogDescription>

        {/* Стрессоустойчивая шапка с Back */}
        <DialogHeader className="sticky top-0 z-20 bg-white/5 px-6 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <BackButton onClick={() => closeProduct()} />
            <div className="truncate text-sm text-white/80">{product?.category?.title ?? "Категория"}</div>
            <div className="truncate text-white/90">·</div>
            <div className="truncate font-medium">{product?.title ?? "Товар"}</div>
          </div>
        </DialogHeader>

        {/* верхний блок — фон/герой */}
        <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-brand.blue/20 via-transparent to-transparent p-6 pt-4">
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

        {/* предложения продавцов (уже слитые) */}
        <div className="p-6">
          <div className="mt-0 space-y-2 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <div className="mb-2 flex items-center gap-2 text-sm text-white/70">
              <Store className="h-4 w-4" />
              Предложения продавцов
            </div>

            {offers?.length ? (
              <div className="space-y-2">
                {offers.map((o: any, i: number) => {
                  const sid = o.sellerId ?? o.seller;
                  const s = directory[sid] ?? { id: sid, name: sid };
                  const price = o.price;
                  const currency = o.currency ?? "₸";
                  const packInfo = o.pack ? `${o.pack} · ` : "";
                  const leadInfo = o.leadTime ? `срок ${o.leadTime} · ` : "";
                  const stockInfo =
                    typeof o.qty === "number"
                      ? `склад: ${o.qty}`
                      : (o.availability === "in-stock" ? "в наличии" : "под заказ");

                  return (
                    <div
                      key={i}
                      className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl bg-white/4 p-3 ring-1 ring-white/10"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium">{s.name}</div>
                        <div className="text-xs text-white/60">
                          {packInfo}
                          {leadInfo}
                          {stockInfo}
                        </div>
                      </div>

                      <div className="tabular-nums">
                        {Number(price).toLocaleString("ru-RU")} {currency}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          onClick={() =>
                            addToCartSafe({
                              id: `${product!.id}:${sid}:${o?.pack ?? "base"}`,
                              title: product!.title,
                              price,
                              currency,
                              qty: 1,
                              seller: s.name,
                            })
                          }
                          className="rounded-xl"
                        >
                          В корзину
                        </Button>
                        <Button
                          onClick={() => goCheckoutFor(product, o)}
                          className="rounded-xl bg-cyan-400/20 text-cyan-200 hover:bg-cyan-400/30"
                        >
                          Оформить
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl bg-white/4 p-3 text-sm text-white/70 ring-1 ring-white/10">
                Пока нет продавцов — оставьте заявку через «Оформить заказ», мы подберём предложение.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
