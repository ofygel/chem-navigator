"use client";

import Link from "next/link";
import { ShoppingCart, User, Mail } from "lucide-react";
import { useUI } from "@/store/ui";
import { cn } from "@/lib/utils";

export default function Header() {
  const { openModal, locale, setLocale } = useUI();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
        <Link href="/" className="group inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-brand.cyan/80 shadow-[0_0_16px_rgba(6,231,231,0.45)]" />
          <span className="text-sm font-semibold tracking-wide text-white/90 group-hover:text-white">
            Chem-Navigator
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-xl border border-white/15">
            <button
              onClick={() => setLocale("ru")}
              className={cn(
                "px-3 py-1.5 text-xs",
                locale === "ru" ? "bg-brand.cyan/20 text-brand.cyan" : "text-white/70 hover:bg-white/5"
              )}
            >
              RU
            </button>
            <button
              onClick={() => setLocale("kk")}
              className={cn(
                "px-3 py-1.5 text-xs",
                locale === "kk" ? "bg-brand.cyan/20 text-brand.cyan" : "text-white/70 hover:bg-white/5"
              )}
            >
              KZ
            </button>
          </div>

          <button
            onClick={() => openModal("contacts")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-white/80 hover:bg-white/5"
            aria-label="Контакты"
          >
            <Mail className="h-4 w-4" />
          </button>

          <button
            onClick={() => openModal("profile")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-white/80 hover:bg-white/5"
            aria-label="Профиль"
          >
            <User className="h-4 w-4" />
          </button>

          <button
            onClick={() => openModal("cart")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-brand.cyan/30 bg-brand.cyan/15 text-brand.cyan hover:bg-brand.cyan/25"
            aria-label="Корзина"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
