"use client";

import { motion } from "framer-motion";
import { KeyRound, Waves, Share2 } from "lucide-react";

const steps = [
  {
    icon: KeyRound,
    step: "01",
    title: "Connect",
    desc: "Paste your MemWal delegate key — or click Explore the demo. MemSurf reads your agents' memory straight from Walrus.",
  },
  {
    icon: Waves,
    step: "02",
    title: "Inspect & verify",
    desc: "Discover and search what each agent remembers, then verify any memory independently against the public Walrus aggregator.",
  },
  {
    icon: Share2,
    step: "03",
    title: "Curate & route",
    desc: "Two autonomous agents clean memory (Curator) and share the right knowledge between agents (Router), anchoring each routing on Sui — no re-prompting, no code.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 px-6">
      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-5xl lg:text-6xl tracking-tight text-white mb-4">How It Works</h2>
          <p className="text-white/60 text-lg font-light">Three steps to full visibility into your agent&apos;s memory.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-gradient-to-r from-white/10 via-wave/60 to-white/10" />

          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              className="relative text-center"
            >
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-ocean to-wave shadow-lg shadow-ocean/30 mb-6">
                <s.icon className="w-8 h-8 text-white" />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-sunset text-white text-xs font-bold flex items-center justify-center">
                  {s.step}
                </span>
              </div>
              <h3 className="font-serif text-lg text-white mb-2">{s.title}</h3>
              <p className="text-white/60 text-sm font-light leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
