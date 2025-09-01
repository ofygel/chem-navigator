// src/components/category/CategoryCard.tsx
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  desc?: string;
  href: string;
  image?: string; // путь из /public
  className?: string;
};

export default function CategoryCard({ title, desc, href, image, className }: Props) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative block overflow-hidden rounded-2xl border border-white/10 bg-black/30",
        "holo-halo transition-colors hover:bg-black/40",
        className
      )}
    >
      {/* фон */}
      {image ? (
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover opacity-[0.82] transition group-hover:opacity-100"
          priority={false}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-brand.blue/15 via-brand.cyan/10 to-transparent" />
      )}

      {/* затемнение для читабельности */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

      {/* контент */}
      <div className="relative z-10 flex h-full flex-col justify-end p-5">
        <div className="text-xl font-semibold tracking-wide drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">
          {title}
        </div>
        {desc ? (
          <div className="mt-1 text-sm text-white/85 drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">
            {desc}
          </div>
        ) : null}
        <div className="mt-3 text-sm text-brand.cyan/90 opacity-0 transition-opacity group-hover:opacity-100">
          Открыть →
        </div>
      </div>

      {/* скан-линии + лёгкая виньетка */}
      <div className="holo-scan holo-vignette absolute inset-0"></div>
    </Link>
  );
}
