// src/components/sections/HeroShell.tsx
"use client";

import dynamic from "next/dynamic";
import SearchBar from "@/components/common/SearchBar";
import CategoryGrid from "@/components/category/CategoryGrid";

const HologramMolecule = dynamic(() => import("@/components/three/HologramMolecule"), { ssr: false });

export default function HeroShell() {
  return (
    <section className="relative">
      {/* Верхний hero-блок с 3D */}
      <div className="relative mx-auto flex min-h-[70svh] w-full max-w-7xl items-center justify-center">
        {/* 3D-панель (обновлённый блок) */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0">
            <HologramMolecule />
          </div>
          {/* тонкая виньетка и сетка, чтобы фон не был «пустым» */}
          <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-grid-16 opacity-[0.12]"></div>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_85%)]" />
        </div>

        {/* Заголовок и поиск поверх 3D */}
        <div className="z-10 mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center">
          <h1 className="text-3xl font-semibold md:text-5xl">
            Chem-Navigator
          </h1>
          <p className="max-w-2xl text-balance text-white/80">
            Профессиональный маркетплейс химических продуктов. Ищите по CAS, назначению, категории — быстро и наглядно.
          </p>
          <SearchBar />
        </div>
      </div>

      {/* Разделы */}
      <div className="container mb-16 mt-10 space-y-6">
        <h2 className="text-xl font-medium text-white/90">Популярные разделы</h2>
        <CategoryGrid />
      </div>
    </section>
  );
}
