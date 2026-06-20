"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

// Shiny text: a bright highlight band sweeps across the text (metallic sheen).
// Uses bg-clip-text + an animated gradient position.
export function ShinyText({
  children,
  className = "",
  base = "#cfe3ff",
  band = "#ffffff",
  glow = "rgba(186,230,253,0.45)",
  duration = 5,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  base?: string;
  band?: string;
  glow?: string;
  duration?: number;
  delay?: number;
}) {
  return (
    <motion.span
      className={className}
      style={{
        display: "inline-block",
        // extend the paintable (clip) box below the baseline so descenders
        // (g, y, p) aren't cut; negative margin keeps layout unchanged.
        lineHeight: 1.1,
        paddingBottom: "0.16em",
        marginBottom: "-0.16em",
        backgroundImage: `linear-gradient(110deg, ${base} 30%, ${band} 50%, ${base} 70%)`,
        backgroundSize: "250% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
        filter: `drop-shadow(0 0 18px ${glow})`,
        willChange: "background-position",
      }}
      animate={{ backgroundPositionX: ["250%", "-50%"] }}
      transition={{ repeat: Infinity, duration, delay, ease: "linear" }}
    >
      {children}
    </motion.span>
  );
}
