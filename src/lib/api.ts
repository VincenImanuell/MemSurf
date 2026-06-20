"use client";

import { loadSession } from "./session";

export type MemWalAction =
  | "validate"
  | "recall"
  | "discover"
  | "remember"
  | "analyze"
  | "restore"
  | "transfer"
  | "curate"
  | "route"
  | "route-apply"
  | "verify"
  | "onchain"
  | "upload-artifact";

/**
 * Call the server-side MemWal proxy. Credentials come from the current session:
 * either the user's delegate key/accountId, or demo mode (server uses env creds).
 */
export async function callMemWal<T = unknown>(
  action: MemWalAction,
  params: Record<string, unknown> = {}
): Promise<T> {
  const session = loadSession();
  if (!session) throw new Error("Not connected. Please connect your agent first.");

  const body = session.demo
    ? { action, demo: true, ...params }
    : { action, key: session.key, accountId: session.accountId, ...params };

  const res = await fetch("/api/memwal", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? "Request failed");
  return data as T;
}
