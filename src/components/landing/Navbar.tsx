"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MagneticButton } from "./MagneticButton";
import { Logo } from "@/components/Logo";

function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.12-.31-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.18.77.84 1.24 1.91 1.24 3.23 0 4.63-2.8 5.65-5.48 5.95.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
    </svg>
  );
}

function scrollToSection(id: string) {
  return (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    if (window.__lenis) {
      window.__lenis.scrollTo(target);
    } else {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };
}

export function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-white/60 border-b border-ocean/10"
    >
      <Link href="/" className="flex items-center gap-2.5">
        <span className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-ocean-deep to-navy p-1.5 shadow-sm ring-1 ring-white/15">
          <Logo size={28} />
        </span>
        <span className="font-serif text-lg text-navy tracking-tight">MemSurf</span>
      </Link>

      <div className="flex items-center gap-5 sm:gap-6">
        <a
          href="#features"
          onClick={scrollToSection("features")}
          className="hidden sm:inline font-mono text-xs tracking-widest uppercase text-navy/60 hover:text-navy transition-colors"
        >
          Features
        </a>
        <a
          href="#agents"
          onClick={scrollToSection("agents")}
          className="hidden md:inline font-mono text-xs tracking-widest uppercase text-navy/60 hover:text-navy transition-colors"
        >
          Agents
        </a>
        <a
          href="#how-it-works"
          onClick={scrollToSection("how-it-works")}
          className="hidden sm:inline font-mono text-xs tracking-widest uppercase text-navy/60 hover:text-navy transition-colors"
        >
          How it works
        </a>
        <a
          href="https://github.com/VincenImanuell/MemSurf"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="MemSurf on GitHub"
          className="text-navy/60 hover:text-navy transition-colors"
        >
          <GithubMark className="w-4 h-4" />
        </a>
        <MagneticButton>
          <Link
            href="/connect"
            className="inline-flex items-center bg-gradient-to-r from-ocean to-wave text-white hover:opacity-90 rounded-full px-5 py-2 font-mono text-xs tracking-widest uppercase font-medium transition-opacity"
          >
            Launch App
          </Link>
        </MagneticButton>
      </div>
    </motion.nav>
  );
}
