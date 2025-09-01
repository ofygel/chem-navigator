// src/components/common/SearchBar.tsx
"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="relative mx-auto w-full max-w-3xl">
      {/* неоновый ореол */}
      <div className="pointer-events-none absolute -inset-x-10 -top-6 h-[140%] rounded-[3rem] bg-[radial-gradient(ellipse_at_center,rgba(6,231,231,0.18),transparent_60%)] blur-2xl" />
      <div className="relative z-10 mx-auto flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 p-2 shadow-glass backdrop-blur">
        <Search className="h-5 w-5 text-white/60" />
        <Input
          placeholder="Поиск по названию, CAS, назначению…"
          className="border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Button className="rounded-xl bg-brand.cyan/20 text-brand.cyan hover:bg-brand.cyan/30">
          Найти
        </Button>
      </div>
    </div>
  );
}
