"use client";

import { motion } from "framer-motion";
import { SubtleBubbles } from "./SubtleBubbles";

const problems = [
  {
    icon: "/icon-blind.png",
    title: "Building Blind",
    desc: "You store memories into MemWal but have no way to verify they're there, correct, or useful.",
  },
  {
    icon: "/icon-overload.png",
    title: "Memory Overload",
    desc: "Memories accumulate across sessions. No visibility into what's redundant, stale, or conflicting.",
  },
  {
    icon: "/icon-bug.png",
    title: "Agent Debugging Hell",
    desc: "When your agent behaves wrong, you can't trace which memory caused it. Black box, no insight.",
  },
];

export function ProblemSection() {
  return (
    <section className="relative z-20 bg-navy text-white py-28 px-6 overflow-hidden rounded-b-[44px] lg:rounded-b-[80px]">
      <SubtleBubbles count={26} />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center mb-10 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon-invisible.png" alt="" className="w-9 h-9 object-contain" />
            </div>
            <h2 className="font-serif text-4xl lg:text-6xl tracking-tight leading-tight mb-6">
              Don&apos;t Drown
              <br />
              in the Memories.
            </h2>
            <p className="text-white/60 text-base font-light leading-relaxed max-w-md">
              AI agents are only as good as their memory. But right now, that
              memory is invisible — locked inside a write-only layer with no
              way to look back.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative h-[320px] lg:h-[420px] w-full rounded-[32px] bg-gradient-to-br from-ocean via-wave to-ocean-deep overflow-hidden shadow-2xl shadow-black/40 ring-1 ring-white/10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/problem-illustration.png"
              alt="A walrus overwhelmed by scattered memory bubbles"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 border border-white/10 rounded-[32px]" />
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.icon} alt="" className="w-8 h-8 object-contain" />
              </div>
              <h3 className="font-semibold text-white text-lg mb-2">{p.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
