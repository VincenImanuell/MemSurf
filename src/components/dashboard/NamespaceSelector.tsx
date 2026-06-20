"use client";

import { ChevronDown, Layers } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useClickOutside } from "@/lib/use-click-outside";

interface Props {
  namespace: string;
  namespaces: string[];
  onSelect: (ns: string) => void;
}

export function NamespaceSelector({ namespace, namespaces, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-ocean/20 text-navy text-sm font-medium hover:border-ocean/50 transition-colors dark:bg-white/5 dark:border-white/10 dark:text-white dark:hover:border-sky-300/40"
      >
        <Layers className="w-4 h-4 text-ocean" />
        <span>{namespace}</span>
        <ChevronDown className={cn("w-4 h-4 text-navy/40 transition-transform dark:text-white/40", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 bg-white border border-ocean/10 rounded-xl shadow-lg shadow-navy/10 py-1 min-w-[180px] z-50 dark:bg-slate-900 dark:border-white/10 dark:shadow-sky-950/30">
          {namespaces.map((ns) => (
            <button
              key={ns}
              onClick={() => { onSelect(ns); setOpen(false); }}
              className={cn(
                "w-full px-4 py-2.5 text-left text-sm hover:bg-seafoam transition-colors dark:hover:bg-white/5",
                ns === namespace ? "text-ocean font-medium dark:text-sky-200" : "text-navy dark:text-white/75"
              )}
            >
              {ns}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
