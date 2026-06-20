import { MemWal } from "@mysten-incubation/memwal";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");

const env = Object.fromEntries(
  readFileSync(envPath, "utf-8")
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf("=");
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    })
);

const memwal = MemWal.create({
  key: env.MEMWAL_KEY,
  accountId: env.MEMWAL_ACCOUNT_ID,
  serverUrl: env.MEMWAL_SERVER_URL,
});

const items = [
  // coding-agent — includes one intentional near-duplicate + one vague entry for Curator demo
  { namespace: "coding-agent", text: "Decided to use JWT over sessions — stateless auth required for mobile clients and horizontal scaling." },
  { namespace: "coding-agent", text: "Auth should use JWT tokens." },
  { namespace: "coding-agent", text: "PostgreSQL chosen over MongoDB: need ACID compliance for financial transaction data. Evaluated both for 2 weeks." },
  { namespace: "coding-agent", text: "Redis selected for caching layer. TTL set to 15 minutes for user session data. Using Upstash for serverless." },
  { namespace: "coding-agent", text: "API rate limit set to 100 requests per minute per user. Burst allowance of 20 extra requests." },
  { namespace: "coding-agent", text: "Microservices rejected — team size too small. Monolith with modular structure chosen for v1." },
  { namespace: "coding-agent", text: "noted" },
  { namespace: "coding-agent", text: "Frontend uses Next.js App Router with React 19 and Tailwind v4." },
  { namespace: "coding-agent", text: "Session tokens stored in httpOnly cookies, not localStorage, to mitigate XSS risk." },
  { namespace: "coding-agent", text: "Code review required for all pull requests touching the auth module." },

  // research-agent
  { namespace: "research-agent", text: "Literature review shows transformer-based models outperform LSTMs for this sequence task by roughly 12% F1." },
  { namespace: "research-agent", text: "Dataset has class imbalance — 80% negative, 20% positive. Plan to use weighted loss instead of oversampling." },
  { namespace: "research-agent", text: "Baseline model achieved 0.74 F1 on validation set using logistic regression with TF-IDF features." },
  { namespace: "research-agent", text: "Decided to use 5-fold cross-validation instead of a single train/test split for more reliable metrics." },
  { namespace: "research-agent", text: "Removing stopwords hurt performance slightly — domain-specific terms were being filtered out." },
  { namespace: "research-agent", text: "Next experiment: ensemble the transformer model with the baseline for a quick accuracy win." },

  // trading-bot — lighter set
  { namespace: "trading-bot", text: "Position sizing capped at 2% of portfolio per trade to limit drawdown risk." },
  { namespace: "trading-bot", text: "Backtested strategy on 3 years of BTC/USD data, Sharpe ratio of 1.4." },
  { namespace: "trading-bot", text: "Stop-loss set at 5% below entry price for all long positions." },
];

async function main() {
  console.log(`Seeding ${items.length} memories across ${new Set(items.map((i) => i.namespace)).size} namespaces...`);
  const result = await memwal.rememberBulkAndWait(items, { timeoutMs: 60000 });
  console.log("Done:", JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error("Seed failed:", err.message ?? err);
  process.exit(1);
});
