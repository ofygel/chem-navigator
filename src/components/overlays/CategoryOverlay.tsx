// src/components/overlays/CategoryOverlay.tsx
"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AutoGrid from "@/components/common/AutoGrid";
import { useUI } from "@/store/ui";
import { cn } from "@/lib/utils";
import { ArrowUpDown, PackageOpen, Store, Filter } from "lucide-react";
import { type Product, type Category } from "@/data/schema";
import BackButton from "@/components/common/BackButton";

type SortKey = "relevance" | "price_asc" | "price_desc" | "az";

function bestPrice(p: Product) {
  if (!p.offers?.length) return undefined;
  return p.offers
    .filter((o) => typeof o.price === "number")
    .sort((a, b) => a.price - b.price)[0];
}

function ProductTile({ p, onOpen }: { p: Product; onOpen: () => void }) {
  const bp = bestPrice(p);
  const sellers = p.offers?.length ?? 0;
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group rounded-2xl p-3 text-left",
        "bg-white/5 ring-1 ring-white/10 hover:bg-white/8 hover:ring-white/20",
        "transition"
      )}
    >
      <div className="mb-2 h-24 w-full rounded-xl bg-gradient-to-br from-cyan-400/10 to-white/5 ring-1 ring-white/10" />
      <div className="truncate font-medium">{p.title}</div>
      <div className="mt-1 text-xs text-white/60">
        {p.cas ? `CAS ${p.cas}` : p.purity ? p.purity : null}
      </div>
      <div className="mt-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-white/70">
          <Store className="h-4 w-4 opacity-70" />
          {sellers ? `${sellers} продавц.` : "нет предложений"}
        </div>
        <div className="tabular-nums">
          {bp ? (
            <>
              от {bp.price.toLocaleString("ru-RU")} {bp.currency ?? "₸"}
            </>
          ) : (
            <span className="text-white/50">Запрос КП</span>
          )}
        </div>
      </div>
    </button>
  );
}

export default function CategoryOverlay() {
  const ui = useUI() as any;
  const open = ui.activeModal === "category" || ui.categoryOverlayOpen;
  const category: Category | undefined =
    ui.selectedCategory ?? ui.activeCategory ?? ui.category;

  // локальные фильтры/сорт
  const [query, setQuery] = React.useState("");
  const [onlyAvailable, setOnlyAvailable] = React.useState(false);
  const [sort, setSort] = React.useState<SortKey>("relevance");

  // lazy-load (порциями по 24)
  const [visible, setVisible] = React.useState(24);
  const sentinel = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    setVisible(24); // при смене категории — сброс
  }, [category?.slug]);

  React.useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible((v) => v + 24);
        }
      },
      { rootMargin: "400px 0px 400px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [sentinel.current]);

  const list: Product[] = React.useMemo(() => {
    let arr = (category?.products ?? []).slice();

    // фильтр: поиск в пределах категории
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      arr = arr.filter((p) => {
        const title = (p.title || "").toLowerCase();
        const cas = (p.cas || "").toLowerCase();
        const tags = (p.tags || []).join(" ").toLowerCase();
        return title.includes(q) || cas.includes(q) || tags.includes(q);
      });
    }

    // фильтр: есть ли предложения/наличие
    if (onlyAvailable) {
      arr = arr.filter((p) => (p.offers?.length ?? 0) > 0);
    }

    // сортировка
    if (sort === "az") arr.sort((a, b) => a.title.localeCompare(b.title, "ru"));
    if (sort === "price_asc")
      arr.sort((a, b) => (bestPrice(a)?.price ?? Infinity) - (bestPrice(b)?.price ?? Infinity));
    if (sort === "price_desc")
      arr.sort((a, b) => (bestPrice(b)?.price ?? -1) - (bestPrice(a)?.price ?? -1));
    // relevance — оставляем как есть (из бэка/поиск задаст порядок)

    return arr;
  }, [category?.products, query, onlyAvailable, sort]);

  const slice = list.slice(0, visible);

  const close = () => {
    if (typeof ui.closeModal === "function") ui.closeModal();
    else if (typeof ui.setActiveModal === "function") ui.setActiveModal(null);
    else if (typeof ui.setCategoryOverlayOpen === "function") ui.setCategoryOverlayOpen(false);
  };

  const openProduct = (p: Product) => {
    if (typeof ui.openProduct === "function") return ui.openProduct(p);
    if (typeof ui.setSelectedProduct === "function") ui.setSelectedProduct(p);
    if (typeof ui.setProduct === "function") ui.setProduct(p);
    if (typeof ui.setActiveModal === "function") ui.setActiveModal("product");
    if (typeof ui.setProductDialogOpen === "function") ui.setProductDialogOpen(true);
    if (typeof ui.openProductDialog === "function") ui.openProductDialog(true);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? close() : null)}>
      <DialogContent className="max-w-6xl p-0">
        <DialogHeader className="sticky top-0 z-10 bg-white/5 p-6 backdrop-blur-xl">
          {/* Шапка с BackButton и заголовком */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BackButton onClick={close} />
              <DialogTitle>
                <span>{category?.title ?? "Категория"}</span>
              </DialogTitle>
            </div>
            <span className="text-sm font-normal text-white/70">
              {list.length} позиций{query ? ` · по запросу «${query}»` : ""}
            </span>
          </div>

          {/* панель управлением: поиск в пределах категории / сорт / наличие */}
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="col-span-2">
              <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <Filter className="mr-2 h-4 w-4 opacity-70" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Быстрый фильтр по этой категории…"
                  className="w-full bg-transparent placeholder:text-white/60 outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-cyan-400"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                />
                Есть предложения
              </label>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="appearance-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 pr-8 text-sm"
                >
                  <option value="relevance">По релевантности</option>
                  <option value="price_asc">Цена ↑</option>
                  <option value="price_desc">Цена ↓</option>
                  <option value="az">А-Я</option>
                </select>
                <ArrowUpDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70" />
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* содержимое: грид или пустое состояние */}
        <div className="p-6">
          {!list.length ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-2xl bg-white/4 p-8 ring-1 ring-white/10">
              <PackageOpen className="h-10 w-10 opacity-60" />
              <div className="text-white/80">Пока ничего не найдено</div>
              <div className="text-sm text-white/60">Попробуйте убрать фильтры или изменить запрос.</div>
            </div>
          ) : (
            <>
              <AutoGrid min="15rem">
                {slice.map((p) => (
                  <ProductTile key={p.id} p={p} onOpen={() => openProduct(p)} />
                ))}
              </AutoGrid>

              {/* lazy-sentinel */}
              {slice.length < list.length && (
                <div ref={sentinel} className="py-6 text-center text-sm text-white/60">
                  Загружаю ещё…
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
