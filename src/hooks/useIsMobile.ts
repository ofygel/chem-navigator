// src/hooks/useIsMobile.ts
"use client";
import { useEffect, useState } from "react";
export function useIsMobile(breakpoint = 768) {
  const [isMobile, set] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width:${breakpoint - 1}px)`);
    const onChange = () => set(mql.matches);
    onChange(); mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);
  return isMobile;
}
