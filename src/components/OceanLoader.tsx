"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";

// Shared ocean loading screen — deep-sea ambient gradient + colored glows +
// immediate rising bubbles + a one-way (L→R, stops when full) progress slide.
// Used by the landing load gate and the "Launching app" gate.
export function OceanLoader({ status }: { status?: string }) {
  return (
    <motion.div
      role="status"
      aria-label={status ? status : "Loading MemSurf"}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex min-h-dvh items-center justify-center overflow-hidden bg-navy text-white"
    >
      {/* ambient gradient + colored glows so it never looks empty */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(56,189,248,0.4),transparent_36%),linear-gradient(180deg,#0369A1_0%,#0C4A6E_52%,#082F49_100%)]" />
      <div className="absolute -top-24 left-[14%] h-80 w-80 rounded-full bg-wave/25 blur-3xl" />
      <div className="absolute bottom-[-12%] right-[10%] h-96 w-96 rounded-full bg-ocean/30 blur-3xl" />
      <div className="absolute top-1/3 right-[34%] h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white/10 to-transparent" />

      {/* rising bubbles — appear immediately (tiny delays) */}
      {[...Array(40)].map((_, i) => {
        const size = 4 + (i % 5) * 2;
        return (
          <motion.span
            key={i}
            className="absolute rounded-full border border-white/30 bg-white/20"
            style={{ width: size, height: size, left: `${(i * 47) % 100}%`, bottom: `${(i * 19) % 90}%`, willChange: "transform, opacity" }}
            animate={{ x: [0, (i % 6) * 7 - 18, 0], y: [0, -90 - (i % 7) * 24], opacity: [0.5, 0.7, 0], scale: [0.7, 1, 0.75] }}
            transition={{ repeat: Infinity, duration: 3 + (i % 8) * 0.4, delay: (i % 6) * 0.07, ease: "easeInOut" }}
          />
        );
      })}

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="font-serif text-4xl tracking-tight">MemSurf</div>
        {status && (
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-sky-200/80">{status}</div>
        )}

        {/* one-way progress: fills L→R and stops (no bounce-back) */}
        <div className="relative h-16 w-64">
          <div className="absolute left-5 right-5 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-white/15">
            <motion.div
              className="h-full rounded-full bg-white"
              initial={{ width: "6%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.9, ease: "easeInOut" }}
            />
          </div>
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: 200 }}
            transition={{ duration: 1.9, ease: "easeInOut" }}
            className="absolute left-0 top-2 rounded-2xl border border-white/30 bg-white/20 p-2 shadow-2xl shadow-sky-950/30"
          >
            <Logo size={40} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
