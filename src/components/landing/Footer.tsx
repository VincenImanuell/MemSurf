import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="relative text-white pt-16 pb-10 px-6 border-t border-white/10">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-10 border-b border-white/10">
          <div className="flex flex-col items-center md:items-start gap-1.5">
            <div className="flex items-center gap-2">
              <Logo size={36} />
              <span className="font-serif text-xl text-white">MemSurf</span>
            </div>
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-white/40">Surf with MemSurf</span>
          </div>

          <div className="flex items-center gap-8 font-mono text-xs tracking-widest uppercase text-white/50">
            <Link href="/connect" className="hover:text-white transition-colors">
              Launch App
            </Link>
            <Link href="/setup-guide" className="hover:text-white transition-colors">
              Setup Guide
            </Link>
            <a
              href="https://docs.wal.app/walrus-memory/getting-started/what-is-memwal"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              MemWal Docs
            </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 text-xs font-mono tracking-widest uppercase text-white/40 gap-4">
          <p>Built for SUI Overflow 2026 — Walrus Track</p>
          <p>
            Powered by{" "}
            <a
              href="https://walrus.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-wave hover:text-white transition-colors"
            >
              Walrus
            </a>{" "}
            &{" "}
            <a
              href="https://sui.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-wave hover:text-white transition-colors"
            >
              Sui
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
