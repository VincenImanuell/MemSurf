"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const asks = [
  {
    ask: "Long-term, verifiable memory for agents",
    how: "Memories persist on Walrus and can be re-fetched + verified from the public aggregator — Seal-encrypted, content-addressed, tamper-evident.",
  },
  {
    ask: "Cross-tool / cross-agent memory sharing",
    how: "The Router agent moves the relevant memory from one agent to another and anchors each decision on Sui; Transfer copies any memory across agents in one click.",
  },
  {
    ask: "Long-running agents that track state over time",
    how: "research-, trading-, and coding-agents accumulate state on Walrus; a closed autonomous loop (research → trading → result → research) shows them building on each other over time.",
  },
  {
    ask: "Persistent data & file access using Walrus directly",
    how: "Artifacts uploads datasets, logs, and reports straight to Walrus via the public publisher — not only through MemWal.",
  },
  {
    ask: "Interfaces to inspect, debug & manage agent memory",
    how: "Discover, Search, Verify, and the Curator agent give full visibility and quality control over memory on Walrus.",
  },
  {
    ask: "Tooling that makes MemWal adoptable for developers",
    how: "MemSurf is the horizontal layer that unblocks every developer building agents on Walrus — click ‘Explore the demo’, no account needed.",
  },
];

export function TrackFitSection() {
  return (
    <section className="relative bg-navy py-28 px-6 overflow-hidden">
      {/* Subtle ocean glows on the navy field — match the sections above & below. */}
      <div className="absolute top-[28%] left-[6%] w-72 h-72 rounded-full bg-ocean/15 blur-3xl pointer-events-none" />
      <div className="absolute top-[44%] right-[4%] w-96 h-96 rounded-full bg-wave/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-[34%] w-[26rem] h-[26rem] rounded-full bg-ocean-deep/20 blur-3xl pointer-events-none" />
      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="font-serif text-5xl lg:text-6xl tracking-tight text-white mb-3">Built for agent builders.</h2>
          <p className="font-mono text-xs tracking-[0.25em] uppercase text-sky-300/80 mb-5">
            Sui Overflow 2026 · Walrus Track
          </p>
          <p className="text-white/60 text-lg font-light max-w-2xl mx-auto">
            &ldquo;Build AI agents and agentic workflows powered by Walrus as a verifiable data and memory layer.&rdquo;
            Here&apos;s how MemSurf answers the brief.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4">
          {asks.map((a, i) => (
            <motion.div
              key={a.ask}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: (i % 2) * 0.08 }}
              className="bg-white/5 rounded-2xl border border-white/10 p-5 flex gap-4 hover:bg-white/[0.08] hover:border-white/20 transition-all"
            >
              <div className="shrink-0 w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center mt-0.5">
                <Check className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm mb-1">{a.ask}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{a.how}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-mono tracking-wide text-white/50"
        >
          <span>MemWal</span><span className="text-sky-400">·</span>
          <span>Walrus</span><span className="text-sky-400">·</span>
          <span>Seal</span><span className="text-sky-400">·</span>
          <span>Sui testnet</span>
        </motion.div>
      </div>
    </section>
  );
}
