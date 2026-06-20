"use client";

import { motion } from "framer-motion";

export function SubtleBubbles({
  count = 18,
  tone = "light",
}: {
  count?: number;
  /** "light" = white bubbles for dark sections; "dark" = ocean-tinted for light sections */
  tone?: "light" | "dark";
}) {
  const color = tone === "dark" ? "bg-ocean/25" : "bg-white";
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(count)].map((_, i) => {
        const size = 3 + (i % 4) * 1.5;
        return (
          <motion.div
            key={i}
            className={`absolute rounded-full ${color}`}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${(i * 53) % 100}%`,
              bottom: `${(i * 31) % 100}%`,
            }}
            animate={{
              y: [0, -120 - (i % 5) * 30],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              repeat: Infinity,
              repeatType: "loop",
              duration: 6 + (i % 7) * 1.4,
              delay: (i % 9) * 0.8,
              ease: "linear",
            }}
          />
        );
      })}
    </div>
  );
}
