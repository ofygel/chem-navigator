// src/components/sections/HeroShell.tsx
"use client";

import TronTitle from "@/components/hero/TronTitle";
import SearchBar from "@/components/common/SearchBar";
import CategoryGrid from "@/components/category/CategoryGrid";
// import { useIsMobile } from "@/hooks/useIsMobile"; // временно не нужен

export default function HeroShell() {
  // const isMobile = useIsMobile();

  return (
    <section className="relative">
      {/* Слой фона (только декоративные оверлеи поверх глобального R3F-фона) */}
      <div className="absolute inset-0">
        {/* лёгкие оверлеи (не перекрывают 3D) */}
        <div className="pointer-events-none absolute inset-0 z-[1] bg-grid-faint bg-grid-16 opacity-[0.05]" />
        <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.45)_85%)]" />
      </div>

      {/* Контент выше всего */}
      <div className="relative z-[3] mx-auto flex min-h-[66svh] w-full max-w-7xl flex-col items-center justify-center gap-6 px-4 text-center">
        <TronTitle />
        <SearchBar />
      </div>

      <div className="relative z-[3] container mb-16 mt-10 space-y-6">
        <h2 className="text-xl font-medium text-white/90">Популярные разделы</h2>
        <CategoryGrid />
      </div>
    </section>
  );
}
