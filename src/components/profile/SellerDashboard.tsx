// src/components/profile/SellerDashboard.tsx
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AutoGrid from "@/components/common/AutoGrid";
import { useUI } from "@/store/ui";
import { useSellerStore, type Availability, type PublishState } from "@/store/seller";
import { getLargeCatalog } from "@/data/catalogLarge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Settings, Package, Layers3, Search, Filter, ChevronLeft, ChevronRight,
  Upload, Download, Plus, Trash2, CheckCircle2, XCircle, Gauge, X
} from "lucide-react";
import { parseCSV, toCSV, downloadTextFile, matchProduct } from "@/lib/csvPrice";
import BackButton from "@/components/common/BackButton";
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue
} from "@/components/ui/select";

/* ---------- безопасный парсинг чисел ---------- */
const toPrice = (s: string) => {
  const v = s.replace(/\s+/g, "").replace(",", ".").replace(/[^\d.]/g, "");
  if (v === "" || v === ".") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};
const toQty = (s: string) => {
  const v = s.replace(/[^\d]/g, "");
  if (!v) return undefined;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : undefined;
};
const showNum = (n: unknown) => (typeof n === "number" && Number.isFinite(n)) ? String(n) : "";

/* ---------- общие типы ---------- */
type UIProduct = { id: string; title: string; cas?: string; purity?: string | number };
type UICategory = { slug: string; title: string; products: UIProduct[] };

/* ---------- метрики ---------- */
function Metrics() {
  const { offersByProduct } = useSellerStore();
  const values = Object.values(offersByProduct);
  const total = values.length;
  const published = values.filter((o) => o.state === "published").length;
  const inStock = values.filter((o) => (o.availability ?? "in-stock") === "in-stock").length;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
        <div className="text-sm text-white/60">Включено позиций</div>
        <div className="mt-1 text-2xl font-semibold tabular-nums">{total}</div>
      </div>
      <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
        <div className="text-sm text-white/60">Опубликовано</div>
        <div className="mt-1 text-2xl font-semibold tabular-nums">{published}</div>
      </div>
      <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
        <div className="text-sm text-white/60">В наличии</div>
        <div className="mt-1 text-2xl font-semibold tabular-nums">{inStock}</div>
      </div>
    </div>
  );
}

/* ---------- плитки категорий ---------- */
function CategoryTiles({ cats, onPick }: { cats: UICategory[]; onPick: (c: UICategory) => void }) {
  const palette = ["from-cyan-400/15","from-emerald-400/15","from-blue-400/15","from-indigo-400/15","from-teal-400/15","from-violet-400/15"];
  return (
    <AutoGrid min="16rem">
      {cats.map((c, i) => (
        <button
          key={c.slug}
          onClick={() => onPick(c)}
          className="group overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 transition hover:bg-white/8 hover:ring-white/20"
        >
          <div className={`h-24 w-full bg-gradient-to-br ${palette[i % palette.length]} to-transparent`} />
          <div className="flex items-center justify-between p-4">
            <div>
              <div className="text-left text-base font-medium">{c.title}</div>
              <div className="text-left text-xs text-white/60">{c.products.length} позиций</div>
            </div>
            <ChevronRight className="h-5 w-5 opacity-60 transition group-hover:translate-x-0.5" />
          </div>
        </button>
      ))}
    </AutoGrid>
  );
}

/* ---------- панель массовых действий ---------- */
function BulkBar({
  selected, onClear, onSet, onPublish, onUnpublish,
}: {
  selected: Set<string>;
  onClear: () => void;
  onSet: (patch: { price?: number; currency?: string; pack?: string; qty?: number; leadTime?: string; availability?: Availability; state?: PublishState }) => void;
  onPublish: () => void;
  onUnpublish: () => void;
}) {
  const [price, setPrice] = React.useState("");
  const [currency, setCurrency] = React.useState("");
  const [pack, setPack] = React.useState("");
  const [qty, setQty] = React.useState("");
  const [lead, setLead] = React.useState("");
  // sentinel "none" вместо пустой строки — чтобы не ломать Radix Select
  const [av, setAv] = React.useState<Availability | "none">("none");

  if (selected.size === 0) return null;
  return (
    <div className="sticky top-[68px] z-10 -mt-2 mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-white/6 p-3 ring-1 ring-white/10 backdrop-blur-xl">
      <div className="text-sm text-white/80">Выбрано: {selected.size}</div>
      <Input className="w-24 bg-white/5 text-white placeholder:text-white/60 ring-1 ring-white/10" placeholder="Цена" value={price} onChange={(e) => setPrice(e.target.value)} />
      <Input className="w-24 bg-white/5 text-white placeholder:text-white/60 ring-1 ring-white/10" placeholder="Валюта" value={currency} onChange={(e) => setCurrency(e.target.value)} />
      <Input className="w-28 bg-white/5 text-white placeholder:text-white/60 ring-1 ring-white/10" placeholder="Упаковка" value={pack} onChange={(e) => setPack(e.target.value)} />
      <Input className="w-24 bg-white/5 text-white placeholder:text-white/60 ring-1 ring-white/10" placeholder="Остаток" value={qty} onChange={(e) => setQty(e.target.value)} />
      <Input className="w-28 bg-white/5 text-white placeholder:text-white/60 ring-1 ring-white/10" placeholder="Срок" value={lead} onChange={(e) => setLead(e.target.value)} />

      <Select value={av} onValueChange={(v: Availability | "none") => setAv(v)}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Наличие…" />
        </SelectTrigger>
        <SelectContent className="backdrop-blur-xl border-white/10 bg-black/70 text-white">
          <SelectItem value="none">—</SelectItem>
          <SelectItem value="in-stock">В наличии</SelectItem>
          <SelectItem value="preorder">Под заказ</SelectItem>
          <SelectItem value="out-of-stock">Нет в наличии</SelectItem>
        </SelectContent>
      </Select>

      <Button
        onClick={() =>
          onSet({
            price: toPrice(price),
            currency: currency || undefined,
            pack: pack || undefined,
            qty: toQty(qty),
            leadTime: lead || undefined,
            availability: av === "none" ? undefined : (av as Availability),
          })
        }
        className="rounded-xl bg-cyan-400/20 text-cyan-200 hover:bg-cyan-400/30"
      >
        Применить
      </Button>
      <Button variant="ghost" onClick={onPublish}><CheckCircle2 className="mr-1 h-4 w-4" /> Опубликовать</Button>
      <Button variant="ghost" onClick={onUnpublish}><XCircle className="mr-1 h-4 w-4" /> Снять с публикации</Button>
      <Button variant="ghost" onClick={onClear}>Снять выбор</Button>
    </div>
  );
}

/* ---------- строка товара ---------- */
function ProductRow({ p }: { p: UIProduct }) {
  const { offersByProduct, upsertOffer, removeOffer, setOfferField } = useSellerStore();
  const o = offersByProduct[p.id];
  const enabled = !!o;

  return (
    <div className="grid grid-cols-1 items-start gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 md:grid-cols-[minmax(12rem,1fr)_auto_auto_auto_auto_auto_auto]">
      <div>
        <div className="font-medium">{p.title}</div>
        <div className="text-xs text-white/60">{p.cas ? `CAS ${p.cas}` : p.purity != null ? `Чистота ${p.purity}` : ""}</div>
      </div>

      <label className="flex items-center gap-2 justify-self-end">
        <input
          type="checkbox"
          className="h-4 w-4 accent-cyan-400"
          checked={enabled}
          onChange={(e) => (e.target.checked ? upsertOffer(p.id, {}) : removeOffer(p.id))}
        />
        <span className="text-sm">продаю</span>
      </label>

      {/* Цена */}
      <Input
        className="w-28 justify-self-end bg-white/5 text-white placeholder:text-white/60 ring-1 ring-white/10"
        placeholder="Цена"
        value={showNum(o?.price)}
        onChange={(e) => upsertOffer(p.id, { price: toPrice(e.target.value) })}
      />
      {/* Валюта */}
      <Input
        className="w-20 justify-self-end bg-white/5 text-white placeholder:text-white/60 ring-1 ring-white/10"
        placeholder="₸"
        value={o?.currency ?? ""}
        onChange={(e) => upsertOffer(p.id, { currency: e.target.value })}
      />
      {/* Упаковка */}
      <Input
        className="w-24 justify-self-end bg-white/5 text-white placeholder:text-white/60 ring-1 ring-white/10"
        placeholder="Упак."
        value={o?.pack ?? ""}
        onChange={(e) => upsertOffer(p.id, { pack: e.target.value })}
      />
      {/* Остаток */}
      <Input
        className="w-20 justify-self-end bg-white/5 text-white placeholder:text-white/60 ring-1 ring-white/10"
        placeholder="Ост."
        value={showNum(o?.qty)}
        onChange={(e) => upsertOffer(p.id, { qty: toQty(e.target.value) })}
      />
      {/* Срок */}
      <Input
        className="w-28 justify-self-end bg-white/5 text-white placeholder:text-white/60 ring-1 ring-white/10"
        placeholder="Срок"
        value={o?.leadTime ?? ""}
        onChange={(e) => upsertOffer(p.id, { leadTime: e.target.value })}
      />

      {/* Наличие — Radix Select */}
      <Select
        value={o?.availability ?? "in-stock"}
        onValueChange={(v: Availability) => setOfferField(p.id, "availability", v)}
      >
        <SelectTrigger className="w-40 justify-self-end">
          <SelectValue placeholder="Наличие…" />
        </SelectTrigger>
        <SelectContent className="backdrop-blur-xl border-white/10 bg-black/70 text-white">
          <SelectItem value="in-stock">В наличии</SelectItem>
          <SelectItem value="preorder">Под заказ</SelectItem>
          <SelectItem value="out-of-stock">Нет в наличии</SelectItem>
        </SelectContent>
      </Select>

      <div className="justify-self-end">
        {o?.state === "published" ? (
          <Badge className="bg-emerald-400/20 text-emerald-200">Опубликован</Badge>
        ) : (
          <Badge variant="secondary">Черновик</Badge>
        )}
      </div>
    </div>
  );
}

/* ---------- список товаров в категории ---------- */
function ProductPicker({ cat, onBack }: { cat: UICategory; onBack: () => void }) {
  const [q, setQ] = React.useState("");
  const [onlyMine, setOnlyMine] = React.useState(false);
  const [visible, setVisible] = React.useState(12);
  const { offersByProduct, bulkUpsertOffers, publish, unpublish } = useSellerStore();

  const filtered = React.useMemo(() => {
    let arr = cat.products;
    if (q.trim()) {
      const qq = q.toLowerCase();
      arr = arr.filter((p) => (p.title || "").toLowerCase().includes(qq) || (p.cas || "").toLowerCase().includes(qq));
    }
    if (onlyMine) arr = arr.filter((p) => !!offersByProduct[p.id]);
    return arr;
  }, [cat.products, q, onlyMine, offersByProduct]);

  const slice = filtered.slice(0, visible);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <button onClick={onBack} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-1.5 text-sm hover:bg-white/10">
          <ChevronLeft className="h-4 w-4" /> К разделам
        </button>
        <div className="text-sm text-white/70">{filtered.length} позиций</div>
      </div>

      <div className="mb-3 grid gap-2 md:grid-cols-[1fr_auto_auto]">
        <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <Search className="mr-2 h-4 w-4 opacity-70" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Искать по названию/CAS…"
            className="w-full bg-transparent placeholder:text-white/60 outline-none"
          />
        </div>
        <label className="flex items-center justify-end gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
          <Filter className="h-4 w-4 opacity-70" />
          <input type="checkbox" className="h-4 w-4 accent-cyan-400" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} />
          Только мои
        </label>
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={() => setSelected(new Set(slice.map((p) => p.id)))}>Выбрать видимые</Button>
          <Button variant="ghost" onClick={() => setSelected(new Set())}>Снять выбор</Button>
        </div>
      </div>

      <BulkBar
        selected={selected}
        onClear={() => setSelected(new Set())}
        onSet={(patch) => { if (selected.size) bulkUpsertOffers(Array.from(selected), patch); }}
        onPublish={() => { if (selected.size) publish(Array.from(selected)); }}
        onUnpublish={() => { if (selected.size) unpublish(Array.from(selected)); }}
      />

      <div className="space-y-2">
        {slice.map((p) => (
          <div key={p.id} className="relative pl-14">
            <label className="absolute left-2 top-1.5 z-10 inline-flex items-center gap-2 rounded-lg bg-black/30 px-2 py-1.5 ring-1 ring-white/10">
              <input
                type="checkbox"
                className="h-4 w-4 accent-cyan-400"
                checked={selected.has(p.id)}
                onChange={(e) => {
                  const copy = new Set(selected);
                  if (e.target.checked) copy.add(p.id);
                  else copy.delete(p.id);
                  setSelected(copy);
                }}
              />
              <span className="text-xs text-white/80">выбрать</span>
            </label>
            <ProductRow p={p} />
          </div>
        ))}
      </div>

      {slice.length < filtered.length && (
        <div className="mt-4 text-center">
          <Button onClick={() => setVisible((v) => v + 24)} className="rounded-xl bg-cyan-400/20 text-cyan-200 hover:bg-cyan-400/30">
            Показать ещё
          </Button>
        </div>
      )}
    </div>
  );
}

/* ---------- онбординг ---------- */
function Onboarding({ onStart }: { onStart: () => void }) {
  const { me } = useSellerStore();
  const hasContacts = !!(me.name && (me.email || me.phone || me.telegram));
  return (
    <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
      <div className="mb-4 flex items-center gap-3 text-lg font-medium">
        <Gauge className="h-5 w-5 opacity-70" /> Быстрый старт продавца
      </div>
      <ol className="space-y-2 text-sm">
        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Заполните контакты в «Настройках»</li>
        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Выберите раздел каталога</li>
        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Отметьте товары и задайте цены</li>
      </ol>
      <div className="mt-4 flex gap-2">
        <Button onClick={onStart} className="rounded-xl bg-cyan-400/20 text-cyan-200 hover:bg-cyan-400/30">Перейти к каталогу</Button>
        {!hasContacts && <span className="text-xs text-white/60">Контакты лучше заполнить сразу — они будут видны покупателям.</span>}
      </div>
    </div>
  );
}

/* ---------- настройки ---------- */
function SettingsPane() {
  const { me, setProfile, defaults, setDefaults, clearAll } = useSellerStore();
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
        <div className="mb-2 text-sm text-white/70">Контакты продавца</div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Input placeholder="Название магазина" value={me.name ?? ""} onChange={(e) => setProfile({ name: e.target.value })} />
          <Input placeholder="Email" value={me.email ?? ""} onChange={(e) => setProfile({ email: e.target.value })} />
          <Input placeholder="Телефон" value={me.phone ?? ""} onChange={(e) => setProfile({ phone: e.target.value })} />
          <Input placeholder="Telegram" value={me.telegram ?? ""} onChange={(e) => setProfile({ telegram: e.target.value })} />
        </div>
      </div>

      <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
        <div className="mb-2 text-sm text-white/70">Значения по умолчанию для новых позиций</div>
        <div className="grid gap-2 sm:grid-cols-5">
          <Input placeholder="Валюта" value={defaults.currency} onChange={(e) => setDefaults({ currency: e.target.value })} />
          <Input placeholder="Упаковка" value={defaults.pack} onChange={(e) => setDefaults({ pack: e.target.value })} />
          <Input placeholder="Срок" value={defaults.leadTime} onChange={(e) => setDefaults({ leadTime: e.target.value })} />

          <Select
            value={defaults.availability}
            onValueChange={(v: Availability) => setDefaults({ availability: v as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="backdrop-blur-xl border-white/10 bg-black/70 text-white">
              <SelectItem value="in-stock">В наличии</SelectItem>
              <SelectItem value="preorder">Под заказ</SelectItem>
              <SelectItem value="out-of-stock">Нет в наличии</SelectItem>
            </SelectContent>
          </Select>

          <select
            className="rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-sm"
            value={defaults.state}
            onChange={(e) => setDefaults({ state: e.target.value as any })}
          >
            <option value="draft">Черновик</option>
            <option value="published">Опубликован</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
        <div className="mb-2 text-sm text-white/70">Сервис</div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => clearAll()}>
            <Trash2 className="mr-1 h-4 w-4" /> Очистить мои предложения
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- «Мои товары» ---------- */
function MyProductsPane() {
  const { offersByProduct, setOfferField, removeOffer, publish, unpublish } = useSellerStore();
  const entries = Object.entries(offersByProduct);
  const [q, setQ] = React.useState("");
  const cats = getLargeCatalog() as UICategory[];
  const map = React.useMemo(() => {
    const m = new Map<string, UIProduct>();
    cats.forEach((c) => c.products.forEach((p) => m.set(p.id, p)));
    return m;
  }, [cats]);

  const filtered = entries.filter(([pid]) => {
    if (!q.trim()) return true;
    const p = map.get(pid);
    const s = (p?.title ?? "") + " " + (p?.cas ?? "");
    return s.toLowerCase().includes(q.toLowerCase());
  });

  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  return (
    <div className="space-y-3">
      <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-3 py-2">
        <Search className="mr-2 h-4 w-4 opacity-70" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Искать по моим товарам…"
          className="w-full bg-transparent placeholder:text-white/60 outline-none"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" onClick={() => setSelected(new Set(filtered.map(([id]) => id)))}>Выбрать всё</Button>
        <Button variant="ghost" onClick={() => setSelected(new Set())}>Снять выбор</Button>
        <Button onClick={() => publish(Array.from(selected))}><CheckCircle2 className="mr-1 h-4 w-4" /> Опубликовать</Button>
        <Button variant="ghost" onClick={() => unpublish(Array.from(selected))}><XCircle className="mr-1 h-4 w-4" /> Снять с публикации</Button>
      </div>

      <div className="space-y-2">
        {filtered.map(([pid, o]) => {
          const p = map.get(pid);
          return (
            <div key={pid} className="grid grid-cols-1 items-center gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 md:grid-cols-[minmax(12rem,1fr)_auto_auto_auto_auto_auto]">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-cyan-400"
                  checked={selected.has(pid)}
                  onChange={(e) => {
                    const copy = new Set(selected);
                    if (e.target.checked) copy.add(pid);
                    else copy.delete(pid);
                    setSelected(copy);
                  }}
                />
                <div>
                  <div className="font-medium">{p?.title ?? pid}</div>
                  <div className="text-xs text-white/60">{p?.cas ?? ""}</div>
                </div>
              </label>

              <select
                className="w-36 justify-self-end rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-sm"
                value={o.availability ?? "in-stock"}
                onChange={(e) => setOfferField(pid, "availability", e.target.value)}
              >
                <option value="in-stock">В наличии</option>
                <option value="preorder">Под заказ</option>
                <option value="out-of-stock">Нет в наличии</option>
              </select>

              <div className="justify-self-end">
                {o.state === "published" ? (
                  <Badge className="bg-emerald-400/20 text-emerald-200">Опубликован</Badge>
                ) : (
                  <Badge variant="secondary">Черновик</Badge>
                )}
              </div>

              <div className="justify-self-end text-sm text-white/60">{o.price?.toLocaleString("ru-RU")} {o.currency}</div>
              <div className="justify-self-end text-sm text-white/60">{o.pack}</div>
              <div className="justify-self-end">
                <Button variant="ghost" onClick={() => removeOffer(pid)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Кастомный SKU ---------- */
function CustomSkuPane() {
  const { addCustomProduct, upsertOffer } = useSellerStore();
  const [title, setTitle] = React.useState("");
  const [cas, setCas] = React.useState("");

  function add() {
    const t = title.trim();
    if (!t) return;
    const id = `custom:${Date.now()}`;
    addCustomProduct({ id, title: t, cas: cas.trim() || undefined });
    upsertOffer(id, {}); // сразу включить с дефолтами
    setTitle(""); setCas("");
    alert("Кастомный SKU добавлен. Он виден в «Моих товарах» и попадёт в экспорт CSV.");
  }

  return (
    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
      <div className="mb-2 text-sm text-white/70">Добавить кастомный SKU (вне предзашитого каталога)</div>
      <div className="grid gap-2 sm:grid-cols-[1fr_14rem_auto]">
        <Input placeholder="Название*" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input placeholder="CAS (опционально)" value={cas} onChange={(e) => setCas(e.target.value)} />
        <Button onClick={add}><Plus className="mr-1 h-4 w-4" /> Добавить</Button>
      </div>
      <div className="mt-2 text-xs text-white/60">Примечание: кастомные SKU пока видны только вам (до интеграции с бэкендом).</div>
    </div>
  );
}

/* ---------- CSV Импорт/Экспорт ---------- */
function CsvPane() {
  const { offersByProduct, customProducts, bulkUpsertOffers } = useSellerStore();

  const onExport = () => {
    const cats = getLargeCatalog() as UICategory[];
    const map = new Map<string, UIProduct>();
    cats.forEach((c) => c.products.forEach((p) => map.set(p.id, p)));
    const rows = Object.entries(offersByProduct).map(([pid, o]) => {
      const p = map.get(pid) ?? customProducts[pid];
      return {
        productId: pid,
        title: p?.title ?? "",
        cas: p?.cas ?? "",
        price: String(o.price ?? ""),
        currency: o.currency ?? "",
        pack: o.pack ?? "",
        qty: String(o.qty ?? ""),
        leadTime: o.leadTime ?? "",
        availability: o.availability ?? "",
        state: o.state ?? "",
      };
    });
    downloadTextFile("price-export.csv", toCSV(rows));
  };

  const [preview, setPreview] = React.useState<{ ok: number; fail: number; matched: Array<{ row: any; productId: string }> }>({ ok: 0, fail: 0, matched: [] });

  const onImportFile = async (file: File) => {
    const text = await file.text();
    const rows = parseCSV(text);
    const matched: Array<{ row: any; productId: string }> = [];
    let fail = 0;
    for (const r of rows) {
      const pid = matchProduct(r);
      if (pid) matched.push({ row: r, productId: pid });
      else fail++;
    }
    setPreview({ ok: matched.length, fail, matched });
  };

  const applyImport = () => {
    if (!preview.matched.length) return;
    const ids: string[] = [];
    const patchById: Record<string, any> = {};
    for (const m of preview.matched) {
      const r = m.row;
      ids.push(m.productId);
      patchById[m.productId] = {
        price: r.price ? Number(r.price) : undefined,
        currency: r.currency || undefined,
        pack: r.pack || undefined,
        qty: r.qty ? Number(r.qty) : undefined,
        leadTime: r.leadTime || undefined,
        availability: r.availability || undefined,
        state: r.state || undefined,
      };
    }
    ids.forEach((id) => {
      bulkUpsertOffers([id], patchById[id]);
    });
    alert(`Импорт применён: ${preview.ok} позиций обновлено${preview.fail ? `, не сопоставлено: ${preview.fail}` : ""}.`);
    setPreview({ ok: 0, fail: 0, matched: [] });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
        <div className="mb-2 text-sm text-white/70">Экспорт прайса</div>
        <Button onClick={onExport}><Download className="mr-1 h-4 w-4" /> Скачать CSV</Button>
      </div>

      <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
        <div className="mb-2 text-sm text-white/70">Импорт прайса (CSV)</div>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onImportFile(f);
          }}
        />
        {preview.ok + preview.fail > 0 && (
          <div className="mt-3 rounded-xl bg-white/4 p-3 ring-1 ring-white/10">
            <div className="text-sm">Готово к применению: {preview.ok} · Не найдено: {preview.fail}</div>
            <div className="mt-2 text-xs text-white/60">
              Поддерживаемые колонки: productId, title, cas, price, currency, pack, qty, leadTime, availability, state.  
              Сопоставление: по productId → CAS → названию (точное совпадение).
            </div>
            <div className="mt-3">
              <Button onClick={applyImport} className="rounded-xl bg-cyan-400/20 text-cyan-200 hover:bg-cyan-400/30">
                Применить импорт
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- основной компонент ---------- */
export default function SellerDashboard() {
  const { activeModal, closeModal } = useUI() as any;
  const open = activeModal === "sellerDashboard";

  const cats = getLargeCatalog(500) as UICategory[];
  const [tab, setTab] = React.useState<"overview" | "catalog" | "my" | "settings" | "csv">("overview");
  const [picked, setPicked] = React.useState<UICategory | null>(null);
  const { onboardingDone, setOnboardingDone } = useSellerStore();

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? closeModal() : null)}>
      <DialogContent className="max-w-7xl p-0 max-h-[90vh] overflow-y-auto overscroll-contain">
        <DialogHeader className="sticky top-0 z-10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {(tab === "catalog" && picked) && <BackButton onClick={() => setPicked(null)} />}
              <DialogTitle>Кабинет продавца</DialogTitle>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant={tab === "overview" ? "default" : "ghost"} onClick={() => setTab("overview")} className="rounded-xl">
                <Package className="mr-2 h-4 w-4" /> Обзор
              </Button>
              <Button variant={tab === "catalog" ? "default" : "ghost"} onClick={() => setTab("catalog")} className="rounded-xl">
                <Layers3 className="mr-2 h-4 w-4" /> Каталог
              </Button>
              <Button variant={tab === "my" ? "default" : "ghost"} onClick={() => setTab("my")} className="rounded-xl">
                Мои товары
              </Button>
              <Button variant={tab === "csv" ? "default" : "ghost"} onClick={() => setTab("csv")} className="rounded-xl">
                <Upload className="mr-2 h-4 w-4" /> CSV
              </Button>
              <Button variant={tab === "settings" ? "default" : "ghost"} onClick={() => setTab("settings")} className="rounded-xl">
                <Settings className="mr-2 h-4 w-4" /> Настройки
              </Button>

              {/* Крестик — закрыть */}
              <DialogClose asChild>
                <button
                  className="rounded-xl border border-white/10 bg-white/5 p-2 hover:bg-white/10"
                  aria-label="Закрыть"
                >
                  <X className="h-4 w-4" />
                </button>
              </DialogClose>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 p-6">
          <Metrics />

          <AnimatePresence mode="wait">
            {tab === "overview" && (
              <motion.div key="tab-overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-4">
                {!onboardingDone && <Onboarding onStart={() => { setTab("catalog"); setOnboardingDone(true); }} />}
                <CustomSkuPane />
                <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <div className="mb-2 text-sm text-white/70">Быстрые действия</div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => setTab("catalog")} className="rounded-xl bg-cyan-400/20 text-cyan-200 hover:bg-cyan-400/30">К выбору товаров</Button>
                    <Button variant="ghost" onClick={() => setTab("my")}>Открыть «Мои товары»</Button>
                    <Button variant="ghost" onClick={() => setTab("csv")}><Upload className="mr-1 h-4 w-4" /> Импорт/экспорт CSV</Button>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === "catalog" && (
              <motion.div key="tab-catalog" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-4">
                <AnimatePresence mode="wait">
                  {!picked ? (
                    <motion.div key="view-tiles" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                      <CategoryTiles cats={cats} onPick={(c) => setPicked(c)} />
                    </motion.div>
                  ) : (
                    <motion.div key="view-list" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                      <ProductPicker cat={picked} onBack={() => setPicked(null)} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {tab === "my" && (
              <motion.div key="tab-my" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <MyProductsPane />
              </motion.div>
            )}

            {tab === "csv" && (
              <motion.div key="tab-csv" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <CsvPane />
              </motion.div>
            )}

            {tab === "settings" && (
              <motion.div key="tab-settings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <SettingsPane />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
