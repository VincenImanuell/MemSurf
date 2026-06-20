import { NextResponse } from "next/server";
import { createMemWalClient } from "@/lib/memwal";
import { anchorRouting, digestOf } from "@/lib/sui-anchor";
import { routeMessageBody, sendRouteMessageOnChain, type MessagingResult } from "@/lib/sui-messaging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// curate/discover fan out many recalls; give the function room beyond the 10s default.
export const maxDuration = 60;

// Diagnostic: confirms whether the demo env vars are visible to this deployment,
// without ever exposing their values.
export async function GET() {
  return NextResponse.json({
    hasKey: Boolean(process.env.MEMWAL_KEY),
    hasAccountId: Boolean(process.env.MEMWAL_ACCOUNT_ID || process.env.MEMWAL_ACCOUNT),
    hasServerUrl: Boolean(process.env.MEMWAL_SERVER_URL),
  });
}

interface Body {
  action: string;
  demo?: boolean;
  key?: string;
  accountId?: string;
  serverUrl?: string;
  // action params
  query?: string;
  namespace?: string;
  sourceNamespace?: string;
  targetNamespace?: string;
  text?: string;
  limit?: number;
  interests?: string[];
  threshold?: number;
  novelOnly?: boolean;
  items?: { text: string; matchedInterest?: string; distance?: number }[];
  rejections?: { text: string; reason: string }[];
  filename?: string;
  contentType?: string;
  dataBase64?: string;
}

// Default "interest profiles" the Router Agent uses to decide which memories
// from a source agent are relevant to a target agent. Editable from the UI.
const INTEREST_PROFILES: Record<string, string[]> = {
  "trading-bot": [
    "pair trading correlation strategy",
    "risk management position sizing",
    "backtest returns performance",
    "market signal indicator",
  ],
  "coding-agent": [
    "architecture decision",
    "database choice",
    "authentication security",
    "deployment infrastructure",
  ],
  "research-agent": [
    "experiment finding result",
    "literature review method",
    "dataset analysis statistics",
  ],
  default: ["important decision", "key finding", "strategy", "lesson learned"],
};

// Broad queries used to surface a representative slice of a namespace, since
// MemWal has no "list all" — we issue several wide recalls and dedupe by blob_id.
// Kept small (6) on purpose: the relayer caps a delegate key at 30 weighted
// requests/min, and Discover + Curator both fan out recalls.
const DISCOVER_QUERIES = [
  "decision",
  "architecture",
  "database",
  "authentication",
  "strategy",
  "configuration",
];

function friendlyError(message: string): string {
  if (message.includes("429") || /rate limit/i.test(message)) {
    return "Walrus rate limit reached (testnet caps 30 requests/min). Wait ~60s and try again.";
  }
  if (/hex|odd-length|non-hex/i.test(message)) {
    return "Invalid delegate key — it should be a 64-character hex string from the MemWal Playground.";
  }
  if (/401|wrong private key|not registered|mismatch/i.test(message)) {
    return "Couldn't authenticate. Check your delegate key and account ID are correct and for testnet.";
  }
  if (/timed out|timeout|aborted/i.test(message)) {
    return "Walrus took too long to respond. Give it a moment and try again.";
  }
  return message;
}

function resolveCreds(body: Body) {
  if (body.demo) {
    return {
      key: process.env.MEMWAL_KEY,
      accountId: process.env.MEMWAL_ACCOUNT_ID || process.env.MEMWAL_ACCOUNT,
      serverUrl: process.env.MEMWAL_SERVER_URL,
    };
  }
  return {
    key: body.key?.trim(),
    accountId: body.accountId?.trim(),
    serverUrl: body.serverUrl?.trim() || undefined,
  };
}

const WALRUS_AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space/v1/blobs";
const WALRUS_PUBLISHER = "https://publisher.walrus-testnet.walrus.space/v1/blobs";
const SUI_TESTNET_RPC = "https://fullnode.testnet.sui.io:443";
const ARTIFACTS_NAMESPACE = "artifacts";

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // ── Public actions (no MemWal credentials needed) ──────────────────

  // Verify a memory's blob really exists on Walrus, independently of MemSurf,
  // by fetching it from the public Walrus testnet aggregator. The bytes are
  // Seal-encrypted ciphertext; the blob_id is content-addressed (tamper-evident).
  if (body.action === "verify") {
    const blobId = body.text; // reuse the text field as blobId
    if (!blobId) return NextResponse.json({ error: "Missing blobId" }, { status: 400 });
    try {
      const res = await fetch(`${WALRUS_AGGREGATOR}/${blobId}`, { cache: "no-store" });
      if (!res.ok) {
        return NextResponse.json({ exists: false, blobId, status: res.status });
      }
      const buf = await res.arrayBuffer();
      return NextResponse.json({
        exists: true,
        blobId,
        bytes: buf.byteLength,
        encrypted: true, // Seal ciphertext
        aggregatorUrl: `${WALRUS_AGGREGATOR}/${blobId}`,
        walruscanUrl: `https://walruscan.com/testnet/blob/${blobId}`,
      });
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : "Verify failed" }, { status: 502 });
    }
  }

  // Read the MemWalAccount object straight from a Sui testnet full node, so the
  // UI can show that the account is a real on-chain Move object.
  if (body.action === "onchain") {
    const accountId = body.demo
      ? process.env.MEMWAL_ACCOUNT_ID || process.env.MEMWAL_ACCOUNT
      : body.accountId?.trim();
    if (!accountId) return NextResponse.json({ error: "Missing accountId" }, { status: 400 });
    try {
      const rpc = await fetch(SUI_TESTNET_RPC, {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "sui_getObject",
          params: [accountId, { showType: true, showOwner: true }],
        }),
      });
      const data = await rpc.json();
      const obj = data?.result?.data;
      const type: string | undefined = obj?.type;
      const pkg = type?.split("::")?.[0];
      return NextResponse.json({
        objectId: accountId,
        exists: Boolean(obj),
        type,
        package: pkg,
        owner: obj?.owner,
        version: obj?.version,
        network: "testnet",
        suiExplorer: `https://testnet.suivision.xyz/object/${accountId}`,
        suiscan: `https://suiscan.xyz/testnet/object/${accountId}`,
      });
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : "On-chain lookup failed" }, { status: 502 });
    }
  }

  const creds = resolveCreds(body);
  if (!creds.key || !creds.accountId) {
    return NextResponse.json(
      { error: body.demo ? "Demo credentials are not configured on the server." : "Missing delegate key or account ID." },
      { status: 400 }
    );
  }

  try {
    const memwal = createMemWalClient({
      key: creds.key,
      accountId: creds.accountId,
      serverUrl: creds.serverUrl,
    });

    switch (body.action) {
      case "validate": {
        // recall requires a signed request, so a successful (even empty) call
        // confirms the delegate key is registered on-chain for this account.
        await memwal.recall({ query: "connection check", limit: 1, namespace: body.namespace ?? "default" });
        // accountId (the MemWalAccount object id) is public on-chain — safe to echo
        // so the UI can link to the Sui explorer. The delegate key never leaves here.
        return NextResponse.json({ ok: true, accountId: creds.accountId });
      }

      case "recall": {
        const result = await memwal.recall({
          query: body.query ?? "",
          limit: body.limit ?? 10,
          namespace: body.namespace,
        });
        return NextResponse.json(result);
      }

      case "discover": {
        const namespace = body.namespace;
        const seen = new Map<string, { blob_id: string; text: string; distance: number }>();
        const settled = await Promise.allSettled(
          DISCOVER_QUERIES.map((q) => memwal.recall({ query: q, limit: 10, namespace }))
        );
        for (const s of settled) {
          if (s.status !== "fulfilled") continue;
          for (const m of s.value.results) {
            const existing = seen.get(m.blob_id);
            if (!existing || m.distance < existing.distance) seen.set(m.blob_id, m);
          }
        }
        let total = seen.size;
        try {
          const restored = await memwal.restore(namespace ?? "default", 50);
          total = Math.max(total, restored.total);
        } catch {
          // restore is best-effort for the count; ignore failures
        }
        const memories = [...seen.values()].sort((a, b) => a.distance - b.distance);
        return NextResponse.json({ memories, found: memories.length, total });
      }

      case "remember": {
        if (!body.text) return NextResponse.json({ error: "Missing text" }, { status: 400 });
        const result = await memwal.rememberAndWait(body.text, body.namespace, { timeoutMs: 30000 });
        return NextResponse.json(result);
      }

      case "analyze": {
        if (!body.text) return NextResponse.json({ error: "Missing text" }, { status: 400 });
        // analyze() extracts facts synchronously (and queues each for background
        // storage), so we can return the fact texts immediately.
        const result = await memwal.analyze(body.text, body.namespace);
        const facts = (result.facts ?? []).map((f) => f.text);
        return NextResponse.json({ facts, fact_count: facts.length });
      }

      case "restore": {
        const result = await memwal.restore(body.namespace ?? "default", body.limit ?? 20);
        return NextResponse.json(result);
      }

      case "transfer": {
        if (!body.text || !body.targetNamespace) {
          return NextResponse.json({ error: "Missing text or targetNamespace" }, { status: 400 });
        }
        const result = await memwal.rememberAndWait(body.text, body.targetNamespace, { timeoutMs: 30000 });
        return NextResponse.json(result);
      }

      case "curate": {
        const namespace = body.namespace;

        // 1. Gather a representative slice of the namespace.
        const seen = new Map<string, { blob_id: string; text: string; distance: number }>();
        const gathered = await Promise.allSettled(
          DISCOVER_QUERIES.map((q) => memwal.recall({ query: q, limit: 10, namespace }))
        );
        for (const s of gathered) {
          if (s.status !== "fulfilled") continue;
          for (const m of s.value.results) {
            const e = seen.get(m.blob_id);
            if (!e || m.distance < e.distance) seen.set(m.blob_id, m);
          }
        }
        const mems = [...seen.values()];

        const issues: Array<Record<string, unknown>> = [];

        // 2. Vague — short / low-information entries (length + word-count heuristic).
        for (const m of mems) {
          const t = m.text.trim();
          const words = t.split(/\s+/).filter(Boolean).length;
          if (t.length < 15 || words <= 2) {
            issues.push({ type: "vague", memory: m.text, reason: `Only ${words} word${words === 1 ? "" : "s"} — too short to be useful in future recall` });
          }
        }

        // 3. Duplicates — recall each memory by its own text; another entry under
        // ~0.45 cosine distance is a near-duplicate. (Tuned against real data.)
        const DUP_THRESHOLD = 0.45;
        const dupPairs = new Set<string>();
        const dupChecks = await Promise.allSettled(
          mems.slice(0, 10).map((m) =>
            memwal.recall({ query: m.text, limit: 3, namespace }).then((r) => ({ m, r }))
          )
        );
        for (const s of dupChecks) {
          if (s.status !== "fulfilled") continue;
          const { m, r } = s.value;
          for (const hit of r.results) {
            if (hit.blob_id !== m.blob_id && hit.distance < DUP_THRESHOLD) {
              const key = [m.blob_id, hit.blob_id].sort().join("|");
              if (!dupPairs.has(key)) {
                dupPairs.add(key);
                issues.push({ type: "duplicate", memory: m.text, related: hit.text, distance: hit.distance });
              }
            }
          }
        }

        // 4. Gaps — checklist of categories; no nearby memory (distance > ~0.65) = gap.
        const GAP_THRESHOLD = 0.65;
        const GAP_CATS = [
          { category: "Deployment strategy", query: "deployment CI/CD pipeline target environment" },
          { category: "Error handling", query: "error handling API failure retry policy" },
          { category: "Observability", query: "logging monitoring observability metrics" },
          { category: "Security practices", query: "security encryption secrets vulnerability" },
          { category: "Testing strategy", query: "testing unit integration test coverage" },
        ];
        const gaps: Array<Record<string, unknown>> = [];
        const gapChecks = await Promise.allSettled(
          GAP_CATS.map((g) => memwal.recall({ query: g.query, limit: 1, namespace }).then((r) => ({ g, r })))
        );
        for (const s of gapChecks) {
          if (s.status !== "fulfilled") continue;
          const { g, r } = s.value;
          const top = r.results[0];
          if (!top || top.distance > GAP_THRESHOLD) {
            gaps.push({ category: g.category, suggestion: `No memory found about ${g.category.toLowerCase()}.` });
          }
        }

        return NextResponse.json({ issues, gaps, scanned: mems.length });
      }

      case "route": {
        // Router Agent: find which memories in the source namespace are relevant
        // to the target agent, using semantic recall against the target's
        // interest profile. No LLM — relevance = cosine similarity.
        const source = body.sourceNamespace;
        const target = body.targetNamespace ?? "default";
        const interests =
          body.interests && body.interests.length > 0
            ? body.interests.slice(0, 5)
            : INTEREST_PROFILES[target] ?? INTEREST_PROFILES.default;
        const threshold = body.threshold ?? 0.6;

        const best = new Map<
          string,
          { blob_id: string; text: string; distance: number; matchedInterest: string }
        >();
        const settled = await Promise.allSettled(
          interests.map((q) =>
            memwal.recall({ query: q, limit: 8, namespace: source }).then((r) => ({ q, r }))
          )
        );
        for (const s of settled) {
          if (s.status !== "fulfilled") continue;
          const { q, r } = s.value;
          for (const m of r.results) {
            if (m.distance >= threshold) continue; // not relevant enough
            const existing = best.get(m.blob_id);
            if (!existing || m.distance < existing.distance) {
              best.set(m.blob_id, { ...m, matchedInterest: q });
            }
          }
        }
        let candidates = [...best.values()].sort((a, b) => a.distance - b.distance);

        // Gap-aware: drop memories the target already has. A candidate is "novel"
        // if the target's closest existing memory is far enough away.
        const NOVELTY_THRESHOLD = 0.3;
        const novelOnly = body.novelOnly !== false; // default on
        if (novelOnly && candidates.length > 0) {
          const checks = await Promise.allSettled(
            candidates.map((c) =>
              memwal.recall({ query: c.text, limit: 1, namespace: target }).then((r) => ({
                blob_id: c.blob_id,
                already: r.results.length > 0 && r.results[0].distance < NOVELTY_THRESHOLD,
              }))
            )
          );
          const known = new Set(
            checks.filter((s) => s.status === "fulfilled" && s.value.already).map((s) => (s as PromiseFulfilledResult<{ blob_id: string }>).value.blob_id)
          );
          candidates = candidates.filter((c) => !known.has(c.blob_id));
        }

        return NextResponse.json({ candidates, interests, threshold, source, target });
      }

      case "upload-artifact": {
        // Store an arbitrary file DIRECTLY on Walrus via the public testnet
        // publisher (no MemWal involved for the bytes), then record a reference
        // memory so the artifact is discoverable + manageable in MemSurf.
        if (!body.dataBase64 || !body.filename) {
          return NextResponse.json({ error: "Missing file" }, { status: 400 });
        }
        const bytes = Buffer.from(body.dataBase64, "base64");
        const put = await fetch(`${WALRUS_PUBLISHER}?epochs=5`, {
          method: "PUT",
          body: bytes,
        });
        if (!put.ok) {
          return NextResponse.json({ error: `Walrus publisher error ${put.status}` }, { status: 502 });
        }
        const out = await put.json();
        const info = out?.newlyCreated?.blobObject ?? out?.alreadyCertified;
        const blobId: string | undefined = info?.blobId ?? out?.alreadyCertified?.blobId;
        const suiObjectId: string | undefined = out?.newlyCreated?.blobObject?.id;
        if (!blobId) {
          return NextResponse.json({ error: "Publisher returned no blob id" }, { status: 502 });
        }
        const reference =
          `Artifact "${body.filename}" (${bytes.byteLength} bytes${body.contentType ? `, ${body.contentType}` : ""}) ` +
          `stored on Walrus. blob:${blobId}`;
        await memwal.rememberAndWait(reference, ARTIFACTS_NAMESPACE, { timeoutMs: 30000 });
        return NextResponse.json({
          blobId,
          suiObjectId,
          filename: body.filename,
          size: bytes.byteLength,
          aggregatorUrl: `${WALRUS_AGGREGATOR}/${blobId}`,
          walruscanUrl: `https://walruscan.com/testnet/blob/${blobId}`,
        });
      }

      case "route-apply": {
        // Copy approved memories into the target namespace, and log the routing
        // decisions as the Router Agent's own meta-memory on Walrus.
        const target = body.targetNamespace ?? "default";
        const source = body.sourceNamespace ?? "unknown";
        const items = (body.items ?? []).slice(0, 6);
        const rejections = (body.rejections ?? []).slice(0, 6);
        if (items.length === 0 && rejections.length === 0) {
          return NextResponse.json({ error: "No memories accepted or rejected" }, { status: 400 });
        }

        let messaging: MessagingResult | null = null;
        let anchor: { digest: string; suiscan: string } | null = null;

        if (items.length > 0) {
          // Submit the copies without blocking on the (sometimes slow) relayer
          // indexing — the jobs finish in the background, well within a refresh.
          await memwal.rememberBulk(items.map((i) => ({ text: i.text, namespace: target })));

          // One audit entry summarising what the Router did (meta-memory).
          const summary =
            `Router Agent routed ${items.length} memor${items.length === 1 ? "y" : "ies"} ` +
            `from "${source}" → "${target}". ` +
            items.map((i) => `· "${i.text.slice(0, 50)}${i.text.length > 50 ? "…" : ""}" (relevance to "${i.matchedInterest ?? "n/a"}")`).join(" ");
          await memwal.remember(summary, "memory-router");

          // Messaging leg: notify the target agent that new knowledge arrived.
          // The notification is recorded as a verifiable memory on Walrus in the
          // target's `inbox:<target>` namespace (always, demoable), and — if a Sui
          // Stack Messaging signer is configured — also sent on-chain (best-effort,
          // no-op otherwise). This makes the handoff a real message, not a silent copy.
          const channel = `inbox:${target}`;
          const messageBody = routeMessageBody({ source, target, count: items.length, summary });
          await memwal.remember(messageBody, channel);
          const onChain = await sendRouteMessageOnChain({ source, target, count: items.length, summary });
          messaging = { channel, delivered: true, onChain };

          // Best-effort: anchor this routing decision on Sui (no-op until the
          // MemSurf Move contract + signer env are configured).
          anchor = await anchorRouting({
            source,
            target,
            count: items.length,
            digestHex: digestOf(items.map((i) => i.text)),
          });
        }

        // Negotiation leg: the target agent can REJECT a proposed memory with a
        // reason. Rejected memories are NOT copied — instead each rejection is
        // logged as the target's own counter-memory on Walrus (so the agent
        // "remembers" why it declined), plus one audit line in memory-router.
        if (rejections.length > 0) {
          await memwal.rememberBulk(
            rejections.map((r) => ({
              text: `Declined a memory proposed from "${source}": "${r.text.slice(0, 80)}${r.text.length > 80 ? "…" : ""}". Reason: ${r.reason}`,
              namespace: target,
            }))
          );
          const rejectSummary =
            `"${target}" rejected ${rejections.length} memor${rejections.length === 1 ? "y" : "ies"} ` +
            `proposed from "${source}". ` +
            rejections.map((r) => `· "${r.text.slice(0, 40)}${r.text.length > 40 ? "…" : ""}" (reason: ${r.reason})`).join(" ");
          await memwal.remember(rejectSummary, "memory-router");
        }

        return NextResponse.json({
          routed: items.length,
          rejected: rejections.length,
          target,
          source,
          anchor,
          messaging,
        });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${body.action}` }, { status: 400 });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Request failed";
    return NextResponse.json({ error: friendlyError(message) }, { status: 500 });
  }
}
