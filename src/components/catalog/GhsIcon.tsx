// src/components/catalog/GhsIcon.tsx
import { cn } from "@/lib/utils";
import type { GHS } from "@/data/catalog";

const MAP: Record<GHS, string> = {
  flammable: "/ghs/flammable.svg",
  toxic: "/ghs/toxic.svg",
  irritant: "/ghs/irritant.svg",
  environment: "/ghs/environment.svg",
};

export default function GhsIcon({ code, className }: { code: GHS; className?: string }) {
  const src = MAP[code];
  if (!src) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={`GHS ${code}`} className={cn("h-4 w-4", className)} />;
}
