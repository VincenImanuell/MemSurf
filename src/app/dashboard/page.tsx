"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { NamespaceSelector } from "@/components/dashboard/NamespaceSelector";
import { DiscoverMode } from "@/components/dashboard/DiscoverMode";
import { SearchMode } from "@/components/dashboard/SearchMode";
import { AddMemoryMode } from "@/components/dashboard/AddMemoryMode";
import { CaptureMode } from "@/components/dashboard/CaptureMode";
import { CuratorMode } from "@/components/dashboard/CuratorMode";
import { RouterMode } from "@/components/dashboard/RouterMode";
import { ArtifactsMode } from "@/components/dashboard/ArtifactsMode";
import { OnChainPanel } from "@/components/dashboard/OnChainPanel";
import { loadSession, type Session } from "@/lib/session";
import { cn } from "@/lib/utils";

type Mode = "discover" | "search" | "add" | "capture" | "curator" | "router" | "artifacts";

// Browsable namespaces (everything, incl. system spaces) for the selector.
const NAMESPACES = ["coding-agent", "research-agent", "trading-bot", "memory-router", "artifacts", "default"];
// Only real agents are valid transfer/route targets (not memory-router / artifacts).
const AGENTS = ["coding-agent", "research-agent", "trading-bot", "default"];
const DASHBOARD_THEME_KEY = "memsurf-dashboard-theme";

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [mode, setMode] = useState<Mode>("discover");
  const [namespace, setNamespace] = useState("coding-agent");
  const [isDarkMode, setIsDarkMode] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(DASHBOARD_THEME_KEY) === "dark"
  );

  // Connection guard — bounce to /connect if there's no active session.
  useEffect(() => {
    const s = loadSession();
    if (!s) {
      router.replace("/connect");
      return;
    }
    setSession(s);
  }, [router]);

  const toggleTheme = () => {
    setIsDarkMode((current) => {
      const next = !current;
      localStorage.setItem(DASHBOARD_THEME_KEY, next ? "dark" : "light");
      return next;
    });
  };

  if (session === undefined) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-seafoam">
        <div className="relative flex h-20 w-20 items-center justify-center">
          {/* soft pulse + spinning ring around the brand mark */}
          <span className="absolute h-20 w-20 rounded-full bg-ocean/10 animate-ping" />
          <span className="absolute h-20 w-20 rounded-full border-2 border-ocean/15 border-t-ocean animate-spin" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="MemSurf" className="h-11 w-11 rounded-xl object-contain" />
        </div>
        <div className="text-center">
          <p className="font-serif text-lg text-navy">MemSurf</p>
          <p className="mt-1 text-xs font-mono uppercase tracking-[0.2em] text-ocean/60">
            Loading your memory layer…
          </p>
        </div>
      </div>
    );
  }
  if (session === null) return null;

  return (
    <div
      className={cn(
        "flex min-h-screen bg-seafoam transition-colors duration-300",
        isDarkMode && "dark bg-slate-950"
      )}
    >
      <DashboardSidebar mode={mode} onModeChange={setMode} />

      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-ocean/10 flex items-center justify-between px-6 shrink-0 transition-colors duration-300 dark:bg-slate-900 dark:border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-sm text-navy/50 dark:text-white/50">Namespace</span>
            <NamespaceSelector
              namespace={namespace}
              namespaces={NAMESPACES}
              onSelect={setNamespace}
            />
          </div>

          <div className="flex items-center gap-3">
            {session.accountId && <OnChainPanel accountId={session.accountId} />}
            {session.demo && (
              <span
                title="Sample agents — coding-agent, research-agent and trading-bot are example namespaces. Connect your own delegate key to manage your agents' memory."
                className="text-xs font-medium px-2.5 py-1 rounded-full bg-sunset/15 text-sunset border border-sunset/20 cursor-help"
              >
                Demo · sample agents
              </span>
            )}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              className="inline-flex size-9 items-center justify-center rounded-xl border border-ocean/15 bg-seafoam text-navy transition-all hover:border-ocean/40 hover:bg-ocean/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-navy/50 dark:text-white/50">Connected to Walrus</span>
            </div>
          </div>
        </header>

        {/* Main content — modes stay mounted so their state (and the Router's
            Live loop) survives switching tabs; inactive ones are just hidden. */}
        <main className="flex-1 overflow-y-auto transition-colors duration-300">
          <div className={mode === "discover" ? "" : "hidden"}>
            <DiscoverMode namespace={namespace} namespaces={AGENTS} active={mode === "discover"} />
          </div>
          <div className={mode === "search" ? "" : "hidden"}>
            <SearchMode namespace={namespace} namespaces={AGENTS} />
          </div>
          <div className={mode === "add" ? "" : "hidden"}>
            <AddMemoryMode namespace={namespace} namespaces={NAMESPACES} />
          </div>
          <div className={mode === "capture" ? "" : "hidden"}>
            <CaptureMode namespace={namespace} />
          </div>
          <div className={mode === "curator" ? "" : "hidden"}>
            <CuratorMode namespace={namespace} />
          </div>
          <div className={mode === "router" ? "" : "hidden"}>
            <RouterMode namespace={namespace} namespaces={AGENTS} />
          </div>
          <div className={mode === "artifacts" ? "" : "hidden"}>
            <ArtifactsMode active={mode === "artifacts"} />
          </div>
        </main>
      </div>
    </div>
  );
}
