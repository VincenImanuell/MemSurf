/**
 * Curated demo seed — populates each agent with memories designed so every
 * MemSurf feature has an obvious payoff on camera:
 *   - coding-agent : a clear duplicate pair + a vague entry + missing topics (gaps)
 *   - research-agent: a finding that is clearly relevant to the trading bot
 *   - trading-bot   : risk rules, but NOT the research finding (so Router routes it as novel)
 *
 * Run:  node scripts/seed-demo.mjs
 * Note: MemWal is append-only (no delete). For a pristine demo, seed a FRESH
 *       MemWal account. Otherwise this adds to whatever is already there.
 */
import { MemWal } from "@mysten-incubation/memwal";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(path.join(__dirname, "..", ".env.local"), "utf-8")
    .split("\n")
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const memwal = MemWal.create({
  key: env.MEMWAL_KEY,
  accountId: env.MEMWAL_ACCOUNT_ID,
  serverUrl: env.MEMWAL_SERVER_URL,
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SEED = {
  "coding-agent": [
    "Decided to use JWT over sessions — stateless auth required for mobile clients and horizontal scaling.",
    "Auth should use JWT tokens.", // intentional near-duplicate of the above
    "PostgreSQL chosen over MongoDB: ACID compliance required for financial transaction data.",
    "Redis (Upstash) for the caching layer, 15-minute TTL on session data.",
    "API rate limit set to 100 requests/min per user, with a 20-request burst allowance.",
    "Microservices rejected — team too small. Monolith with modular structure for v1.",
    "Session tokens stored in httpOnly cookies, not localStorage, to mitigate XSS.",
    "noted", // intentionally vague
  ],
  "research-agent": [
    "Transformer-based models outperform LSTMs on this sequence task by ~12% F1.",
    "Dataset has an 80/20 class imbalance — using a weighted loss instead of oversampling.",
    "Baseline reached 0.74 F1 with logistic regression over TF-IDF features.",
    "5-fold cross-validation gives more reliable metrics than a single train/test split.",
    // the cross-agent gem — relevant to the trading bot, which doesn't have it yet:
    "Pairs selected by high Pearson correlation outperformed cointegration-based selection on last month's returns (+3.8% vs +1.2%), with lower drawdown.",
  ],
  "trading-bot": [
    "Position sizing capped at 2% of portfolio per trade to limit drawdown.",
    "Stop-loss set at 5% below entry price for all long positions.",
    "Backtested the base strategy on 3 years of BTC/USD — Sharpe ratio 1.4.",
    // the reverse gem — a live result relevant to research-agent, which doesn't
    // have it yet (so the Two-way Router routes trading -> research as novel):
    "Live execution showed Pearson-correlation pairs decay fast — edge half-life ~9 days, correlation broke down after ~2 weeks; periodic re-selection needed.",
  ],
};

async function main() {
  for (const [namespace, items] of Object.entries(SEED)) {
    console.log(`Seeding ${items.length} → ${namespace} …`);
    const res = await memwal.rememberBulkAndWait(
      items.map((text) => ({ text, namespace })),
      { timeoutMs: 90000 }
    );
    const ok = res.results?.filter((r) => r.status === "done").length ?? items.length;
    console.log(`  ${ok}/${items.length} stored`);
    await sleep(8000); // pace under the 30 weighted-req/min rate limit
  }
  console.log("\nDone. coding-agent → Curator demo · research-agent → Router source · trading-bot → Router target.");
}

main().catch((e) => {
  console.error("seed-demo failed:", e?.message ?? e);
  process.exit(1);
});
