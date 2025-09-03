// src/components/category/CategoryCard.tsx
"use client";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useUI } from "@/store/ui";

type Props = { title: string; desc?: string; slug: string; image?: string; className?: string };

export default function CategoryCard({ title, desc, slug, image, className }: Props) {
  const { openCategory, setHoverCategory, addHeat } = useUI();

  return (
    <button
      type="button"
      onClick={() => { openCategory(slug); addHeat(0.6); }}
      onMouseEnter={() => { setHoverCategory(slug); addHeat(0.15); }}
      onMouseLeave={() => setHoverCategory(null)}
      className={cn(
        "group relative block overflow-hidden rounded-2xl border border-white/10 bg-black/30 text-left holo-halo transition-colors hover:bg-black/40",
        className
      )}
    >
      {image ? (
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover opacity-[0.82] transition group-hover:opacity-100"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-brand.blue/15 via-brand.cyan/10 to-transparent" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
      <div className="relative z-10 flex h-full flex-col justify-end p-5">
        <div className="text-xl font-semibold drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">{title}</div>
        {desc ? (
          <div className="mt-1 text-sm text-white/85 drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">{desc}</div>
        ) : null}
        <div className="mt-3 text-sm text-brand.cyan/90 opacity-0 transition-opacity group-hover:opacity-100">
          Открыть →
        </div>
      </div>
      <div className="holo-scan holo-vignette absolute inset-0" />
    </button>
  );
}
