/**
 * Runnable demo of MemWalChatMemory — using Walrus as an agent's memory layer
 * inside a LangChain-style loop, without any MemSurf UI.
 *
 * It does two things, proving the round-trip through Walrus testnet:
 *   1. saveContext()  — an agent "remembers" a conversation turn -> written to Walrus
 *   2. loadMemoryVariables() — a later turn recalls that memory back by semantic match
 *
 * Run:
 *   MEMWAL_KEY=<delegate-key-hex> MEMWAL_ACCOUNT_ID=<account-object-id> \
 *     npx tsx examples/langchain-adapter/run.ts
 *
 * Get a delegate key + account id from the MemWal Playground (testnet). These
 * are the same credentials MemSurf's "Connect" screen accepts.
 */

import { MemWalChatMemory } from "../../src/adapters/memwal-langchain";

async function main() {
  const key = process.env.MEMWAL_KEY;
  const accountId = process.env.MEMWAL_ACCOUNT_ID ?? process.env.MEMWAL_ACCOUNT;
  if (!key || !accountId) {
    console.error("Set MEMWAL_KEY and MEMWAL_ACCOUNT_ID env vars (testnet delegate key + account object id).");
    process.exit(1);
  }

  const memory = new MemWalChatMemory({
    key,
    accountId,
    serverUrl: process.env.MEMWAL_SERVER_URL,
    namespace: process.env.MEMWAL_NAMESPACE ?? "langchain-adapter-demo",
    topK: 5,
  });

  // 1. Agent observes and remembers a turn — persisted to Walrus.
  console.log("→ saveContext: persisting a memory to Walrus…");
  await memory.saveContext(
    { input: "Which database did we pick for the project?" },
    { output: "We chose PostgreSQL for the relational data and pgvector for embeddings." }
  );
  console.log("  ✓ written + indexed on Walrus testnet");

  // 2. A later turn recalls the relevant memory back by semantic similarity.
  console.log("→ loadMemoryVariables: recalling for a related question…");
  const recalled = await memory.loadMemoryVariables({ input: "what's our db stack?" });
  console.log("  ✓ recalled from Walrus:\n");
  console.log(recalled[memory.memoryKey] || "  (no memories yet — relayer may still be indexing; re-run)");
}

main().catch((e) => {
  console.error("Adapter demo failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
