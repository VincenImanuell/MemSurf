"use client";

import { motion } from "framer-motion";
import { FlaskConical, TrendingUp, Share2, ArrowRight } from "lucide-react";
import { SubtleBubbles } from "./SubtleBubbles";

function AgentCard({
  icon: Icon,
  name,
  line,
  align,
}: {
  icon: React.ElementType;
  name: string;
  line: string;
  align: "left" | "right";
}) {
  return (
    <div className={`w-full max-w-[200px] ${align === "right" ? "lg:ml-auto" : ""}`}>
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-5">
        <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center mb-3">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="font-mono text-xs tracking-widest uppercase text-white/50 mb-1">{name}</div>
        <p className="text-white/80 text-sm leading-relaxed">{line}</p>
      </div>
    </div>
  );
}

export function MultiAgentSection() {
  return (
    <section className="relative bg-navy text-white py-28 px-6 overflow-hidden">
      <SubtleBubbles count={28} />
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-sunset/20 text-sunset-light text-xs font-mono tracking-widest uppercase px-4 py-2 rounded-full mb-5">
            <Share2 className="w-3.5 h-3.5" />
            Multi-agent · example
          </div>
          <h2 className="font-serif text-4xl lg:text-6xl tracking-tight mb-4">Agents that build on each other.</h2>
          <p className="text-white/60 text-lg font-light max-w-2xl mx-auto">
            One agent&apos;s discovery becomes another&apos;s advantage. MemSurf&apos;s Router moves the
            <span className="text-white"> relevant </span> memory between agents on Walrus, and the result flows
            <span className="text-white"> back</span> — a closed loop, no re-prompting, no copy-paste.
          </p>
        </motion.div>

        {/* A → MemSurf → B flow */}
        <div className="grid lg:grid-cols-[1fr_auto_1fr] items-center gap-8 lg:gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <AgentCard
              icon={FlaskConical}
              name="research-agent"
              line="“Pairs with high Pearson correlation outperformed cointegration last month.”"
              align="left"
            />
          </motion.div>

          {/* center: MemSurf Router with animated memory packets */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative flex flex-col items-center"
          >
            {/* flow line */}
            <div className="relative hidden lg:block w-full h-px">
              <div className="absolute inset-0 bg-gradient-to-r from-wave/0 via-wave/60 to-wave/0" />
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-sunset-light shadow-[0_0_8px_2px_rgba(253,186,116,0.6)]"
                  animate={{ left: ["-10%", "110%"], opacity: [0, 1, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 2.4, delay: i * 0.8, ease: "linear" }}
                />
              ))}
            </div>
            <div className="my-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-ocean to-wave flex items-center justify-center shadow-lg shadow-ocean/40 border border-white/20">
              <Share2 className="w-9 h-9 text-white" />
            </div>
            <div className="font-mono text-[10px] tracking-widest uppercase text-white/50">MemSurf Router</div>
            <div className="text-xs text-white/40 mt-1">relevant → copy · else skip</div>

            {/* feedback line — result flowing back, right → left */}
            <div className="relative hidden lg:block w-full h-px mt-5">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/50 to-emerald-400/0" />
              {[0, 1].map((i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-300 shadow-[0_0_8px_2px_rgba(110,231,183,0.6)]"
                  animate={{ left: ["110%", "-10%"], opacity: [0, 1, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 2.6, delay: i * 1.1, ease: "linear" }}
                />
              ))}
            </div>
            <div className="text-[10px] text-emerald-300/70 mt-1.5 font-mono tracking-wide">↩ result feeds back</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <AgentCard
              icon={TrendingUp}
              name="trading-bot"
              line="Reads the routed finding → switches to Pearson ranking, measures +2.9% — and that result routes back to research."
              align="right"
            />
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-white/40 text-sm mt-12 flex items-center justify-center gap-2 flex-wrap"
        >
          Every routing decision is logged as memory on Walrus and anchored on Sui
          <ArrowRight className="w-3.5 h-3.5" />
          fully auditable on-chain, no agent acts on something it can&apos;t trace.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center text-white/35 text-xs mt-4 max-w-xl mx-auto"
        >
          <span className="font-mono uppercase tracking-widest text-white/45">Example</span> — research-agent and
          trading-bot are sample agents standing in for your own. MemSurf doesn&apos;t build the agents; it&apos;s the
          memory layer <span className="italic">between</span> whatever agents you run.
        </motion.p>
      </div>

    </section>
  );
}
