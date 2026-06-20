"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Play, AlertTriangle, CheckCircle, Lightbulb, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { callMemWal } from "@/lib/api";

type CuratorStatus = "idle" | "running" | "done";

interface Issue {
  type: "duplicate" | "vague";
  memory: string;
  related?: string;
  reason?: string;
  distance?: number;
}
interface Gap {
  category: string;
  suggestion: string;
}
interface CurateResult {
  issues: Issue[];
  gaps: Gap[];
  scanned: number;
}

export function CuratorMode({ namespace }: { namespace: string }) {
  const [status, setStatus] = useState<CuratorStatus>("idle");
  const [report, setReport] = useState<CurateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // inline gap-fill state
  const [openGap, setOpenGap] = useState<number | null>(null);
  const [gapText, setGapText] = useState("");
  const [savingGap, setSavingGap] = useState(false);
  const [addedGaps, setAddedGaps] = useState<number[]>([]);

  const handleRun = async () => {
    setStatus("running");
    setError(null);
    try {
      const data = await callMemWal<CurateResult>("curate", { namespace });
      setReport(data);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Curator scan failed.");
      setStatus("idle");
    }
  };

  const handleSaveGap = async (i: number) => {
    if (!gapText.trim()) return;
    setSavingGap(true);
    try {
      await callMemWal("remember", { text: gapText.trim(), namespace });
      setAddedGaps((prev) => [...prev, i]);
      setOpenGap(null);
      setGapText("");
    } finally {
      setSavingGap(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-serif text-navy flex items-center gap-2 mb-2 dark:text-white">
        <Bot className="w-5 h-5 text-sunset" />
        Curator Agent
      </h2>
      <p className="text-navy/50 text-sm font-light mb-6 dark:text-white/50">
        Scans memories in <span className="font-medium text-navy dark:text-white">{namespace}</span> for near-duplicates and vague entries, and checks a category checklist for gaps — no memory is ever deleted.
      </p>

      {status === "idle" && (
        <Button
          onClick={handleRun}
          className="bg-gradient-to-r from-sunset to-sunset-light text-white rounded-xl px-6 py-5 font-semibold hover:opacity-90 shadow-lg shadow-sunset/20"
        >
          <Play className="w-4 h-4 mr-2" />
          Run Curator
        </Button>
      )}

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mt-4 dark:bg-red-500/10 dark:border-red-400/20 dark:text-red-300">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {status === "running" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 text-navy/60 text-sm dark:text-white/60"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-5 h-5 border-2 border-ocean/30 border-t-ocean rounded-full"
          />
          Analyzing memories on Walrus...
        </motion.div>
      )}

      <AnimatePresence>
        {status === "done" && report && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <p className="text-xs text-navy/40 dark:text-white/40">Scanned {report.scanned} memories.</p>

            {/* Issues */}
            <div>
              <h3 className="font-semibold text-navy text-sm mb-3 flex items-center gap-2 dark:text-white">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Issues Found ({report.issues.length})
              </h3>
              {report.issues.length === 0 ? (
                <p className="text-sm text-navy/50 dark:text-white/50">No duplicate or vague memories detected. Clean trail. 🌊</p>
              ) : (
                <div className="space-y-3">
                  {report.issues.map((issue, i) => (
                    <div key={i} className="bg-orange-50 border border-orange-100 rounded-xl p-4 dark:bg-orange-500/10 dark:border-orange-400/20">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-orange-600 uppercase tracking-wide dark:text-orange-300">{issue.type}</span>
                        {issue.distance !== undefined && (
                          <span className="text-xs text-navy/40 dark:text-white/40">distance {issue.distance.toFixed(2)}</span>
                        )}
                      </div>
                      <p className="text-sm text-navy leading-relaxed dark:text-white/85">&ldquo;{issue.memory}&rdquo;</p>
                      {issue.related && (
                        <p className="text-xs text-navy/50 mt-1 dark:text-white/50">Similar to: &ldquo;{issue.related}&rdquo;</p>
                      )}
                      {issue.reason && (
                        <p className="text-xs text-navy/50 mt-1 dark:text-white/50">{issue.reason}</p>
                      )}
                      <p className="text-xs text-orange-500 mt-2 italic dark:text-orange-300">Flagged for review — part of learning history, not deleted.</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Gaps */}
            <div>
              <h3 className="font-semibold text-navy text-sm mb-3 flex items-center gap-2 dark:text-white">
                <Lightbulb className="w-4 h-4 text-ocean" />
                Gaps Detected ({report.gaps.length})
              </h3>
              {report.gaps.length === 0 ? (
                <p className="text-sm text-navy/50 dark:text-white/50">All checklist categories are covered.</p>
              ) : (
                <div className="space-y-3">
                  {report.gaps.map((gap, i) => (
                    <div key={i} className="bg-seafoam border border-ocean/10 rounded-xl p-4 dark:bg-white/5 dark:border-white/10">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <span className="text-xs font-medium text-ocean uppercase tracking-wide">{gap.category}</span>
                          <p className="text-sm text-navy mt-0.5 dark:text-white/80">{gap.suggestion}</p>
                        </div>
                        {addedGaps.includes(i) ? (
                          <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium shrink-0">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Added
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => { setOpenGap(openGap === i ? null : i); setGapText(""); }}
                            className="shrink-0 bg-ocean text-white rounded-lg text-xs h-8 px-3 hover:bg-ocean-deep"
                          >
                            Add Memory
                          </Button>
                        )}
                      </div>

                      {openGap === i && !addedGaps.includes(i) && (
                        <div className="mt-3 space-y-2">
                          <textarea
                            rows={2}
                            autoFocus
                            placeholder={`Write a memory about ${gap.category.toLowerCase()}…`}
                            value={gapText}
                            onChange={(e) => setGapText(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-ocean/20 rounded-lg outline-none resize-none text-navy placeholder:text-navy/30 focus:border-ocean dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveGap(i)}
                              disabled={!gapText.trim() || savingGap}
                              className="bg-ocean text-white rounded-lg text-xs h-8 px-3 hover:bg-ocean-deep"
                            >
                              {savingGap ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save to Walrus"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setOpenGap(null)}
                              className="rounded-lg text-xs h-8 px-3 border-ocean/20 text-navy/60 dark:border-white/10 dark:text-white/60"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={handleRun}
              variant="outline"
              className="border-ocean/20 text-ocean hover:bg-ocean/5 rounded-xl dark:border-white/10 dark:bg-white/5 dark:text-sky-200 dark:hover:bg-white/10"
            >
              <Play className="w-4 h-4 mr-2" />
              Re-run scan
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
