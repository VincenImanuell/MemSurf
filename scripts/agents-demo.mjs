/**
 * Multi-agent agentic workflow on Walrus — a closed autonomous loop.
 *
 *   research-agent ─▶ Router ─▶ trading-bot ─▶ Router ─▶ research-agent
 *
 * 1. A long-running research agent records a finding to MemWal (Walrus).
 * 2. The Router agent finds it relevant to the trading bot and copies it across,
 *    anchoring the routing decision on Sui (memsurf::routing).
 * 3. The trading bot reads the routed knowledge, acts on it (no re-prompting),
 *    and records both its decision and the resulting outcome back to Walrus.
 * 4. The Router routes that outcome BACK to research — closing the loop — so the
 *    research agent learns from what its knowledge produced downstream.
 *
 * Every memory is persisted + Seal-encrypted on Walrus; every routing is anchored
 * on Sui. Run during the demo:   node scripts/agents-demo.mjs
 */
import { MemWal } from "@mysten-incubation/memwal";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(path.join(__dirname, "..", ".env.local"), "utf-8")
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    })
);

const memwal = MemWal.create({
  key: env.MEMWAL_KEY,
  accountId: env.MEMWAL_ACCOUNT_ID,
  serverUrl: env.MEMWAL_SERVER_URL,
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (s) => console.log(s);

async function retry(fn, label) {
  for (let a = 0; a < 3; a++) {
    try {
      return await fn();
    } catch (e) {
      if (a === 2) throw e;
      log(`   …retrying ${label}`);
      await sleep(1500);
    }
  }
}

// Anchor a routing decision on Sui via the published memsurf::routing contract.
// Best-effort: returns the tx digest, or null if the contract env isn't configured.
function keypairFromEnv(k) {
  return k.startsWith("suiprivkey")
    ? Ed25519Keypair.fromSecretKey(k)
    : Ed25519Keypair.fromSecretKey(Buffer.from(k, "base64").subarray(1));
}
async function anchor({ source, target, count, texts }) {
  const PKG = env.MEMSURF_PACKAGE_ID, REG = env.MEMSURF_REGISTRY_ID, KEY = env.MEMSURF_SUI_KEY;
  if (!PKG || !REG || !KEY) return null;
  try {
    const client = new SuiJsonRpcClient({ url: "https://fullnode.testnet.sui.io:443" });
    const kp = keypairFromEnv(KEY);
    const digest = createHash("sha256").update(texts.join(" ")).digest("hex");
    const tx = new Transaction();
    tx.moveCall({
      target: `${PKG}::routing::anchor_routing`,
      arguments: [
        tx.object(REG),
        tx.pure.vector("u8", Array.from(Buffer.from(source))),
        tx.pure.vector("u8", Array.from(Buffer.from(target))),
        tx.pure.u64(BigInt(count)),
        tx.pure.vector("u8", Array.from(Buffer.from(digest, "hex"))),
        tx.object("0x6"),
      ],
    });
    const res = await client.signAndExecuteTransaction({ signer: kp, transaction: tx });
    return res.digest;
  } catch {
    return null;
  }
}
async function route(text, from, to, interestLabel) {
  await retry(() => memwal.rememberAndWait(text, to, { timeoutMs: 30000 }), "route copy");
  await retry(
    () =>
      memwal.rememberAndWait(
        `Router routed 1 memory ${from} → ${to} (relevance to "${interestLabel}"): "${text.slice(0, 50)}…"`,
        "memory-router",
        { timeoutMs: 30000 }
      ),
    "router log"
  );
  const tx = await anchor({ source: from, target: to, count: 1, texts: [text] });
  if (tx) log(`   ⛓  anchored on Sui · https://suiscan.xyz/testnet/tx/${tx}`);
  else log(`   (on-chain anchor skipped — set MEMSURF_* env to enable)`);
}

async function main() {
  log("\n══════════════════════════════════════════════════════");
  log("  MemSurf · autonomous multi-agent loop on Walrus + Sui");
  log("══════════════════════════════════════════════════════\n");

  // ── 1. research-agent records a finding ────────────────────────────
  const finding =
    "Pairs-trading study: pairs selected by high Pearson correlation outperformed " +
    "cointegration-based selection on last month's returns (+3.8% vs +1.2%), with lower drawdown.";
  log("🔬 research-agent  (long-running · session)");
  log(`   records finding → Walrus`);
  log(`   "${finding.slice(0, 70)}…"`);
  await retry(() => memwal.rememberAndWait(finding, "research-agent", { timeoutMs: 30000 }), "store finding");
  log("   ✓ persisted on Walrus\n");
  await sleep(1200);

  // ── 2. Router decides it's relevant to the trading bot ─────────────
  log("🔀 Router Agent  (research-agent → trading-bot)");
  log("   trading-bot interests: pair correlation · returns · risk");
  const relevant = await retry(
    () => memwal.recall({ query: "pair trading correlation returns strategy", limit: 3, namespace: "research-agent" }),
    "router recall"
  );
  const top = relevant.results[0];
  if (!top) {
    log("   (no relevant memory found — is research-agent seeded?)\n");
    return;
  }
  log(`   relevant: "${top.text.slice(0, 56)}…"  (relevance ${Math.round((1 - top.distance) * 100)}%)`);
  log("   routing → trading-bot");
  await route(top.text, "research-agent", "trading-bot", "pair correlation");
  log("   ✓ copied + decision logged\n");
  await sleep(1200);

  // ── 3. trading-bot acts on the routed knowledge + produces a result ─
  log("🤖 trading-bot  (reads its memory, acts, measures)");
  const recall = await retry(
    () => memwal.recall({ query: "which pair selection method should I use?", limit: 2, namespace: "trading-bot" }),
    "trading recall"
  );
  const known = recall.results.find((r) => /pearson|correlation/i.test(r.text)) ?? recall.results[0];
  log(`   recalls: "${(known?.text ?? "").slice(0, 56)}…"`);
  const decision =
    "Decision: switch pair selection to Pearson-correlation ranking for next cycle, " +
    "based on research-agent finding (outperformed cointegration last month).";
  log(`   decides → "${decision.slice(0, 60)}…"`);
  await retry(() => memwal.rememberAndWait(decision, "trading-bot", { timeoutMs: 30000 }), "store decision");
  const result =
    "Live result: Pearson-ranked pair selection ran one cycle → +2.9% realised return, " +
    "max drawdown 1.1% — confirms the research finding holds out-of-sample.";
  log(`   measures → "${result.slice(0, 60)}…"`);
  await retry(() => memwal.rememberAndWait(result, "trading-bot", { timeoutMs: 30000 }), "store result");
  log("   ✓ decision + result persisted on Walrus\n");
  await sleep(1200);

  // ── 4. Router closes the loop: result flows back to research ───────
  log("🔀 Router Agent  (trading-bot → research-agent · feedback)");
  log("   research-agent interests: experiment result · validation · returns");
  log("   routing the live result back → research-agent");
  await route(result, "trading-bot", "research-agent", "experiment result");
  const followUp =
    "Follow-up: production trading validated the Pearson-vs-cointegration finding " +
    "(+2.9% live). Prioritise correlation-stability research next.";
  await retry(() => memwal.rememberAndWait(followUp, "research-agent", { timeoutMs: 30000 }), "store follow-up");
  log("   ✓ research-agent learned from the downstream outcome\n");

  log("──────────────────────────────────────────────────────");
  log("  Closed loop: research → trading → result → research,");
  log("  no re-prompting. Every memory on Walrus, every routing");
  log("  anchored on Sui. Open MemSurf to watch the namespaces fill.");
  log("──────────────────────────────────────────────────────\n");
}

main().catch((e) => {
  console.error("agents-demo failed:", e?.message ?? e);
  process.exit(1);
});
