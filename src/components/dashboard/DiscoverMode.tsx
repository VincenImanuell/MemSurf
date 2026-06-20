"use client";

import { useCallback, useEffect, useState } from "react";
import { Compass, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemoryCard } from "./MemoryCard";
import { callMemWal } from "@/lib/api";

interface Memory {
  blob_id: string;
  text: string;
  distance: number;
}

interface DiscoverResult {
  memories: Memory[];
  found: number;
  total: number;
}

export function DiscoverMode({ namespace, namespaces, active = true }: { namespace: string; namespaces: string[]; active?: boolean }) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await callMemWal<DiscoverResult>("discover", { namespace });
      setMemories(result.memories);
      setTotal(result.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load memories.");
    } finally {
      setLoading(false);
    }
  }, [namespace]);

  useEffect(() => {
    if (active) load();
  }, [load, active]);

  const transferTargets = namespaces.filter((n) => n !== namespace);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-serif text-navy flex items-center gap-2 dark:text-white">
            <Compass className="w-5 h-5 text-ocean" />
            Discover Memories
          </h2>
          <p className="text-navy/50 text-sm font-light mt-0.5 dark:text-white/50">
            {loading ? (
              "Surfacing memories from Walrus…"
            ) : (
              <>
                Discovered <span className="text-ocean font-semibold">{memories.length}</span>
                {total > memories.length ? <> of ~{total}</> : null} memories in{" "}
                <span className="font-medium text-navy dark:text-white">{namespace}</span>
              </>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={load}
          disabled={loading}
          className="border-ocean/20 text-ocean hover:bg-ocean/5 rounded-xl dark:border-white/10 dark:bg-white/5 dark:text-sky-200 dark:hover:bg-white/10"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4 dark:bg-red-500/10 dark:border-red-400/20 dark:text-red-300">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && memories.length === 0 && (
        <div className="text-center py-12 text-navy/40 dark:text-white/40">
          <Compass className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No memories found in this namespace yet.</p>
        </div>
      )}

      <div className="space-y-3">
        {memories.map((m, i) => (
          <MemoryCard
            key={m.blob_id}
            blobId={m.blob_id}
            text={m.text}
            index={i}
            transferTargets={transferTargets}
            onTransfer={(target) => callMemWal("transfer", { text: m.text, targetNamespace: target })}
          />
        ))}
      </div>
    </div>
  );
}
