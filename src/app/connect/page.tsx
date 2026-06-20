"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { saveSession } from "@/lib/session";

export default function ConnectPage() {
  const router = useRouter();
  const [delegateKey, setDelegateKey] = useState("");
  const [accountId, setAccountId] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!delegateKey || !accountId) return;
    setIsConnecting(true);
    setError(null);
    try {
      const res = await fetch("/api/memwal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "validate",
          key: delegateKey.trim(),
          accountId: accountId.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Could not connect.");
      saveSession({ demo: false, key: delegateKey.trim(), accountId: accountId.trim() });
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not connect. Check your credentials.");
      setIsConnecting(false);
    }
  };

  const handleDemo = async () => {
    setIsDemoLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/memwal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "validate", demo: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Demo is unavailable right now.");
      saveSession({ demo: true, accountId: data?.accountId });
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Demo is unavailable right now.");
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-ocean-light via-wave to-ocean-deep flex items-center justify-center px-4 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/features-ocean-bg.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Bubbles drifting erratically, like floating on real open water */}
      {[...Array(60)].map((_, i) => {
        const size = 3 + (i % 5) * 2;
        return (
          <motion.div
            key={i}
            className="fixed rounded-full bg-white/30 border border-white/20"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${(i * 41) % 100}%`,
              top: `${(i * 23) % 100}%`,
            }}
            animate={{
              x: [0, (i % 7) * 6 - 18, (i % 5) * 9 - 14, (i % 4) * 7 - 10, 0],
              y: [0, -((i % 6) * 5 + 6), (i % 4) * 6 - 10, -((i % 5) * 7 + 4), 0],
              opacity: [0, 0.3 + (i % 4) * 0.15, 0.15, 0.5 + (i % 3) * 0.1, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 2.6 + (i % 6) * 0.6,
              delay: (i % 8) * 0.4,
              ease: "easeInOut",
            }}
          />
        );
      })}

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        {/* Card — soft frosted blue (less glare than pure white) + deep shadow */}
        <div className="bg-foam/90 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-ocean-deep/40 ring-1 ring-white/40 p-8">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <Logo size={40} />
            <span className="font-serif text-navy text-xl">MemSurf</span>
          </div>

          <h1 className="text-2xl font-serif text-navy mb-2">Connect Your Agent</h1>
          <p className="text-navy/75 text-sm mb-8">
            Enter your MemWal credentials to start surfing your agent&apos;s memories.
          </p>

          <div className="space-y-4">
            {/* Delegate Key */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy">Delegate Key</label>
              <div className="relative">
                <Input
                  type={showKey ? "text" : "password"}
                  placeholder="Enter your Ed25519 delegate key (hex)"
                  value={delegateKey}
                  onChange={(e) => setDelegateKey(e.target.value)}
                  className="pr-10 border-ocean/30 focus:border-ocean focus:ring-ocean/20 rounded-xl text-navy placeholder:text-navy/40"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  aria-label={showKey ? "Hide delegate key" : "Show delegate key"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/40 hover:text-navy/70 transition-colors"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Account ID */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy">Account ID</label>
              <Input
                type="text"
                placeholder="MemWalAccount object ID on Sui"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="border-ocean/30 focus:border-ocean focus:ring-ocean/20 rounded-xl text-navy placeholder:text-navy/40"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              onClick={handleConnect}
              disabled={!delegateKey || !accountId || isConnecting || isDemoLoading}
              className="w-full bg-gradient-to-r from-ocean-deep to-ocean text-white rounded-xl py-6 text-base font-semibold shadow-lg shadow-ocean/30 hover:opacity-90 disabled:opacity-50 mt-2"
            >
              {isConnecting ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Connecting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Catch the Wave <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>

            <button
              type="button"
              onClick={handleDemo}
              disabled={isConnecting || isDemoLoading}
              className="w-full text-center text-xs text-ocean/70 hover:text-ocean transition-colors py-1 disabled:opacity-50"
            >
              {isDemoLoading ? "Loading demo…" : "✦ Explore the demo (no account needed)"}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-ocean/10 text-center">
            <Link
              href="/setup-guide"
              className="inline-flex items-center gap-1.5 text-sm text-ocean hover:text-ocean-deep transition-colors"
            >
              New here? Get your MemWal credentials
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-white/70 hover:text-white text-sm transition-colors">
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
