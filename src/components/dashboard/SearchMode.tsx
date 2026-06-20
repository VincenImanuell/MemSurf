"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MemoryCard } from "./MemoryCard";
import { callMemWal } from "@/lib/api";

interface RecallResult {
  results: { blob_id: string; text: string; distance: number }[];
  total: number;
}

export function SearchMode({ namespace, namespaces }: { namespace: string; namespaces: string[] }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RecallResult["results"]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await callMemWal<RecallResult>("recall", { query: query.trim(), namespace, limit: 10 });
      setResults(data.results);
      setSearched(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  const transferTargets = namespaces.filter((n) => n !== namespace);

  return (
    <div className="p-6">
      <h2 className="text-xl font-serif text-navy flex items-center gap-2 mb-6 dark:text-white">
        <Search className="w-5 h-5 text-ocean" />
        Search Memories
        <span className="text-sm font-sans font-normal text-navy/40 dark:text-white/40">in {namespace}</span>
      </h2>

      <div className="flex gap-3 mb-8">
        <Input
          placeholder='e.g. "why did we choose PostgreSQL?"'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="border-ocean/20 focus:border-ocean rounded-xl text-navy dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
        />
        <Button
          onClick={handleSearch}
          disabled={!query.trim() || loading}
          className="bg-gradient-to-r from-ocean to-wave text-white rounded-xl px-5 shrink-0"
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4 dark:bg-red-500/10 dark:border-red-400/20 dark:text-red-300">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <AnimatePresence>
        {searched && !error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <p className="text-sm text-navy/50 mb-4 dark:text-white/50">
              {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
            </p>
            {results.length === 0 ? (
              <div className="text-center py-12 text-navy/40 dark:text-white/40">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No matching memories in this namespace.</p>
              </div>
            ) : (
              results.map((r, i) => (
                <MemoryCard
                  key={r.blob_id}
                  blobId={r.blob_id}
                  text={r.text}
                  distance={r.distance}
                  index={i}
                  transferTargets={transferTargets}
                  onTransfer={(target) => callMemWal("transfer", { text: r.text, targetNamespace: target })}
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!searched && !error && (
        <div className="text-center py-12 text-navy/30 dark:text-white/30">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Type a question to search your agent&apos;s memories</p>
        </div>
      )}
    </div>
  );
}
