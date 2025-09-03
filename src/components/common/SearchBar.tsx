"use client";

import * as React from "react";
import { Search as SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { smartSearch, type SmartResult } from "@/lib/smartSearch";
import { CATALOG } from "@/data/catalog";
import { useUI } from "@/store/ui";

/* ---------- utils ---------- */

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Подсветка ВСЕХ вхождений (регистронезависимо)
function highlightAll(text: string, q: string) {
  const t = text ?? "";
  const needle = (q || "").trim();
  if (!needle) return t;
  try {
    const re = new RegExp(`(${escapeRegExp(needle)})`, "ig");
    const parts = t.split(re);
    return (
      <>
        {parts.map((part, i) =>
          i % 2 === 1 ? (
            <mark key={i} className="rounded bg-cyan-500/20 px-0.5 text-inherit">
              {part}
            </mark>
          ) : (
            <React.Fragment key={i}>{part}</React.Fragment>
          )
        )}
      </>
    );
  } catch {
    return t;
  }
}

// Достаём уникальные фасеты из каталога (падать не будет, всё опционально)
const ALL_HAZARDS: string[] = Array.from(
  new Set(
    CATALOG.flatMap((c: any) => c.products ?? [])
      .flatMap((p: any) => p.hazards ?? p.ghs ?? [])
      .filter(Boolean)
  )
).slice(0, 16);

const ALL_SUPPLIERS: string[] = Array.from(
  new Set(
    CATALOG.flatMap((c: any) => c.products ?? [])
      .flatMap((p: any) => (p.offers ?? []).map((o: any) => o.seller))
      .filter(Boolean)
  )
).slice(0, 20);

// Бакеты «чистоты»; берём минимум как фильтр
const PURITY_BUCKETS = [
  { label: "≥ 99%", value: 99 },
  { label: "≥ 98%", value: 98 },
  { label: "≥ 95%", value: 95 },
  { label: "≥ 90%", value: 90 },
];

function getPurity(p: any): number {
  // пытаемся вытащить число из p.purity ("99.5%" или "99+") или из тэгов
  const src = String(p?.purity ?? "");
  const m =
    src.match(/(\d+(?:[\.,]\d+)?)\s*%/) ||
    src.match(/(\d+(?:[\.,]\d+)?)(?:\+)?\s*$/);
  if (m) return parseFloat(m[1].replace(",", "."));
  // поищем в тегах вида "99%" / "99.9%"
  const tagNum = (p?.tags ?? [])
    .map((t: string) => String(t))
    .map((t: string) => t.match(/(\d+(?:[\.,]\d+)?)\s*%/))
    .filter(Boolean)[0] as RegExpMatchArray | undefined;
  if (tagNum) return parseFloat(tagNum[1].replace(",", "."));
  return -1; // неизвестно
}

/* ---------- UI ---------- */

function Chip({
  active,
  children,
  onClick,
  title,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "rounded-xl px-2.5 py-1 text-xs transition",
        "ring-1 ring-white/12",
        active
          ? "bg-cyan-400/15 text-cyan-200 ring-cyan-300/30"
          : "bg-white/5 text-white/70 hover:bg-white/8"
      )}
    >
      {children}
    </button>
  );
}

/* ---------- main ---------- */

export default function SearchBar() {
  const ui = useUI() as any;

  const wrapRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<SmartResult[]>([]);
  const [active, setActive] = React.useState<number>(-1);

  // Фасеты
  const [hazards, setHazards] = React.useState<string[]>([]);
  const [suppliers, setSuppliers] = React.useState<string[]>([]);
  const [purityMin, setPurityMin] = React.useState<number | null>(null);

  // Глобальные хоткеи: "/" и Ctrl/Cmd+K → фокус на поле
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      const inField =
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.getAttribute("contenteditable") === "true");
      // "/" без модификаторов
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey && !inField) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      // Ctrl/Cmd+K
      if (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // клик вне — закрыть
  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // дебаунс + поиск
  React.useEffect(() => {
    setLoading(true);
    const id = setTimeout(() => {
      setResults(smartSearch(query, 24)); // берём побольше до фильтра
      setLoading(false);
    }, 120);
    return () => clearTimeout(id);
  }, [query]);

  // применяем фасеты
  const view: SmartResult[] = React.useMemo(() => {
    let arr = results;
    if (hazards.length || suppliers.length || purityMin !== null) {
      arr = arr.filter((r) => {
        if (r.doc.type !== "product") return true; // категории не фильтруем
        const p = r.doc.payload.product ?? {};
        // hazards
        if (hazards.length) {
          const list: string[] = (p.hazards ?? p.ghs ?? []) as string[];
          if (!list.some((h) => hazards.includes(h))) return false;
        }
        // suppliers
        if (suppliers.length) {
          const sells = (p.offers ?? []).map((o: any) => o.seller);
          if (!sells.some((s: string) => suppliers.includes(s))) return false;
        }
        // purity
        if (purityMin !== null) {
          const pur = getPurity(p);
          if (pur < 0 || pur < purityMin) return false;
        }
        return true;
      });
    }
    // ограничиваем финальную выдачу
    return arr.slice(0, 8);
  }, [results, hazards, suppliers, purityMin]);

  // держим активный индекс валидным
  React.useEffect(() => {
    setActive(view.length ? 0 : -1);
  }, [view.length]);

  const openProduct = (p: any) => {
    if (typeof ui.openProduct === "function") return ui.openProduct(p);
    if (typeof ui.setSelectedProduct === "function") ui.setSelectedProduct(p);
    if (typeof ui.setProduct === "function") ui.setProduct(p);
    if (typeof ui.setActiveModal === "function") ui.setActiveModal("product");
    if (typeof ui.setProductDialogOpen === "function") ui.setProductDialogOpen(true);
    if (typeof ui.openProductDialog === "function") ui.openProductDialog(true);
  };

  const openCategory = (c: any) => {
    if (typeof ui.openCategory === "function") return ui.openCategory(c.slug ?? c.title);
    if (typeof ui.setSelectedCategory === "function") ui.setSelectedCategory(c);
    if (typeof ui.setActiveModal === "function") ui.setActiveModal("category");
    if (typeof ui.setCategoryOverlayOpen === "function") ui.setCategoryOverlayOpen(true);
  };

  const select = (r: SmartResult) => {
    const d = r.doc;
    if (d.type === "product") openProduct(d.payload.product);
    else openCategory(d.payload);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) setOpen(true);
    if (!view.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % view.length);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + view.length) % view.length);
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const r = view[Math.max(0, active)];
      if (r) select(r);
    }
    if (e.key === "Escape") setOpen(false);
  };

  const toggle = (list: string[], set: (v: string[]) => void, v: string) => {
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  };

  return (
    <div ref={wrapRef} className="relative w-full max-w-3xl">
      {/* сам SearchBar */}
      <div
        className={cn(
          "flex items-center rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur",
          "px-4 py-3 text-base shadow-xl hover:ring-white/20",
          "focus-within:ring-cyan-400/40"
        )}
      >
        <SearchIcon className="mr-3 h-4 w-4 opacity-70" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Поиск по названию, CAS, назначению…"
          className="w-full bg-transparent placeholder:text-white/50 outline-none"
          aria-autocomplete="list"
          aria-controls="search-suggest"
          aria-expanded={open}
        />
        <button
          type="button"
          onClick={() => {
            if (view.length) select(view[0]);
          }}
          className="ml-3 rounded-xl border border-white/10 px-3 py-1.5 text-sm text-white/80 hover:bg-white/5"
        >
          Найти
        </button>
      </div>

      {/* стеклянный дропдаун-подсказки + фасеты */}
      {open && (
        <div
          id="search-suggest"
          role="listbox"
          className={cn(
            "absolute left-0 right-0 z-50 mt-2 max-h-[28rem] overflow-auto",
            "rounded-2xl bg-white/6 backdrop-blur-xl ring-1 ring-white/10 shadow-2xl"
          )}
        >
          {/* список результатов */}
          <div className="max-h-80 overflow-auto">
            {loading && <div className="px-4 py-3 text-sm text-white/70">Ищу…</div>}

            {!loading && query.trim() === "" && (
              <div className="px-4 py-3 text-sm text-white/60">Начните вводить запрос</div>
            )}

            {!loading && query.trim() !== "" && view.length === 0 && (
              <div className="px-4 py-3 text-sm text-white/70">Ничего не найдено</div>
            )}

            {!loading && view.length > 0 && (
              <ul className="py-1">
                {/* Товары */}
                {view.some((r) => r.doc.type === "product") && (
                  <li className="px-4 py-2 text-xs uppercase tracking-wide text-white/50">
                    Товары
                  </li>
                )}
                {view
                  .filter((r) => r.doc.type === "product")
                  .map((r, idx) => {
                    const p = r.doc.payload.product;
                    const cat = r.doc.payload.category;
                    const i = view.indexOf(r);
                    const isActive = active === i;
                    return (
                      <li key={`p-${p.id}-${idx}`}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          onMouseEnter={() => setActive(i)}
                          onClick={() => select(r)}
                          className={cn(
                            "flex w-full items-center gap-3 px-4 py-2 text-left",
                            "focus:outline-none",
                            isActive ? "bg-white/10" : "hover:bg-white/7.5"
                          )}
                        >
                          <div className="h-8 w-8 rounded bg-cyan-400/10 ring-1 ring-cyan-300/20" />
                          <div className="min-w-0">
                            <div className="truncate font-medium">
                              {highlightAll(p.title, query)}
                            </div>
                            <div className="truncate text-xs text-white/60">
                              {p.cas ? <>CAS: {highlightAll(p.cas, query)} · </> : null}
                              {cat?.title}
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}

                {/* Категории */}
                {view.some((r) => r.doc.type === "category") && (
                  <li className="px-4 py-2 text-xs uppercase tracking-wide text-white/50">
                    Категории
                  </li>
                )}
                {view
                  .filter((r) => r.doc.type === "category")
                  .map((r, idx) => {
                    const c = r.doc.payload;
                    const i = view.indexOf(r);
                    const isActive = active === i;
                    return (
                      <li key={`c-${c.slug ?? c.title}-${idx}`}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          onMouseEnter={() => setActive(i)}
                          onClick={() => select(r)}
                          className={cn(
                            "flex w-full items-center gap-3 px-4 py-2 text-left",
                            isActive ? "bg-white/10" : "hover:bg-white/7.5"
                          )}
                        >
                          <div className="h-8 w-8 rounded bg-white/5 ring-1 ring-white/10" />
                          <div className="truncate">{highlightAll(c.title, query)}</div>
                        </button>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>

          {/* фасеты (sticky внизу) */}
          <div className="sticky bottom-0 z-10 space-y-2 border-t border-white/10 bg-white/6 p-3 backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs uppercase tracking-wide text-white/50">
                GHS
              </span>
              {ALL_HAZARDS.slice(0, 8).map((h) => (
                <Chip
                  key={h}
                  active={hazards.includes(h)}
                  onClick={() => toggle(hazards, setHazards, h)}
                  title={`Опасность: ${h}`}
                >
                  {h}
                </Chip>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs uppercase tracking-wide text-white/50">
                Чистота
              </span>
              {PURITY_BUCKETS.map((b) => (
                <Chip
                  key={b.value}
                  active={purityMin === b.value}
                  onClick={() => setPurityMin(purityMin === b.value ? null : b.value)}
                  title={`Минимум ${b.label}`}
                >
                  {b.label}
                </Chip>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs uppercase tracking-wide text-white/50">
                Поставщик
              </span>
              {ALL_SUPPLIERS.slice(0, 8).map((s) => (
                <Chip
                  key={s}
                  active={suppliers.includes(s)}
                  onClick={() => toggle(suppliers, setSuppliers, s)}
                  title={`Поставщик: ${s}`}
                >
                  {s}
                </Chip>
              ))}
              {(hazards.length || suppliers.length || purityMin !== null) && (
                <button
                  type="button"
                  onClick={() => {
                    setHazards([]);
                    setSuppliers([]);
                    setPurityMin(null);
                  }}
                  className="ml-auto text-xs text-white/60 underline-offset-2 hover:underline"
                >
                  Сбросить фильтры
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
