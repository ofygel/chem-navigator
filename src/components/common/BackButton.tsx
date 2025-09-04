"use client";
import { ChevronLeft } from "lucide-react";

export default function BackButton({
  onClick, label = "Назад", className = "",
}: { onClick: () => void; label?: string; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={
        "inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10 " +
        className
      }
    >
      <ChevronLeft className="h-4 w-4" />
      {label}
    </button>
  );
}
