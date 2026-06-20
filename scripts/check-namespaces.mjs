import { MemWal } from "@mysten-incubation/memwal";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf-8").split("\n").filter(Boolean).map((line) => {
    const idx = line.indexOf("=");
    return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
  })
);
const memwal = MemWal.create({ key: env.MEMWAL_KEY, accountId: env.MEMWAL_ACCOUNT_ID, serverUrl: env.MEMWAL_SERVER_URL });

for (const ns of ["coding-agent", "research-agent", "trading-bot"]) {
  const r = await memwal.restore(ns, 20);
  console.log(ns, "->", r);
}
