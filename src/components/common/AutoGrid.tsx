// src/components/common/AutoGrid.tsx
"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export default function AutoGrid({
  children,
  min = "14rem",
  className,
}: { children: React.ReactNode; min?: string; className?: string }) {
  return (
    <div
      className={cn(
        "grid gap-3",
        // repeat(auto-fill, minmax(..., 1fr))
        // tailwind произвольный класс:
        `grid-cols-[repeat(auto-fill,minmax(${min},1fr))]`,
        className
      )}
    >
      {children}
    </div>
  );
}
