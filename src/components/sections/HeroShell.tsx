//src/components/sections/HeroShell.tsx
"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useUI } from "@/store/ui";
import { useEffect } from "react";

// ВАЖНО: используем относительные пути, чтобы исключить ошибку TS2307
const HeroIntroCanvas = dynamic(
  () => import("../three/intro/HeroIntroCanvas"),
  { ssr: false }
);
const MoleculeHeroScene = dynamic(
  () => import("../three/hero/MoleculeHeroScene"),
  { ssr: false }
);

export default function HeroShell() {
  const { introDone, qualityMode, setQuality } = useUI();

  // Автовыбор "low", если пользователь отключил анимации
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (m.matches) setQuality("low");
  }, [setQuality]);

  return (
    <div className="relative h-[100svh] w-full overflow-hidden">
      {/* Переключатель качества */}
      <div className="pointer-events-auto absolute right-4 top-4 z-30">
        <button
          onClick={() => setQuality(qualityMode === "high" ? "low" : "high")}
          className="rounded-xl border border-white/15 bg-black/30 px-3 py-1.5 text-xs text-white/90 backdrop-blur hover:bg-black/40"
        >
          Качество: {qualityMode === "high" ? "Высокое" : "Лёгкое"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!introDone ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <HeroIntroCanvas />
          </motion.div>
        ) : (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <MoleculeHeroScene />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Логотип/бейдж */}
      <div className="pointer-events-none absolute inset-x-0 top-8 z-20 flex justify-center">
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="pointer-events-auto rounded-2xl border border-white/15 bg-black/40 px-5 py-2 text-center text-lg md:text-2xl text-white backdrop-blur"
        >
          Chem-Navigator
        </motion.div>
      </div>
    </div>
  );
}
