# MemSurf — Submission (DeepSurge)

Copy-paste fields for the Overflow 2026 submission form.

---

**Project name**
> MemSurf

**Tagline (one line)**
> The command center for AI agent memory on Walrus — inspect, verify, curate, and route it.

**Positioning (read first)**
> MemSurf is the **memory-management layer**, not an agent. The autonomous, long-running
> agents here are MemSurf's own **Curator** and **Router**. `coding-agent` / `research-agent` /
> `trading-bot` are **example client namespaces** standing in for your own agents — they show
> what MemSurf manages, they are not the deliverable.

**Short description**
> MemSurf is a developer tool + agentic layer on top of MemWal that makes Walrus
> agent-memory observable, verifiable, and shareable. Inspect what your agents
> remember, verify each memory independently on Walrus, run an autonomous Curator
> to keep memory clean, and a Router that shares the right knowledge between agents.

**Full description**
> AI agents store memory, but that memory is a black box: you can't see what an
> agent remembers, verify it's really on Walrus, spot duplicates and gaps, or move
> what one agent learned to another. MemSurf fixes that.
>
> **Inspect** — Discover and semantically search any agent's memory across namespaces.
> **Verify** — Re-fetch any memory's blob from the public Walrus aggregator: proof it
> exists, is Seal-encrypted, and is content-addressed (tamper-evident).
> **Curate (Agent)** — An autonomous agent flags near-duplicates and vague entries and
> checks a checklist for gaps — correcting forward, never deleting (Walrus is immutable).
> **Route (Agent)** — A second autonomous agent finds the memories from one agent that
> are relevant to another (semantic match) and routes them across — every decision logged
> as its own memory. Demonstrated by a working multi-agent handoff pipeline
> (research-agent → Router → trading-bot) where the bot acts on routed knowledge with no
> re-prompting, every step auditable on Walrus.
> **Artifacts** — Upload datasets/logs/reports directly to Walrus via the public publisher.
>
> Built on the full stack: **MemWal** (memory), **Walrus** (direct read via aggregator +
> write via publisher), **Seal** (end-to-end encryption), **Sui** (the MemWalAccount Move
> object + on-chain routing anchors). MemSurf turns Walrus Memory from a write-only black
> box into something every agent developer can actually use — the adoption layer for the
> whole ecosystem.

**Why it matters (ecosystem impact)**
> Every developer building agents on Walrus hits the same wall — their memory is invisible
> and siloed. MemSurf is horizontal infrastructure that unblocks all of them, instead of
> one vertical agent. A judge can click "Explore the demo" and use real Walrus data with no
> account.

**Links**
- Live demo / Website: https://memsurf.vercel.app
- GitHub (public): https://github.com/VincenImanuell/MemSurf
- Walrus Sites page: _<run `site-builder publish` in `walrus-site/` and paste the `*.walrus.site` URL>_
- Demo video: _<YouTube link — add after recording>_

**Deployment**
- Network: **Testnet**
- MemWalAccount object: `0x361840ea5bd9b39b77e8240cdbd74a5e561c9a338c20bcc1e59488143fde45aa`
- Package ID: _<MemSurf routing Move package — add if/after the contract is published>_

**Track**
> Walrus — "Build AI agents and agentic workflows powered by Walrus as a verifiable data and memory layer."

**Built with**
> Next.js 16 · React 19 · Tailwind v4 · @mysten-incubation/memwal · Walrus testnet
> publisher/aggregator · Sui testnet RPC + Move · Vercel.
