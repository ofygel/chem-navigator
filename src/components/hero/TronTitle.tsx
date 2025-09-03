"use client";
import { motion } from "framer-motion";

export default function TronTitle() {
  return (
    <div className="relative mx-auto max-w-5xl px-4 text-center">
      <div className="pointer-events-none absolute -inset-x-24 -top-8 h-[160%] bg-[radial-gradient(ellipse_at_center,rgba(6,231,231,0.20),transparent_60%)] blur-2xl" />
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative text-4xl font-semibold tracking-tight md:text-6xl"
      >
        <span className="inline-block bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,255,255,0.75))] bg-clip-text text-transparent drop-shadow-[0_1px_20px_rgba(6,231,231,0.15)]">
          Навигатор химических продуктов
        </span>
        <span className="block h-[2px] w-full overflow-hidden">
          <span className="relative block h-[2px] w-full bg-white/10">
            <motion.span
              initial={{ x: "-20%" }}
              animate={{ x: "120%" }}
              transition={{ repeat: Infinity, duration: 3.2, ease: "linear" }}
              className="absolute left-0 top-0 h-[2px] w-1/4 bg-brand.cyan/70 blur-[1px]"
            />
          </span>
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-auto mt-4 max-w-3xl text-balance text-white/85"
      >
        Ищите по <strong>CAS</strong>, назначению и категориям — быстро и наглядно.
      </motion.p>
    </div>
  );
}
