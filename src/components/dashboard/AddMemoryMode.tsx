"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { callMemWal } from "@/lib/api";

export function AddMemoryMode({ namespace, namespaces }: { namespace: string; namespaces: string[] }) {
  const [text, setText] = useState("");
  const [ns, setNs] = useState(namespace);
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  // Keep the target namespace in sync with the header selector.
  useEffect(() => setNs(namespace), [namespace]);

  const handleAdd = async () => {
    if (!text.trim()) return;
    setStatus("saving");
    setError(null);
    try {
      await callMemWal("remember", { text: text.trim(), namespace: ns.trim() || "default" });
      setStatus("done");
      setText("");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to store memory.");
      setStatus("idle");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-serif text-navy flex items-center gap-2 mb-6 dark:text-white">
        <Plus className="w-5 h-5 text-ocean" />
        Add Memory
      </h2>

      <div className="max-w-xl bg-white rounded-2xl border border-ocean/10 p-6 space-y-4 transition-colors duration-300 dark:bg-slate-900 dark:border-white/10">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-navy dark:text-white">Memory Content</label>
          <textarea
            rows={4}
            placeholder="Describe a decision, fact, or lesson learned..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-ocean/20 rounded-xl focus:border-ocean focus:ring-2 focus:ring-ocean/20 outline-none resize-none text-navy placeholder:text-navy/30 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-navy dark:text-white">Namespace (agent)</label>
          <select
            value={ns}
            onChange={(e) => setNs(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-ocean/20 bg-white text-navy text-sm outline-none focus:border-ocean dark:border-white/10 dark:bg-slate-800 dark:text-white [&_option]:text-navy dark:[&_option]:bg-slate-800 dark:[&_option]:text-white"
          >
            {namespaces.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <Button
          onClick={handleAdd}
          disabled={!text.trim() || status !== "idle"}
          className="w-full bg-gradient-to-r from-ocean to-wave text-white rounded-xl py-5 font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {status === "saving" ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Storing to Walrus...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add to Walrus Memory
            </span>
          )}
        </Button>

        {error && (
          <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 dark:bg-red-500/10 dark:border-red-400/20 dark:text-red-300">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <AnimatePresence>
          {status === "done" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-emerald-600 text-sm font-medium"
            >
              <CheckCircle className="w-4 h-4" />
              Memory stored on Walrus!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
