"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Box, Loader2, ChevronDown } from "lucide-react";
import { callMemWal } from "@/lib/api";
import { useClickOutside } from "@/lib/use-click-outside";

interface OnChain {
  objectId: string;
  exists: boolean;
  type?: string;
  package?: string;
  owner?: unknown;
  network?: string;
  suiExplorer?: string;
  suiscan?: string;
}

// MemSurf's own Move contract, published on Sui testnet (public deployment constants).
const ROUTING = {
  pkg: "0xf13a3c58afab129da743cb1fb1f3804cf08f6b172ba699cee8aeeceb9e5c788a",
  registry: "0x3e816f9502040fff7ca017d47175182a0abed0ba5ba3c5bb3a401e08d7a8a6ae",
};
const scan = (id: string) => `https://suiscan.xyz/testnet/object/${id}`;

export function OnChainPanel({ accountId }: { accountId: string }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<OnChain | null>(null);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && !data && !loading) {
      setLoading(true);
      try {
        setData(await callMemWal<OnChain>("onchain", {}));
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    }
  };

  const short = `${accountId.slice(0, 6)}…${accountId.slice(-4)}`;
  const ownerStr =
    data?.owner && typeof data.owner === "object" && "Shared" in (data.owner as object)
      ? "Shared object"
      : typeof data?.owner === "string"
        ? data.owner
        : "—";

  return (
    <div className="relative hidden sm:block" ref={ref}>
      <button
        onClick={toggle}
        title="View on-chain account details"
        className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full bg-ocean/10 text-ocean border border-ocean/20 hover:bg-ocean/15 transition-colors dark:bg-sky-400/10 dark:text-sky-200 dark:border-sky-300/20"
      >
        <Box className="w-3 h-3" />
        {short}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white border border-ocean/10 rounded-2xl shadow-xl shadow-navy/10 p-4 z-50 dark:bg-slate-900 dark:border-white/10"
          >
            <p className="text-xs font-mono uppercase tracking-widest text-navy/40 mb-3 dark:text-white/40">
              On-chain · Sui testnet
            </p>

            {loading ? (
              <div className="flex items-center gap-2 text-sm text-navy/50 py-4 dark:text-white/50">
                <Loader2 className="w-4 h-4 animate-spin" /> Reading from Sui full node…
              </div>
            ) : data ? (
              <div className="space-y-2 text-sm">
                <Row label="Object" value={data.exists ? "MemWalAccount ✓" : "not found"} />
                <Row label="Type" value={data.type?.split("::").slice(1).join("::") ?? "—"} mono />
                <Row label="Package" value={data.package ? `${data.package.slice(0, 10)}…` : "—"} mono />
                <Row label="Owner" value={ownerStr} />
                <Row label="Network" value="testnet" />
                <div className="flex gap-3 pt-2">
                  <a href={data.suiExplorer} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-ocean hover:text-ocean-deep dark:text-sky-300">
                    SuiVision <ExternalLink className="w-3 h-3" />
                  </a>
                  <a href={data.suiscan} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-ocean hover:text-ocean-deep dark:text-sky-300">
                    Suiscan <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-sm text-navy/50 dark:text-white/50">Couldn&apos;t read on-chain data.</p>
            )}

            <div className="mt-4 pt-3 border-t border-ocean/10 dark:border-white/10 space-y-2 text-sm">
              <p className="text-xs font-mono uppercase tracking-widest text-navy/40 dark:text-white/40">
                MemSurf routing contract
              </p>
              <Row label="Package" value={`${ROUTING.pkg.slice(0, 10)}…`} mono />
              <Row label="Registry" value={`${ROUTING.registry.slice(0, 10)}…`} mono />
              <p className="text-xs text-navy/45 dark:text-white/40">
                Our own Move module — the Router anchors each routing decision on-chain.
              </p>
              <div className="flex gap-3 pt-1">
                <a href={scan(ROUTING.pkg)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-ocean hover:text-ocean-deep dark:text-sky-300">
                  Package <ExternalLink className="w-3 h-3" />
                </a>
                <a href={scan(ROUTING.registry)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-ocean hover:text-ocean-deep dark:text-sky-300">
                  Registry <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-navy/45 dark:text-white/40">{label}</span>
      <span className={`text-navy text-right dark:text-white/85 ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}
