"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle, Loader2, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { callMemWal } from "@/lib/api";

type CaptureStatus = "idle" | "analyzing" | "done";

export function CaptureMode({ namespace }: { namespace: string }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<CaptureStatus>("idle");
  const [facts, setFacts] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async () => {
    if (!text.trim()) return;
    setStatus("analyzing");
    setError(null);
    try {
      const data = await callMemWal<{ facts: string[] }>("analyze", { text: text.trim(), namespace });
      setFacts(data.facts);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to extract facts.");
      setStatus("idle");
    }
  };

  const handleReset = () => {
    setText("");
    setFacts([]);
    setError(null);
    setStatus("idle");
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-serif text-navy flex items-center gap-2 mb-2 dark:text-white">
        <Sparkles className="w-5 h-5 text-sunset" />
        Capture
      </h2>
      <p className="text-navy/50 text-sm font-light mb-6 dark:text-white/50">
        Paste notes, lecture transcripts, or meeting recaps — MemSurf extracts the key facts and stores each one as a separate memory in{" "}
        <span className="font-medium text-navy dark:text-white">{namespace}</span>.
      </p>

      <div className="max-w-2xl bg-white rounded-2xl border border-ocean/10 p-6 space-y-4 transition-colors duration-300 dark:bg-slate-900 dark:border-white/10">
        <textarea
          rows={6}
          placeholder="Paste your notes here — e.g. lecture notes, meeting transcript, research summary..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={status !== "idle"}
          className="w-full px-3 py-2 text-sm border border-ocean/20 rounded-xl focus:border-ocean focus:ring-2 focus:ring-ocean/20 outline-none resize-none text-navy placeholder:text-navy/30 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
        />

        {status === "idle" && (
          <Button
            onClick={handleCapture}
            disabled={!text.trim()}
            className="w-full bg-gradient-to-r from-sunset to-sunset-light text-white rounded-xl py-5 font-semibold hover:opacity-90 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Extract & Store
          </Button>
        )}

        {status === "analyzing" && (
          <div className="flex items-center justify-center gap-2 text-navy/60 text-sm py-3 dark:text-white/60">
            <Loader2 className="w-4 h-4 animate-spin" />
            Extracting facts from your notes...
          </div>
        )}

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
              className="space-y-3"
            >
              <p className="text-sm font-medium text-emerald-600 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                {facts.length} facts extracted and stored on Walrus
              </p>
              <div className="space-y-2">
                {facts.map((fact, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 bg-seafoam border border-ocean/10 rounded-xl p-3 text-sm text-navy dark:bg-white/5 dark:border-white/10 dark:text-white/80"
                  >
                    <FileText className="w-4 h-4 text-ocean shrink-0 mt-0.5" />
                    {fact}
                  </div>
                ))}
              </div>
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-ocean/20 text-ocean hover:bg-ocean/5 rounded-xl dark:border-white/10 dark:bg-white/5 dark:text-sky-200 dark:hover:bg-white/10"
              >
                Capture more
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
