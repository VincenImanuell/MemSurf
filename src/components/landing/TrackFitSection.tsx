"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

// Soft, glowing bubbles that drift upward — iOS-blob vibe on the warm panel.
function GlowBubbles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(16)].map((_, i) => {
        const size = 10 + (i % 5) * 7;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${(i * 61) % 100}%`,
              bottom: `${(i * 37) % 100}%`,
              background:
                "radial-gradient(circle at 35% 30%, #ffffff 0%, rgba(255,255,255,0.8) 38%, rgba(56,189,248,0.3) 72%, transparent 100%)",
              boxShadow: `0 0 ${size * 1.1}px rgba(255,255,255,0.55)`,
            }}
            animate={{
              y: [0, -140 - (i % 5) * 24],
              opacity: [0, 0.9, 0],
              scale: [0.7, 1.15, 0.7],
            }}
            transition={{
              repeat: Infinity,
              repeatType: "loop",
              duration: 7 + (i % 6) * 1.3,
              delay: (i % 8) * 0.7,
              ease: "linear",
            }}
          />
        );
      })}
    </div>
  );
}

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
    <section className="relative bg-gradient-to-b from-foam via-ocean-light to-foam py-28 px-6 overflow-hidden">
      {/* iOS-style soft glowy blobs floating in the cool light-blue panel */}
      <div className="absolute -top-16 left-[6%] w-72 h-72 rounded-full bg-white/40 blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-[4%] w-96 h-96 rounded-full bg-white/35 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-12%] left-[34%] w-[28rem] h-[28rem] rounded-full bg-ocean-light/60 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-[2%] w-64 h-64 rounded-full bg-wave/30 blur-3xl pointer-events-none" />
      <GlowBubbles />
      {/* Fade the light-blue panel into the navy sections above & below at both seams */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-navy to-transparent pointer-events-none z-[1]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy to-transparent pointer-events-none z-[1]" />
      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="font-serif text-5xl lg:text-6xl tracking-tight text-navy mb-3">Built for agent builders.</h2>
          <p className="font-mono text-xs tracking-[0.25em] uppercase text-ocean-deep/70 mb-5">
            Sui Overflow 2026 · Walrus Track
          </p>
          <p className="text-navy/60 text-lg font-light max-w-2xl mx-auto">
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
              className="bg-white/25 backdrop-blur-md rounded-2xl border border-white/50 ring-1 ring-white/30 shadow-lg shadow-ocean/5 p-5 flex gap-4 hover:bg-white/40 hover:border-white/70 hover:shadow-xl hover:shadow-ocean/10 transition-all"
            >
              <div className="shrink-0 w-7 h-7 rounded-full bg-white/40 flex items-center justify-center mt-0.5">
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-navy text-sm mb-1">{a.ask}</h3>
                <p className="text-navy/55 text-sm leading-relaxed">{a.how}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-mono tracking-wide text-navy/50"
        >
          <span>MemWal</span><span className="text-ocean">·</span>
          <span>Walrus</span><span className="text-ocean">·</span>
          <span>Seal</span><span className="text-ocean">·</span>
          <span>Sui testnet</span>
        </motion.div>
      </div>
    </section>
  );
}
