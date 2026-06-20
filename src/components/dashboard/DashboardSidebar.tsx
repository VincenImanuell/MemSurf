"use client";

import Link from "next/link";
import { Compass, Search, Plus, Sparkles, Bot, Share2, FileBox, LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

type Mode = "discover" | "search" | "add" | "capture" | "curator" | "router" | "artifacts";

const navGroups: { label: string; items: { id: Mode; icon: React.ElementType; label: string }[] }[] = [
  {
    label: "Memory",
    items: [
      { id: "discover", icon: Compass, label: "Discover" },
      { id: "search", icon: Search, label: "Search" },
      { id: "add", icon: Plus, label: "Add Memory" },
      { id: "capture", icon: Sparkles, label: "Capture" },
    ],
  },
  {
    label: "Agents",
    items: [
      { id: "curator", icon: Bot, label: "Curator Agent" },
      { id: "router", icon: Share2, label: "Router Agent" },
    ],
  },
  {
    label: "Data",
    items: [{ id: "artifacts", icon: FileBox, label: "Artifacts" }],
  },
];

interface Props {
  mode: Mode;
  onModeChange: (m: Mode) => void;
}

export function DashboardSidebar({ mode, onModeChange }: Props) {
  return (
    <aside className="w-64 min-h-screen bg-navy flex flex-col border-r border-white/10 transition-colors duration-300 dark:bg-slate-950 dark:border-white/10">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={32} />
          <span className="font-serif text-white text-lg">MemSurf</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-5 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <p className="px-4 text-[10px] font-mono tracking-widest uppercase text-white/30 mb-1">
              {group.label}
            </p>
            {group.items.map((item) => (
              <button
                key={item.id}
                onClick={() => onModeChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                  mode === item.id
                    ? "bg-gradient-to-r from-ocean to-wave text-white shadow-md shadow-ocean/30"
                    : "text-white/50 hover:text-white hover:bg-white/10"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </Link>
      </div>
    </aside>
  );
}
