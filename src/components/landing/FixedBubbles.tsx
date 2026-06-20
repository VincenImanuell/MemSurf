"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// One viewport-pinned ambient bubble layer (position: fixed) shared across all
// the post-hero sections. Because it's fixed, the bubbles stay put while the
// page scrolls — they don't "rise with" the content. Transform/opacity only
// (GPU-composited) + pointer-events-none, so it never adds scroll jank.
// Fades in only after the hero is scrolled past (the hero keeps its own look).
export function FixedBubbles({ count = 26 }: { count?: number }) {
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
        const size = 2 + (i % 4) * 1.5;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${(i * 53) % 100}%`,
              bottom: `${(i * 29) % 100}%`,
              willChange: "transform, opacity",
            }}
            animate={{ y: [0, -180 - (i % 5) * 40], opacity: [0, 0.26, 0] }}
            transition={{
              repeat: Infinity,
              repeatType: "loop",
              duration: 9 + (i % 7) * 1.6,
              delay: (i % 9) * 0.8,
              ease: "linear",
            }}
          />
        );
      })}
    </div>
  );
}
