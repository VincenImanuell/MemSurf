"use client";

import { motion } from "framer-motion";

export function FloatingChars({
  text,
  className,
  amplitude = 6,
  duration = 2.4,
}: {
  text: string;
  className?: string;
  amplitude?: number;
  duration?: number;
}) {
  const words = text.split(" ");
  const elements: React.ReactNode[] = [];
  let charIndex = 0;

  words.forEach((word, wi) => {
    elements.push(
      <span key={`w-${wi}`} className="inline-block" aria-hidden="true">
        {word.split("").map((char) => {
          const idx = charIndex++;
          return (
            <motion.span
              key={idx}
              className="inline-block"
              animate={{ y: [0, -amplitude, 0] }}
              transition={{
                repeat: Infinity,
                duration,
                delay: idx * 0.05,
                ease: "easeInOut",
              }}
            >
              {char}
            </motion.span>
          );
        })}
      </span>
    );
    if (wi < words.length - 1) elements.push(" ");
  });

  return (
    <span className={className} aria-label={text}>
      {elements}
    </span>
  );
}
