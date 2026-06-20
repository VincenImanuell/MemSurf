"use client";

const STORAGE_KEY = "memsurf-session";

export interface Session {
  /** When true, the server uses its own env credentials (judges can explore without an account). */
  demo: boolean;
  /** Ed25519 delegate private key (hex) — only set for non-demo sessions. */
  key?: string;
  /** MemWalAccount object id on Sui — only set for non-demo sessions. */
  accountId?: string;
}

export function saveSession(session: Session) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function loadSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function clearSession() {
  sessionStorage.removeItem(STORAGE_KEY);
}
