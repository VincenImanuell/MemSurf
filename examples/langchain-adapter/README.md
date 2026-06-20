# MemWal × LangChain memory adapter

Use **Walrus** as the long-term memory layer for an agent built with an existing
framework — not just inside the MemSurf dashboard.

[`src/adapters/memwal-langchain.ts`](../../src/adapters/memwal-langchain.ts)
exports `MemWalChatMemory`, a class whose interface mirrors LangChain.js
`BaseChatMemory` (`memoryKeys`, `loadMemoryVariables`, `saveContext`, `clear`).
Internally it calls the **same** MemWal client the dashboard uses
([`src/lib/memwal.ts`](../../src/lib/memwal.ts)), so every memory an agent writes
through the adapter is immediately inspectable, verifiable, and routable in MemSurf.

## Run it

```bash
MEMWAL_KEY=<delegate-key-hex> \
MEMWAL_ACCOUNT_ID=<account-object-id> \
npx tsx examples/langchain-adapter/run.ts
```

Grab a delegate key + account id from the MemWal Playground (testnet) — the same
credentials MemSurf's **Connect** screen accepts. The script:

1. `saveContext(...)` — writes a conversation turn to Walrus (`rememberAndWait`
   blocks until the relayer indexes the blob).
2. `loadMemoryVariables(...)` — recalls it back by semantic similarity on a
   related question.

If the recall comes back empty on the first run, the relayer is still indexing —
wait a few seconds and run again.

## Wire it into a LangChain agent

```ts
import { MemWalChatMemory } from "./src/adapters/memwal-langchain";

const memory = new MemWalChatMemory({
  key: process.env.MEMWAL_KEY!,
  accountId: process.env.MEMWAL_ACCOUNT_ID!,
  namespace: "research-agent",   // this agent's Walrus namespace
  memoryKey: "history",          // prompt variable the recalled memory fills
  topK: 5,
});

// Pass `memory` to a LangChain chain/agent expecting a BaseChatMemory, or call
// loadMemoryVariables() / saveContext() directly in your own agent loop.
```

Because every namespace is just a Walrus memory space, two agents pointed at the
same account can share or hand off memory — and you can watch it happen live in
the MemSurf dashboard (Discover, Verify, Router).
