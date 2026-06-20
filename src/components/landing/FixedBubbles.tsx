"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// One viewport-pinned ambient bubble layer (position: fixed) shared across all
// the post-hero sections. Because it's fixed, the bubbles stay put while the
// page scrolls — they don't "rise with" the content. Transform/opacity only
// (GPU-composited) + pointer-events-none, so it never adds scroll jank.
// Fades in only after the hero is scrolled past (the hero keeps its own look).
export function FixedBubbles({ count = 72 }: { count?: number }) {
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none z-[30] transition-opacity duration-700"
      style={{ opacity: pastHero ? 1 : 0 }}
    >
      {[...Array(count)].map((_, i) => {
        // Deterministic variation (no Math.random → SSR-safe): small but varied
        // sizes, a wide spread of speeds (some slow, some fast), and depths.
        const size = 1.5 + ((i * 13) % 6) * 0.9; // ~1.5–6px
        const rise = 150 + ((i * 17) % 7) * 55;
        const duration = 3 + ((i * 7) % 10) * 0.95; // ~3–11.5s (slow & fast mix)
        const peak = 0.16 + ((i * 5) % 5) * 0.06;
        const drift = ((i * 11) % 5) * 6 - 12; // slight sideways sway
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${(i * 37) % 100}%`,
              bottom: `${(i * 23) % 100}%`,
              willChange: "transform, opacity",
            }}
            animate={{ x: [0, drift, 0], y: [0, -rise], opacity: [0, peak, 0] }}
            transition={{
              repeat: Infinity,
              repeatType: "loop",
              duration,
              delay: ((i * 3) % 13) * 0.4,
              ease: "linear",
            }}
          />
        );
      })}
    </div>
  );
}
