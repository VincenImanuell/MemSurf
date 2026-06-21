# MemSurf — Submission (DeepSurge)

> **One line:** Hundreds of teams are building AI agents on Walrus — and every one of their
> agents' memory is a black box: invisible, unverifiable, and siloed per agent. **MemSurf is the
> horizontal layer that makes agent memory observable, verifiable, and movable across agents** —
> infrastructure for the whole agent ecosystem, not a single use-case.

Live demo: **[memsurf.vercel.app](https://memsurf.vercel.app)** · Repo: **[github.com/VincenImanuell/MemSurf](https://github.com/VincenImanuell/MemSurf)** · Network: **Sui + Walrus testnet**

This writeup is organized around the Sui Overflow 2026 judging rubric.

---

## 1. Real-World Application — the problem and why it matters *(50%)*

**The problem, in human terms.** Right now, almost everyone in this ecosystem is building an AI
agent. Almost no one is building the tooling *underneath* those agents. The moment a developer
gives an agent memory on Walrus, that memory becomes a black box: they can't see what the agent
remembers, can't prove it's actually stored, can't spot the duplicates and gaps piling up, and
can't move what one agent learned over to another. Memory ends up **siloed per agent and
invisible** — the exact "fragile, siloed memory setups" the Walrus track asks builders to move
beyond.

**Why now (market relevance & timing).** The agent build-out is exploding, and it's all happening
on the *application* layer — chatbots, trading bots, research agents, coding assistants. The layer
*beneath* them — how their memory is inspected, verified, cleaned, and shared — is almost empty.
MemSurf targets that layer. This is the difference between building one more agent and building the
**dev infrastructure every agent depends on**. As the number of agents grows, the need for a
memory-management layer doesn't stay flat — it compounds.

**Horizontal, not niche — the core differentiator.** Most memory projects pick a vertical: one
domain, one kind of agent, one verifiable-memory use-case. MemSurf deliberately does the opposite.
It is **horizontal**: point it at *any* agent's namespace on MemWal/Walrus and it works the same —
inspect, verify, curate, route. It is not tied to trading, or research, or any single domain. That
makes its reachable surface the *whole* set of teams building on Walrus Memory, not a slice of one
market.

**Who actually uses this.** Any developer building on MemWal / Walrus who needs to inspect,
verify, clean, or route agent memory. A trading-bot team debugging why their bot "forgot" a
signal. A research-agent team checking their agent isn't hoarding near-duplicate notes. A
coding-assistant team that wants knowledge learned in one agent to reach another. None of them
have to adopt a framework or a vertical — they bring a delegate key (or click the demo) and they're in.

**Long-term value — the missing dev layer.** Walrus Memory (MemWal) is powerful but write-only and
opaque to its own users; that opacity is an adoption barrier. MemSurf is the layer that makes
MemWal *adoptable* — which is the track's own stated goal. As agents proliferate and increasingly
need to **share and curate state across each other**, a memory-management layer stops being a
convenience and becomes foundational infrastructure: the place developers go to observe, trust, and
route what their agents know. That is a durable position, not a demo-day feature.

**Path to mainnet.** MemSurf is **testnet-deployed today** and the on-chain pieces already work:
the MemWal account model and MemSurf's own `memsurf::routing` Move package both run on Sui testnet,
anchoring real routing decisions. The path to mainnet is therefore not speculative — it's the same
package and account model pointed at mainnet relayer/RPC endpoints. We call this out deliberately:
50% of the prize is gated on mainnet deployment, and MemSurf's architecture is already shaped to
make that a configuration step, not a rewrite.

---

## 2. Product & UX *(20%)*

**Zero-friction evaluation — no account, no setup.** A judge can open the live app, click
**"Explore the demo,"** and immediately browse **real Walrus testnet data** — served from a MemWal
account prepared specifically for this demo. No wallet, no key, no signup. (To use *their own*
agents instead, they bring a delegate key — same flow.)

**The dashboard is the product, and it's polished.** A clean, single-surface dashboard:
namespace switching across agents in the top bar, one-click **Verify** on any memory, one-click
**Route** between agents, and an autonomous **Curator** run — each surfaced as a direct, legible
action rather than a config screen. Every memory links out to its Walrus blob and the account links
to the Sui explorer, so what the UI claims is independently checkable on-chain in one click.

**Evaluate in 2 minutes (judge path):**

1. Open **[memsurf.vercel.app](https://memsurf.vercel.app)** → **Launch App** → **"Explore the demo (no account needed)."**
2. **Discover** — real memories surfaced from Walrus. Switch namespace between `coding-agent`, `research-agent`, `trading-bot` — *example agents standing in for your own; MemSurf is the layer that manages them, not the agents.*
3. **Verify** (on any memory) — MemSurf re-fetches the blob from the public Walrus aggregator: it exists, is Seal-encrypted, content-addressed. *Independent proof it's on Walrus.*
4. **Curator Agent → Run** — autonomously flags a duplicate, a vague memory, and missing-topic gaps.
5. **Router Agent** — `research-agent` → `trading-bot` → **Run** → **Route** (or tick **Two-way + Go Live** to watch it route autonomously).
6. **On-chain chip** (top-right) — the account is a real `MemWalAccount` Move object on Sui testnet, and MemSurf's own `memsurf::routing` contract is published there too. When you Route, the decision is **anchored on Sui** — the success line links to the live transaction.

> Want the agents in motion? `node scripts/agents-demo.mjs` runs a live research → router → trading handoff, all persisted on Walrus.

---

## 3. Technical Implementation *(20%)*

Concise and factual:

- **MemWal SDK** handles every memory operation (`remember`, `recall`, `analyze`, `restore`, `rememberBulk`).
- **Walrus used directly**, not only through MemWal: *Verify* reads blobs from the public Walrus **aggregator**; *Artifacts* writes files via the public Walrus **publisher**.
- **Seal** — every memory is end-to-end Seal-encrypted before it reaches Walrus; *Verify* surfaces that the fetched bytes are ciphertext.
- **Sui — MemSurf's own Move package.** `memsurf::routing`
  ([`0xf13a3c58…`](https://suiscan.xyz/testnet/object/0xf13a3c58afab129da743cb1fb1f3804cf08f6b172ba699cee8aeeceb9e5c788a),
  shared `RoutingRegistry`) anchors every routing decision on-chain as a tamper-evident
  `RoutingAnchored` event — see [`move/DEPLOYMENT.md`](move/DEPLOYMENT.md) for package, registry,
  and live transactions. The `MemWalAccount` itself is a Move object read straight from a Sui full node.

**The Curator is honest about how it works.** It uses **heuristics, not deep LLM reasoning**:
near-duplicate detection via cosine distance between recalled embeddings, a vague-entry heuristic
(length / token count), and gap detection via a fixed category checklist. It flags and corrects
*forward* — Walrus memory is immutable, so it never deletes. We describe it this way on purpose:
the value is a working, deterministic hygiene pass over real memory, not a claim of semantic
reasoning it doesn't do.

Architecture: the browser talks to a small server route (`/api/memwal`) that wraps the MemWal SDK
and Walrus's public publisher/aggregator; the delegate key is used server-side and never shipped to
the browser. Built with Next.js 16 · React 19 · Tailwind v4 · Vercel.

---

## 4. Presentation & Vision *(10%)*

MemSurf is built as **the dev layer the agent wave is missing** — and the roadmap follows that
thesis. Next: **framework adapters** so agents built on existing frameworks use Walrus memory
without the MemSurf UI (a LangChain-style adapter is already shipped as a first step);
**cross-user memory sharing** via scoped delegate keys; **cryptographic provenance** (per-memory
signing + browser re-verification); and **multi-round negotiation** between agents over routed
memory. Each is labeled honestly as future work below — the vision is to become the standard place
developers observe, trust, and route what their agents know on Walrus.

---

## 5. Differentiation *(brief, honest)*

MemSurf is **horizontal memory infrastructure** — curate and route across *any* agents — which is a
different lane from single-purpose verifiable-memory projects that go deep on one vertical. We don't
position this as a knock on those projects; it's a positioning fact. They make one kind of memory
more trustworthy; MemSurf makes *all* of a team's agent memory observable and movable. The bet is
that as agents multiply, the horizontal layer is the one that unblocks the most builders.

---

## Roadmap (honest — not yet built)

- **Cryptographic provenance** — per-memory signing + browser re-verification.
- **Direct Seal access policies** — own Move policy for shared, permissioned memory.
- **Cross-user memory sharing** — scoped delegate keys.
- **More framework adapters** — Mastra / agent-framework hooks (LangChain-style adapter already shipped).
- **Multi-round negotiation** — back-and-forth between agents over routed memory.

---

## Submission form fields (copy-paste)

**Project name**
> MemSurf

**Tagline (one line)**
> The horizontal layer that makes AI-agent memory on Walrus observable, verifiable, and movable across agents.

**Positioning (read first)**
> MemSurf is the **memory-management layer**, not an agent. The autonomous agents here are
> MemSurf's own **Curator** and **Router**. `coding-agent` / `research-agent` / `trading-bot` are
> **example client namespaces** standing in for your own agents — they show what MemSurf manages,
> they are not the deliverable.

**Short description**
> MemSurf makes Walrus agent-memory observable, verifiable, and shareable. Inspect what your agents
> remember, verify each memory independently on Walrus, run an autonomous Curator to keep memory
> clean, and a Router that shares the right knowledge between agents — every routing decision
> anchored on Sui.

**Links**
- Live demo / Website: https://memsurf.vercel.app
- GitHub (public): https://github.com/VincenImanuell/MemSurf
- Walrus Sites page: **live on Walrus testnet** — Site object
  [`0x1445d8ca…`](https://suiscan.xyz/testnet/object/0x1445d8ca1aa7feef197afab8270ccd6811cb571994c37706a584509371200e78)
  (type `::site::Site`). Browse via a testnet portal: `http://i6ua4t4now571z0d3q1sloifnv77odb9pjnepo031ruh3hrw8.localhost:3000`
  (self-hosted portal). _wal.app portal only serves mainnet sites._
- Demo video: _<YouTube link — add after recording>_

**Deployment**
- Network: **Testnet**
- MemWalAccount object: `0x361840ea5bd9b39b77e8240cdbd74a5e561c9a338c20bcc1e59488143fde45aa`
- Package ID (MemSurf `memsurf::routing`): `0xf13a3c58afab129da743cb1fb1f3804cf08f6b172ba699cee8aeeceb9e5c788a`
- RoutingRegistry (shared object): `0x3e816f9502040fff7ca017d47175182a0abed0ba5ba3c5bb3a401e08d7a8a6ae`

**Track**
> Walrus — "Build AI agents and agentic workflows powered by Walrus as a verifiable data and memory layer."

**Built with**
> Next.js 16 · React 19 · Tailwind v4 · @mysten-incubation/memwal · Walrus testnet
> publisher/aggregator · Sui testnet RPC + Move · Vercel.
</content>
</invoke>
