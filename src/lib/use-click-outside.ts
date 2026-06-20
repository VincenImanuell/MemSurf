"use client";

import { useEffect, type RefObject } from "react";

/**
 * Calls `onOutside` when a pointer/touch press lands outside `ref`.
 * Used to let users dismiss any open dropdown/popover by clicking away.
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onOutside: () => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (el && !el.contains(e.target as Node)) onOutside();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [ref, onOutside, enabled]);
}
