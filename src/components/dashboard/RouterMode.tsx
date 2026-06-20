"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, ArrowRight, Play, AlertCircle, CheckCircle, Loader2, Check, Radio, Pencil, Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";

const LIVE_INTERVAL_MS = 60_000; // poll once a minute — well within the rate limit

interface Candidate {
  blob_id: string;
  text: string;
  distance: number;
  matchedInterest: string;
}
interface RouteResult {
  candidates: Candidate[];
  interests: string[];
  threshold: number;
  source: string;
  target: string;
}
interface AnchorRef {
  digest: string;
  suiscan: string;
}
interface ApplyResult {
  routed: number;
  anchor: AnchorRef | null;
}

// Mirror of the server's default interest profiles, for prefill UX.
const PROFILES: Record<string, string[]> = {
  "trading-bot": [
    "pair trading correlation strategy",
    "risk management position sizing",
    "backtest returns performance",
    "market signal indicator",
  ],
  "coding-agent": ["architecture decision", "database choice", "authentication security", "deployment infrastructure"],
  "research-agent": ["experiment finding result", "literature review method", "dataset analysis statistics"],
  default: ["important decision", "key finding", "strategy", "lesson learned"],
};

export function RouterMode({ namespace, namespaces }: { namespace: string; namespaces: string[] }) {
  const [source, setSource] = useState(namespace);
  const [target, setTarget] = useState(namespaces.find((n) => n !== namespace) ?? "default");
  const [interests, setInterests] = useState((PROFILES[target] ?? PROFILES.default).join("\n"));
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routedCount, setRoutedCount] = useState<number | null>(null);
  const [anchorTx, setAnchorTx] = useState<AnchorRef | null>(null);
  const [showInterests, setShowInterests] = useState(false);

  // Editable agent name (cosmetic — the storage namespace stays "memory-router").
  const [agentName, setAgentName] = useState("Router Agent");
  const [editingName, setEditingName] = useState(false);

  // Live auto-pilot: poll the source agent and auto-route newly-relevant memories.
  const [live, setLive] = useState(false);
  const [twoWay, setTwoWay] = useState(false);
  const [autoLog, setAutoLog] = useState<{ text: string; from: string; to: string; relevance: number; time: string; anchor: AnchorRef | null }[]>([]);
  const routedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setInterests((PROFILES[target] ?? PROFILES.default).join("\n"));
  }, [target]);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("memsurf.routerName") : null;
    if (saved) setAgentName(saved);
  }, []);

  const saveName = (v: string) => {
    const name = v.trim() || "Router Agent";
    setAgentName(name);
    if (typeof window !== "undefined") localStorage.setItem("memsurf.routerName", name);
    setEditingName(false);
  };

  // The autonomous loop — runs only while Live is on and the tab is open.
  useEffect(() => {
    if (!live || source === target) return;
    let cancelled = false;

    // Route fresh + novel memories in one direction (gap-aware via novelOnly).
    const routeOnce = async (from: string, to: string, interestList: string[]) => {
      const { callMemWal } = await import("@/lib/api");
      const data = await callMemWal<RouteResult>("route", {
        sourceNamespace: from,
        targetNamespace: to,
        interests: interestList,
        novelOnly: true,
      });
      const fresh = data.candidates.filter((c) => !routedRef.current.has(c.blob_id));
      if (fresh.length === 0 || cancelled) return;
      const res = await callMemWal<ApplyResult>("route-apply", {
        sourceNamespace: from,
        targetNamespace: to,
        items: fresh.map((c) => ({ text: c.text, matchedInterest: c.matchedInterest, distance: c.distance })),
      });
      if (cancelled) return;
      fresh.forEach((c) => routedRef.current.add(c.blob_id));
      const stamp = new Date().toLocaleTimeString();
      setAutoLog((prev) =>
        [
          ...fresh.map((c) => ({ text: c.text, from, to, relevance: Math.round((1 - c.distance) * 100), time: stamp, anchor: res.anchor ?? null })),
          ...prev,
        ].slice(0, 20)
      );
    };

    const cycle = async () => {
      try {
        await routeOnce(source, target, interests.split("\n").map((s) => s.trim()).filter(Boolean));
        if (twoWay && !cancelled) {
          // feedback direction uses the source agent's own interest profile
          await routeOnce(target, source, PROFILES[source] ?? PROFILES.default);
        }
      } catch {
        // transient (rate limit / network) — wait for the next tick
      }
    };

    cycle(); // run immediately on enable
    const id = setInterval(cycle, LIVE_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [live, twoWay, source, target, interests]);

  const handleRun = async () => {
    if (source === target) {
      setError("Source and target must be different agents.");
      return;
    }
    const { callMemWal } = await import("@/lib/api");
    setLoading(true);
    setError(null);
    setCandidates(null);
    setRoutedCount(null);
    setAnchorTx(null);
    try {
      const data = await callMemWal<RouteResult>("route", {
        sourceNamespace: source,
        targetNamespace: target,
        interests: interests.split("\n").map((s) => s.trim()).filter(Boolean),
      });
      setCandidates(data.candidates);
      setSelected(new Set(data.candidates.map((c) => c.blob_id)));
      setShowInterests(true); // reveal which interests drove the routing
    } catch (e) {
      setError(e instanceof Error ? e.message : "Router failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!candidates) return;
    const chosen = candidates.filter((c) => selected.has(c.blob_id));
    if (chosen.length === 0) return;
    const { callMemWal } = await import("@/lib/api");
    setApplying(true);
    setError(null);
    try {
      const res = await callMemWal<ApplyResult>("route-apply", {
        sourceNamespace: source,
        targetNamespace: target,
        items: chosen.map((c) => ({ text: c.text, matchedInterest: c.matchedInterest, distance: c.distance })),
      });
      setRoutedCount(res.routed);
      setAnchorTx(res.anchor ?? null);
      setCandidates(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Routing failed.");
    } finally {
      setApplying(false);
    }
  };

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // Solid background + explicit option colors so the native dropdown list stays
  // readable in dark mode (translucent bg would render white-on-white options).
  const nsClass =
    "px-3 py-2 rounded-xl border border-ocean/20 bg-white text-navy text-sm font-medium outline-none focus:border-ocean dark:border-white/10 dark:bg-slate-800 dark:text-white [&_option]:text-navy dark:[&_option]:bg-slate-800 dark:[&_option]:text-white";

  return (
    <div className="p-6 max-w-3xl">
      <h2 className="text-xl font-serif text-navy flex items-center gap-2 mb-2 dark:text-white">
        <Share2 className="w-5 h-5 text-sunset shrink-0" />
        {editingName ? (
          <input
            autoFocus
            defaultValue={agentName}
            onBlur={(e) => saveName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveName((e.target as HTMLInputElement).value);
              if (e.key === "Escape") setEditingName(false);
            }}
            maxLength={28}
            className="bg-transparent border-b border-ocean/40 outline-none text-navy font-serif w-56 dark:text-white"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditingName(true)}
            title="Rename this agent"
            className="group inline-flex items-center gap-1.5 hover:text-ocean transition-colors dark:hover:text-sky-300"
          >
            {agentName}
            <Pencil className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
          </button>
        )}
      </h2>
      <p className="text-navy/50 text-sm font-light mb-6 dark:text-white/50">
        Surfaces the memories from one agent that are <span className="font-medium text-navy dark:text-white">relevant</span>{" "}
        to another — by semantic match to the target&apos;s interests — and copies them across. Run it once, or
        <span className="font-medium text-navy dark:text-white"> Go Live</span> so new relevant memories route themselves automatically. Every decision is logged as the agent&apos;s own memory in <span className="font-mono text-xs">memory-router</span>.
      </p>

      {/* Source → Target */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-mono uppercase tracking-wide text-navy/40 dark:text-white/40">From agent</label>
          <select value={source} onChange={(e) => setSource(e.target.value)} className={nsClass}>
            {namespaces.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <ArrowRight className="w-5 h-5 text-navy/30 mt-5 dark:text-white/30" />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-mono uppercase tracking-wide text-navy/40 dark:text-white/40">To agent</label>
          <select value={target} onChange={(e) => setTarget(e.target.value)} className={nsClass}>
            {namespaces.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Interests — auto-filled from the target's profile; customizing is optional */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setShowInterests((v) => !v)}
          className="text-xs text-ocean hover:text-ocean-deep font-medium dark:text-sky-300"
        >
          {showInterests ? "Hide" : "Customize"} {target}&apos;s interests {showInterests ? "▲" : "▾"}
        </button>
        {showInterests && (
          <>
            <p className="text-xs text-navy/40 mt-1 dark:text-white/40">One per line — the agent routes memories matching these.</p>
            <textarea
              rows={4}
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-sm border border-ocean/20 rounded-xl outline-none resize-none text-navy focus:border-ocean dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={handleRun}
          disabled={loading}
          className="bg-gradient-to-r from-sunset to-sunset-light text-white rounded-xl px-6 py-5 font-semibold hover:opacity-90 shadow-lg shadow-sunset/20"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
          {loading ? "Scanning source agent…" : "Run Router"}
        </Button>

        {/* Live auto-pilot toggle */}
        <button
          type="button"
          onClick={() => setLive((v) => !v)}
          disabled={source === target}
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium border transition-colors disabled:opacity-40 ${
            live
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-300"
              : "border-ocean/20 text-navy/60 hover:bg-ocean/5 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/5"
          }`}
        >
          <Radio className={`w-4 h-4 ${live ? "animate-pulse" : ""}`} />
          {live ? "Live — auto-routing" : "Go Live"}
        </button>

        <button
          type="button"
          role="switch"
          aria-checked={twoWay}
          onClick={() => setTwoWay((v) => !v)}
          className={`group flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors select-none ${
            twoWay
              ? "border-ocean/40 bg-ocean/5 dark:border-sky-300/30 dark:bg-sky-400/10"
              : "border-ocean/15 hover:bg-ocean/5 dark:border-white/10 dark:hover:bg-white/5"
          }`}
        >
          <span
            className={`relative w-10 h-[22px] rounded-full transition-colors duration-300 shrink-0 ${
              twoWay ? "bg-gradient-to-r from-ocean to-ocean-deep" : "bg-navy/15 dark:bg-white/20"
            }`}
          >
            <span
              className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                twoWay ? "translate-x-[18px]" : ""
              }`}
            />
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span className={`text-sm font-medium ${twoWay ? "text-ocean dark:text-sky-300" : "text-navy/70 dark:text-white/70"}`}>
              Two-way
            </span>
            <span className="text-[11px] text-navy/40 dark:text-white/40">agents learn from each other</span>
          </span>
        </button>
      </div>

      {live && (
        <p className="text-xs text-navy/45 mt-2 dark:text-white/40">
          Watching every 60s — new memories relevant to {twoWay ? "the other agent" : target} are routed automatically; what the target already has is skipped.
          {twoWay && " Results flow back too, so both agents keep learning."}
        </p>
      )}

      <p className="text-[11px] text-navy/35 mt-2 leading-relaxed dark:text-white/30">
        <span className="font-medium text-navy/50 dark:text-white/45">How autonomy works:</span> Live polls for new
        memories from your browser while this tab is open (MemWal has no event-push yet, so MemSurf polls). A production
        deployment runs the same loop as an always-on server daemon — the agent logic is identical, only the trigger changes.
        Memory routing itself is gas-free; only the optional on-chain anchor costs a little testnet gas.
      </p>

      {/* Auto-pilot activity feed */}
      {autoLog.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-mono uppercase tracking-widest text-navy/40 dark:text-white/40">Auto-routed</p>
          {autoLog.map((l, i) => (
            <motion.div
              key={`${l.time}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 text-xs dark:bg-emerald-500/10 dark:border-emerald-400/20"
            >
              <span className="text-navy truncate dark:text-white/85">
                <span className="font-mono text-[10px] text-emerald-600 mr-2 dark:text-emerald-300">{l.from}→{l.to}</span>
                {l.text}
              </span>
              <span className="flex items-center gap-2 shrink-0">
                {l.anchor && (
                  <a
                    href={l.anchor.suiscan}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Routing anchored on Sui"
                    className="text-ocean hover:text-ocean-deep dark:text-sky-300"
                  >
                    <Anchor className="w-3.5 h-3.5" />
                  </a>
                )}
                <span className="text-emerald-600 dark:text-emerald-300">{l.relevance}% · {l.time}</span>
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mt-4 dark:bg-red-500/10 dark:border-red-400/20 dark:text-red-300">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {routedCount !== null && (
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium dark:text-emerald-300">
            <CheckCircle className="w-4 h-4" />
            Routed {routedCount} memor{routedCount === 1 ? "y" : "ies"} into {target}. Switch the namespace to {target} to see them.
          </div>
          {anchorTx && (
            <a
              href={anchorTx.suiscan}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-ocean hover:text-ocean-deep font-medium dark:text-sky-300"
            >
              <Anchor className="w-3.5 h-3.5" />
              Routing anchored on Sui · {anchorTx.digest.slice(0, 10)}…
            </a>
          )}
        </div>
      )}

      <AnimatePresence>
        {candidates && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-navy dark:text-white">
                {candidates.length} relevant memor{candidates.length === 1 ? "y" : "ies"} found in {source}
              </p>
              {candidates.length > 0 && (
                <Button
                  onClick={handleApply}
                  disabled={applying || selected.size === 0}
                  className="bg-ocean text-white rounded-xl text-sm h-9 px-4 hover:bg-ocean-deep"
                >
                  {applying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Share2 className="w-4 h-4 mr-2" />}
                  Route {selected.size} → {target}
                </Button>
              )}
            </div>

            {candidates.length === 0 && (
              <p className="text-sm text-navy/50 dark:text-white/50">
                No memories in {source} matched {target}&apos;s interests. Try lowering the bar or editing the interests.
              </p>
            )}

            {candidates.map((c) => {
              const on = selected.has(c.blob_id);
              return (
                <button
                  key={c.blob_id}
                  onClick={() => toggle(c.blob_id)}
                  className={`w-full text-left rounded-2xl border p-4 transition-colors ${
                    on
                      ? "bg-ocean/5 border-ocean/30 dark:bg-sky-400/10 dark:border-sky-300/30"
                      : "bg-white border-ocean/10 dark:bg-slate-900 dark:border-white/10"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                        on ? "bg-ocean border-ocean text-white" : "border-navy/20 dark:border-white/20"
                      }`}
                    >
                      {on && <Check className="w-3.5 h-3.5" />}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-navy leading-relaxed dark:text-white/85">{c.text}</p>
                      <p className="text-xs text-navy/40 mt-1.5 dark:text-white/40">
                        {Math.round((1 - c.distance) * 100)}% relevant to{" "}
                        <span className="text-ocean dark:text-sky-300">&ldquo;{c.matchedInterest}&rdquo;</span>
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
