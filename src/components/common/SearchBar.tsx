"use client";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Search } from "lucide-react";
import { CATALOG } from "@/data/catalog";
import { useUI } from "@/store/ui";
import { useT } from "@/lib/i18n";

export default function SearchBar() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const { openProduct } = useUI();
  const t = useT();

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return CATALOG.flatMap(c => c.products)
      .filter(p => p.title.toLowerCase().includes(s) || (p.cas && p.cas.toLowerCase().includes(s)))
      .slice(0, 8);
  }, [q]);

  useEffect(() => setOpen(q.length > 1 && results.length > 0), [q, results.length]);

  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <div className="pointer-events-none absolute -inset-x-10 -top-6 h-[140%] rounded-[3rem] bg-[radial-gradient(ellipse_at_center,rgba(6,231,231,0.18),transparent_60%)] blur-2xl" />
      <div className="relative z-10 mx-auto flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-2 shadow-glass backdrop-blur">
        <Search className="h-5 w-5 text-white/60" />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("searchPlaceholder") || "Поиск по названию, CAS, назначению…"}
              className="border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <Command>
              <CommandList>
                <CommandEmpty>Ничего не найдено</CommandEmpty>
                <CommandGroup heading="Товары">
                  {results.map(r => (
                    <CommandItem key={r.id} value={r.title} onSelect={() => { setOpen(false); setQ(""); openProduct(r.id); }}>
                      <span className="truncate">{r.title}</span>
                      {r.cas && <span className="ml-2 text-xs text-white/60">CAS {r.cas}</span>}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Button className="rounded-xl bg-brand.cyan/20 text-brand.cyan hover:bg-brand.cyan/30" onClick={() => results[0] && openProduct(results[0].id)}>
          Найти
        </Button>
      </div>
    </div>
  );
}
