"use client";

import { motion } from "framer-motion";

const COLORS = ["#ff5e5e", "#ffe45e", "#5eff8f", "#5ecbff", "#b35eff", "#ff5ed1"];

export function HoloShine() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(28)].map((_, i) => {
        const size = 2 + (i % 4) * 1.5;
        const color = COLORS[i % COLORS.length];
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${(i * 29) % 100}%`,
              bottom: `${(i * 17) % 95}%`,
              backgroundColor: color,
              boxShadow: `0 0 ${size * 2}px ${color}`,
              mixBlendMode: "screen",
            }}
            animate={{
              x: [0, 30 + (i % 5) * 12],
              y: [0, -40 - (i % 5) * 14],
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              repeat: Infinity,
              repeatType: "loop",
              duration: 2.4 + (i % 6) * 0.4,
              delay: (i % 10) * 0.3,
              ease: "easeOut",
            }}
          />
        );
      })}
    </div>
  );
}
