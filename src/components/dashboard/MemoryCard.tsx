"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Hash, ArrowRightLeft, Check, Loader2, ShieldCheck, Lock, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useClickOutside } from "@/lib/use-click-outside";
import { callMemWal } from "@/lib/api";

interface VerifyResult {
  exists: boolean;
  bytes?: number;
  encrypted?: boolean;
  aggregatorUrl?: string;
  walruscanUrl?: string;
}

interface MemoryCardProps {
  blobId: string;
  text: string;
  distance?: number;
  timestamp?: string;
  index?: number;
  flag?: "duplicate" | "conflict" | "vague" | "stale";
  /** Namespaces this memory can be copied into (excludes the current one). */
  transferTargets?: string[];
  /** Copy this memory's text into another namespace. */
  onTransfer?: (targetNamespace: string) => Promise<void>;
}

const flagColors = {
  duplicate: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-200 dark:border-orange-400/25",
  conflict: "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-200 dark:border-red-400/25",
  vague: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/15 dark:text-yellow-100 dark:border-yellow-300/25",
  stale: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-white/10 dark:text-white/60 dark:border-white/15",
};

export function MemoryCard({
  blobId,
  text,
  distance,
  timestamp,
  index = 0,
  flag,
  transferTargets,
  onTransfer,
}: MemoryCardProps) {
  const [open, setOpen] = useState(false);
  const [transferring, setTransferring] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState<VerifyResult | null>(null);
  const transferRef = useRef<HTMLDivElement>(null);
  useClickOutside(transferRef, () => setOpen(false), open);

  const canTransfer = onTransfer && transferTargets && transferTargets.length > 0;

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const r = await callMemWal<VerifyResult>("verify", { text: blobId });
      setVerified(r);
    } catch {
      setVerified({ exists: false });
    } finally {
      setVerifying(false);
    }
  };

  const handleTransfer = async (target: string) => {
    if (!onTransfer) return;
    setTransferring(target);
    try {
      await onTransfer(target);
      setDone(target);
      setTimeout(() => setDone(null), 2500);
    } finally {
      setTransferring(null);
      setOpen(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-2xl border border-ocean/10 p-4 hover:border-ocean/30 hover:shadow-md hover:shadow-ocean/10 transition-all group dark:bg-slate-900 dark:border-white/10 dark:hover:border-sky-300/30 dark:hover:shadow-sky-950/20"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-navy text-sm leading-relaxed flex-1 dark:text-white/85">{text}</p>
        {distance !== undefined && (
          <Badge variant="secondary" className="shrink-0 bg-ocean/10 text-ocean border-ocean/20 text-xs dark:bg-sky-400/15 dark:text-sky-200 dark:border-sky-300/20">
            {Math.round((1 - distance) * 100)}% match
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <a
            href={`https://walruscan.com/testnet/blob/${blobId}`}
            target="_blank"
            rel="noopener noreferrer"
            title="View this memory's blob on Walrus"
            className="flex items-center gap-1 text-xs text-navy/40 hover:text-ocean dark:text-white/35 dark:hover:text-sky-300 shrink-0 transition-colors"
          >
            <Hash className="w-3 h-3" />
            {blobId.slice(0, 12)}...
          </a>
          {timestamp && (
            <span className="flex items-center gap-1 text-xs text-navy/40 dark:text-white/35 shrink-0">
              <Clock className="w-3 h-3" />
              {timestamp}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {flag && (
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${flagColors[flag]}`}>
              ⚠ {flag}
            </span>
          )}

          {!verified && (
            <button
              type="button"
              onClick={handleVerify}
              disabled={verifying}
              title="Independently fetch this blob from the Walrus aggregator"
              className="flex items-center gap-1 text-xs text-navy/50 hover:text-ocean font-medium px-2 py-1 rounded-lg border border-ocean/20 hover:bg-ocean/5 transition-colors dark:text-white/50 dark:border-white/10 dark:hover:bg-white/5 dark:hover:text-sky-300"
            >
              {verifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              {verifying ? "Verifying…" : "Verify"}
            </button>
          )}

          {canTransfer && (
            <div className="relative" ref={transferRef}>
              {done ? (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium dark:text-emerald-300">
                  <Check className="w-3.5 h-3.5" />
                  Copied to {done}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setOpen((o) => !o)}
                  disabled={transferring !== null}
                  className="flex items-center gap-1 text-xs text-ocean hover:text-ocean-deep font-medium px-2 py-1 rounded-lg border border-ocean/20 hover:bg-ocean/5 transition-colors dark:text-sky-300 dark:border-sky-300/20 dark:hover:bg-sky-300/10"
                >
                  {transferring ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRightLeft className="w-3.5 h-3.5" />}
                  {transferring ? "Copying…" : "Copy to"}
                </button>
              )}

              {open && (
                <div className="absolute right-0 bottom-full mb-2 bg-white border border-ocean/10 rounded-xl shadow-lg shadow-navy/10 py-1 min-w-[150px] z-30 dark:bg-slate-900 dark:border-white/10">
                  {transferTargets!.map((ns) => (
                    <button
                      key={ns}
                      onClick={() => handleTransfer(ns)}
                      className="w-full px-3 py-2 text-left text-xs text-navy hover:bg-seafoam transition-colors dark:text-white/80 dark:hover:bg-white/5"
                    >
                      {ns}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {verified && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-3 pt-3 border-t border-ocean/10 dark:border-white/10"
        >
          {verified.exists ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span className="flex items-center gap-1 text-emerald-600 font-medium dark:text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                Live on Walrus
              </span>
              <span className="text-navy/50 dark:text-white/50">{verified.bytes} bytes</span>
              <span className="flex items-center gap-1 text-navy/50 dark:text-white/50">
                <Lock className="w-3 h-3" /> Seal-encrypted
              </span>
              <a
                href={verified.aggregatorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-ocean hover:text-ocean-deep dark:text-sky-300"
              >
                aggregator <ExternalLink className="w-3 h-3" />
              </a>
              <span className="w-full text-navy/40 dark:text-white/35 mt-0.5">
                Fetched independently from Walrus · blob id is content-addressed, so the text can&apos;t be altered without changing the id.
              </span>
            </div>
          ) : (
            <span className="text-xs text-amber-600 dark:text-amber-300">
              Not yet retrievable from the public aggregator (may still be propagating).
            </span>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
