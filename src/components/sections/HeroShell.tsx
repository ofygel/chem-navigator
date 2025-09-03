"use client";

import dynamic from "next/dynamic";
import TronTitle from "@/components/hero/TronTitle";
import SearchBar from "@/components/common/SearchBar";
import CategoryGrid from "@/components/category/CategoryGrid";
import { useT } from "@/lib/i18n";
import { useIsMobile } from "@/hooks/useIsMobile";

const HologramMolecule = dynamic(() => import("@/components/three/HologramMolecule"), { ssr: false });

export default function HeroShell() {
  const t = useT();
  const isMobile = useIsMobile();

  return (
    <section className="relative">
      <div className="absolute inset-0 -z-10">
        {!isMobile && <HologramMolecule />}
        <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-grid-16 opacity-[0.08]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_85%)]" />
      </div>

      <div className="mx-auto flex min-h-[66svh] w-full max-w-7xl flex-col items-center justify-center gap-6 px-4 text-center">
        <TronTitle />
        <SearchBar />
      </div>

      <div className="container mb-16 mt-10 space-y-6">
        <h2 className="text-xl font-medium text-white/90">{t("popular") || "Популярные разделы"}</h2>
        <CategoryGrid />
      </div>
    </section>
  );
}
