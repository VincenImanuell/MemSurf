"use client";

import { motion } from "framer-motion";
import { Search, Plus, Sparkles, Compass, Bot, Share2, ShieldCheck, FileBox } from "lucide-react";
import { FloatingChars } from "./FloatingChars";

const features = [
  {
    icon: Compass,
    title: "Discover",
    desc: "Surface what an agent remembers across every namespace. No list API needed — MemSurf finds them for you.",
  },
  {
    icon: Search,
    title: "Search",
    desc: "Ask in plain language. Semantic recall returns the most relevant memories, ranked by distance.",
  },
  {
    icon: Plus,
    title: "Add & Capture",
    desc: "Write a memory straight to Walrus, or paste notes and let MemSurf extract the facts automatically.",
  },
  {
    icon: ShieldCheck,
    title: "Verify on Walrus",
    desc: "Re-fetch any memory's blob from the public Walrus aggregator — proof it's there, Seal-encrypted, tamper-evident.",
  },
  {
    icon: FileBox,
    title: "Artifacts",
    desc: "Upload datasets, logs, and reports directly to Walrus and manage them alongside your agents' memory.",
  },
  {
    icon: Sparkles,
    title: "On-chain",
    desc: "MemSurf's own memsurf::routing Move package is live on Sui — every routing decision is anchored as a tamper-evident on-chain event.",
  },
];

const agents = [
  {
    icon: Bot,
    tag: "Curator Agent",
    title: "Keeps memory honest.",
    desc: "Autonomously flags near-duplicates and vague entries, checks a checklist for gaps — corrects forward, never deletes.",
    specs: [
      { label: "Duplicate", value: "distance" },
      { label: "Vague", value: "heuristic" },
      { label: "Gaps", value: "checklist" },
    ],
  },
  {
    icon: Share2,
    tag: "Router Agent",
    title: "Shares what matters.",
    desc: "Finds the memories from one agent that are relevant to another — by semantic match, gap-aware — routes them across, anchors every decision on Sui, and messages the target. The target can even reject a memory with a reason. No re-prompting.",
    specs: [
      { label: "Match", value: "semantic" },
      { label: "Anchor", value: "on-chain" },
      { label: "Notify", value: "messaging" },
    ],
  },
];

const stack = [
  { name: "MemWal", desc: "the memory layer" },
  { name: "Walrus", desc: "direct read + write" },
  { name: "Seal", desc: "end-to-end encryption" },
  { name: "Sui", desc: "on-chain account & anchors" },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative py-28 px-6 overflow-hidden bg-gradient-to-br from-ocean-light via-wave to-ocean-deep"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/features-ocean-bg.png" alt="" className="absolute inset-0 w-full h-full object-cover" />

      <div className="absolute top-[25%] left-[10%] w-72 h-72 rounded-full bg-white/25 blur-3xl" />
      <div className="absolute top-[20%] right-[5%] w-96 h-96 rounded-full bg-ocean-light/40 blur-3xl" />
      <div className="absolute bottom-[-15%] left-[30%] w-80 h-80 rounded-full bg-white/15 blur-3xl" />

      {/* Bubbles drifting like floating on open water */}
      {[...Array(60)].map((_, i) => {
        const size = 3 + (i % 5) * 2;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/30 border border-white/20"
            style={{ width: `${size}px`, height: `${size}px`, left: `${(i * 41) % 100}%`, top: `${(i * 23) % 100}%` }}
            animate={{
              x: [0, (i % 7) * 6 - 18, (i % 5) * 9 - 14, (i % 4) * 7 - 10, 0],
              y: [0, -((i % 6) * 5 + 6), (i % 4) * 6 - 10, -((i % 5) * 7 + 4), 0],
              opacity: [0, 0.3 + (i % 4) * 0.15, 0.15, 0.5 + (i % 3) * 0.1, 0],
            }}
            transition={{ repeat: Infinity, duration: 2.6 + (i % 6) * 0.6, delay: (i % 8) * 0.4, ease: "easeInOut" }}
          />
        );
      })}

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-5xl lg:text-6xl tracking-tight text-white mb-4">
            <FloatingChars text="Surf, Don't Sink" amplitude={11} duration={5} />
          </h2>
          <p className="text-white/75 text-lg max-w-xl mx-auto font-light">
            <FloatingChars
              text="Everything you need to inspect, verify, curate, and route your agents' memory on Walrus."
              amplitude={7}
              duration={4.6}
            />
          </p>
        </motion.div>

        {/* Capability grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <motion.div
                animate={{ y: [0, -14, 0] }}
                transition={{ repeat: Infinity, duration: 5.5 + i * 0.4, delay: i * 0.25, ease: "easeInOut" }}
                className="group relative h-full bg-white/10 backdrop-blur-md rounded-[24px] p-6 border border-white/20 hover:border-white/40 transition-all hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center mb-5">
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Two autonomous agents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 mt-4"
        >
          <h3 className="font-serif text-3xl text-white mb-2">Two memory-driven agents</h3>
          <p className="text-white/65 text-sm max-w-lg mx-auto font-light">
            Not chatbots — autonomous agents that perceive their Walrus memory, decide, and act. They run on a loop, and every decision is verifiable.
          </p>
        </motion.div>
        <div className="grid lg:grid-cols-2 gap-5 mb-10">
          {agents.map((a, ai) => (
            <motion.div
              key={a.tag}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: ai * 0.1 }}
            >
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ repeat: Infinity, duration: 6.5 + ai, ease: "easeInOut" }}
                className="relative h-full bg-navy rounded-[32px] p-8 overflow-hidden border border-white/10 shadow-2xl"
              >
                <div className="inline-flex items-center gap-2 bg-sunset/20 text-sunset-light text-xs font-mono tracking-widest uppercase px-4 py-2 rounded-full mb-5">
                  <a.icon className="w-3.5 h-3.5" />
                  {a.tag}
                </div>
                <h3 className="font-serif text-3xl text-white mb-3">{a.title}</h3>
                <p className="text-white/60 font-light leading-relaxed mb-6">{a.desc}</p>
                <div className="grid grid-cols-3 gap-3">
                  {a.specs.map((spec) => (
                    <div key={spec.label} className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                      <div className="text-[10px] font-mono tracking-widest uppercase text-white/40 mb-1">{spec.label}</div>
                      <div className="text-xs text-sunset-light font-medium">{spec.value}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Walrus stack strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-[28px] bg-white/10 backdrop-blur-md border border-white/20 p-6 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stack.map((s) => (
            <div key={s.name} className="text-center">
              <div className="font-serif text-xl text-white">{s.name}</div>
              <div className="text-xs text-white/60 font-mono tracking-wide mt-0.5">{s.desc}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Smooth fade into the next section's navy */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-navy pointer-events-none" />
    </section>
  );
}
