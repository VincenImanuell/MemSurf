"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MagneticButton } from "./MagneticButton";
import { Logo } from "@/components/Logo";

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

      <div className="flex items-center gap-6">
        <a
          href="#features"
          onClick={scrollToSection("features")}
          className="font-mono text-xs tracking-widest uppercase text-navy/60 hover:text-navy transition-colors"
        >
          Features
        </a>
        <a
          href="#how-it-works"
          onClick={scrollToSection("how-it-works")}
          className="font-mono text-xs tracking-widest uppercase text-navy/60 hover:text-navy transition-colors"
        >
          How it works
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
