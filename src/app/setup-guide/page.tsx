"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Wallet, Droplets, KeyRound, Waves, ArrowRight, ExternalLink } from "lucide-react";
import { Logo } from "@/components/Logo";

const STEPS = [
  {
    icon: Wallet,
    title: "Get a Sui Wallet",
    description:
      "Install a Sui wallet extension (e.g. Sui Wallet, Slush) if you don't have one yet. Switch the network to Testnet.",
    link: { label: "Sui Wallet docs", href: "https://docs.sui.io/guides/developer/getting-started/get-sui-tokens" },
  },
  {
    icon: Droplets,
    title: "Claim Testnet SUI",
    description:
      "You need a small amount of testnet SUI to cover gas for creating your MemWal account. Claim some for free from the faucet.",
    link: { label: "Sui Testnet Faucet", href: "https://faucet.sui.io" },
  },
  {
    icon: KeyRound,
    title: "Create Your MemWal Account",
    description:
      "Open the MemWal Playground, connect your wallet, and generate your account ID and delegate key. This is your agent's identity on Walrus Memory.",
    link: { label: "MemWal Playground (Testnet)", href: "https://staging.memory.walrus.xyz" },
  },
  {
    icon: Waves,
    title: "Connect to MemSurf",
    description:
      "Copy your delegate key and account ID from the Playground, then paste them into MemSurf's Connect page. You're ready to surf your memories.",
    link: null,
  },
];

export default function SetupGuidePage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-ocean-light via-wave to-ocean-deep px-4 py-16 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/features-ocean-bg.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute top-[-10%] left-[10%] w-72 h-72 rounded-full bg-white/25 blur-3xl" />
      <div className="absolute bottom-[-15%] right-[10%] w-80 h-80 rounded-full bg-white/15 blur-3xl" />

      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Logo size={40} />
            <span className="font-serif text-white text-xl">MemSurf</span>
          </div>
          <h1 className="text-3xl font-serif text-white mb-3">New to Walrus Memory?</h1>
          <p className="text-white/75 font-light max-w-md mx-auto">
            Four quick steps to get your MemWal account ready — no MemSurf account or signup needed, you bring your own Walrus identity.
          </p>
        </div>

        <div className="space-y-4">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/40 p-6 flex gap-4 shadow-xl"
            >
              <div className="shrink-0 flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-ocean/10 flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-ocean" />
                </div>
                {i < STEPS.length - 1 && <div className="w-px flex-1 bg-ocean/10 mt-2" />}
              </div>
              <div className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-ocean">STEP {i + 1}</span>
                </div>
                <h3 className="font-serif text-lg text-navy mb-1.5">{step.title}</h3>
                <p className="text-sm text-navy/60 font-light leading-relaxed mb-2">{step.description}</p>
                {step.link && (
                  <a
                    href={step.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-ocean hover:text-ocean-deep font-medium"
                  >
                    {step.link.label}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/connect"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-sunset to-sunset-light text-white rounded-xl px-6 py-3 font-semibold shadow-lg shadow-sunset/30 hover:opacity-90 transition-opacity"
          >
            I&apos;m ready, take me to Connect
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="mt-4">
            <Link href="/" className="text-white/70 hover:text-white text-sm transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
