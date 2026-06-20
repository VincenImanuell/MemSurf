"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Waves } from "lucide-react";
import { MagneticButton } from "./MagneticButton";
import { HoloShine } from "./HoloShine";
import { ShinyText } from "./ShinyText";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-ocean-deep via-ocean to-wave pt-28 pb-20">
      {/* Full-bleed background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-surfer.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Scrim for text legibility — concentrated on the left, fully clear past ~55% width */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(3,105,161,0.85) 0%, rgba(3,105,161,0.55) 22%, rgba(3,105,161,0.2) 40%, rgba(3,105,161,0) 58%)",
        }}
      />

      {/* Holographic crystal-glare shine, attached to the hero with scroll lag */}
      <HoloShine />

      {/* Water spray particles */}
      {[...Array(40)].map((_, i) => {
        const size = i % 9 === 0 ? 6 + (i % 3) : 1.5 + (i % 4);
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${(i * 37) % 100}%`,
              bottom: `${(i * 23) % 90}%`,
              background: "radial-gradient(circle at 35% 30%, #ffffff 0%, rgba(255,255,255,0.85) 35%, rgba(186,230,253,0.4) 70%, transparent 100%)",
              boxShadow: `0 0 ${size * 1.8}px rgba(255,255,255,0.9)`,
            }}
            animate={{
              x: [0, 40 + (i % 5) * 14],
              y: [0, -60 - (i % 5) * 16],
              opacity: [0, 1, 0],
              scale: [0.7, 1.15, 0.7],
            }}
            transition={{
              repeat: Infinity,
              repeatType: "loop",
              duration: 1.6 + (i % 6) * 0.35,
              delay: (i % 10) * 0.2,
              ease: "linear",
            }}
          />
        );
      })}

      {/* Content */}
      <div className="relative z-10 px-6 max-w-6xl mx-auto w-full">
        <div className="text-left max-w-2xl lg:-translate-x-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/30 text-white/90 font-mono text-xs tracking-widest uppercase mb-8"
          >
            <Waves className="w-4 h-4" />
            <ShinyText duration={6} glow="rgba(255,255,255,0.5)">Powered by Walrus Memory</ShinyText>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="font-serif text-6xl md:text-7xl lg:text-8xl font-medium text-white mb-6 leading-[1.05] tracking-tight"
          >
            <ShinyText>Ride Your</ShinyText>
            <br />
            <ShinyText base="#FDBA74" band="#fff6ea" glow="rgba(253,186,116,0.5)" className="italic">
              Agents&apos;
            </ShinyText>{" "}
            <ShinyText>Memory</ShinyText>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="text-lg md:text-xl text-white/80 mb-10 max-w-xl font-light"
          >
            The command center for agent memory on Walrus. Inspect and verify it
            yourself — or let MemSurf&apos;s own autonomous agents curate and route
            it for you. Works for one agent, built for many.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-5"
          >
            <MagneticButton>
              <Link
                href="/connect"
                className="inline-flex items-center justify-center gap-2 bg-sunset hover:bg-sunset/90 text-white rounded-full px-8 py-4 font-mono text-xs tracking-widest uppercase font-medium shadow-lg shadow-sunset/30 transition-colors"
              >
                Catch the Wave <ArrowRight className="w-4 h-4" />
              </Link>
            </MagneticButton>
            <MagneticButton>
              <a
                href="https://docs.wal.app/walrus-memory/getting-started/what-is-memwal"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center border border-white/40 text-white hover:bg-white/10 rounded-full px-8 py-4 font-mono text-xs tracking-widest uppercase transition-colors"
              >
                View MemWal Docs
              </a>
            </MagneticButton>
          </motion.div>
        </div>
      </div>

      {/* Smooth fade into the next section's navy, instead of a hard color cut */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-navy pointer-events-none" />
    </section>
  );
}
