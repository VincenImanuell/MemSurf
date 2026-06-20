# MemSurf — Demo Script (≤ 5 min)

**Goal:** show a developer with long-running agents on Walrus using MemSurf to *see, verify,
curate, and route* their agents' memory. Lead with the **problem + ecosystem value**, not tech.

**Before recording**
- Open two things: the **browser** on `memsurf.vercel.app` and a **terminal** in the repo.
- Pre-seed once (so data exists): `node scripts/seed.mjs` (only if namespaces are empty).
- ⚠️ **Rate limit: 30 requests/min per key.** Don't fire Curator + Router + Discover back-to-back
  in one breath. Pace ~5s between heavy actions, or record in 2 segments (see Backup plan).

---

### Scene 1 — The problem (0:00–0:25)
> "I build AI agents. They store memory on Walrus through MemWal — but that memory is a black box.
> I can't see what my agent remembers, whether it's even there, or move what one agent learned to
> another. **MemSurf** fixes that."

*(Show the landing page scrolling once — ocean theme, the three problems.)*

### Scene 2 — Connect (0:25–0:45)
- Click **Launch App** → **Explore the demo (no account needed)**.
> "No signup — judges can click straight in. Behind this is a real MemWal account on Sui testnet."
- Point at the **on-chain chip** (top right) → open it.
> "This is a real `MemWalAccount` Move object on Sui — here's the type, the package, the owner."

### Scene 3 — Discover (0:45–1:10)
- Land on **Discover** (coding-agent).
> "Everything my coding agent remembers, surfaced from Walrus — decisions, choices, context."
- Switch namespace to **research-agent**, then **trading-bot**.
> "Each agent is its own memory space."

### Scene 4 — Search + Verify (1:10–1:55)
- Back to coding-agent → **Search**: type `why did we choose JWT?`
> "Natural-language recall — it answers from the agent's own memory."
- On a result, click **Verify**.
> "And it's not just my word — MemSurf re-fetches this blob straight from the public Walrus
> aggregator: it exists, it's **Seal-encrypted**, and its id is **content-addressed** — the text
> can't change without changing the id. Verifiable memory."

### Scene 5 — Curator Agent (1:55–2:40)
- Open **Curator Agent** → **Run Curator**.
> "An autonomous agent audits memory quality." *(wait for result)*
> "It found a **duplicate** JWT decision, a **vague** one-word memory, and **gaps** — no deployment,
> testing, or observability memory. It flags and can fill gaps — and because Walrus is immutable, it
> never deletes, it **corrects forward**."

### Scene 6 — Router Agent (2:40–3:30)
- Open **Router Agent**. Source = **research-agent**, Target = **trading-bot**.
> "My research agent learned something useful for my trading bot. The Router agent finds *only the
> relevant* memories — by semantic match to the trading bot's interests — and routes them."
- **Run Router** → show the candidate with its relevance %.
> "This pairs-trading finding is 64% relevant. Route it." → **Route → trading-bot**.
- Switch namespace to **trading-bot** → Discover → show it landed.

### Scene 7 — Multi-agent handoff, live (3:30–4:15)
- Switch to **terminal**: `node scripts/agents-demo.mjs`
> "Here's the whole loop as a working pipeline: research-agent records a finding, the Router routes
> it, and the trading bot **reads it and acts** — opens a position based on it, no re-prompting.
> Every step persisted and auditable on Walrus."
- Back to browser → trading-bot Discover → Refresh → the new decision appears.

### Scene 8 — Artifacts + close (4:15–4:50)
- Open **Artifacts** → upload a small file.
> "Agents also produce files — datasets, logs, reports. MemSurf stores them **directly on Walrus**."
- Close:
> "MemWal gives agents memory on Walrus. **MemSurf makes that memory visible, verifiable, and
> shareable across agents** — the layer that makes Walrus Memory adoptable for every builder."

---

## Backup plan (rate limits / flaky relayer)

- **Segment the recording.** Record Scenes 1–5 in one take, wait ~60s (rate window resets), then
  Scenes 6–8. Cut together. Looks continuous, avoids the 30/min cap.
- **Pre-warm Curator/Router** right before recording so the data is fresh, then re-run on camera.
- If a call 429s on camera, MemSurf shows a clean "rate limit, wait ~60s" message — just pause and
  retry; don't panic-click (each retry costs quota).
- Keep a **backup recording** of a full clean run in case the final take hiccups.
- Have the terminal command typed and ready (don't fumble it live).
