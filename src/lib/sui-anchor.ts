import { createHash } from "crypto";

const PACKAGE = process.env.MEMSURF_PACKAGE_ID;
const REGISTRY = process.env.MEMSURF_REGISTRY_ID;
const SUI_KEY = process.env.MEMSURF_SUI_KEY; // bech32 suiprivkey… of the funded anchorer

export function anchoringEnabled() {
  return Boolean(PACKAGE && REGISTRY && SUI_KEY);
}

export function digestOf(texts: string[]): string {
  return createHash("sha256").update(texts.join(" ")).digest("hex");
}

/**
 * Record a routing decision on Sui by calling memsurf::routing::anchor_routing.
 * Best-effort, non-blocking: returns the tx digest, or null if anchoring isn't
 * configured (the Move contract + signer env aren't set) or the call fails.
 *
 * The @mysten/sui SDK is loaded dynamically so the build never depends on its
 * (fast-moving) client API surface; any mismatch degrades to a clean no-op.
 */
export async function anchorRouting(opts: {
  source: string;
  target: string;
  count: number;
  digestHex: string;
}): Promise<{ digest: string; suiscan: string } | null> {
  if (!anchoringEnabled()) return null;
  try {
    const { Ed25519Keypair } = await import("@mysten/sui/keypairs/ed25519");
    const { Transaction } = await import("@mysten/sui/transactions");

    // @mysten/sui ≥2.19 ships the concrete JSON-RPC client at /jsonRpc
    // (the old /client now only exposes the abstract CoreClient). We import it
    // dynamically and fall back across known names so a future rename degrades
    // to a clean no-op rather than breaking the build.
    type Client = new (cfg: { url: string }) => {
      signAndExecuteTransaction: (args: unknown) => Promise<{ digest: string }>;
    };
    let makeClient: Client | undefined;
    try {
      const rpc = (await import("@mysten/sui/jsonRpc")) as Record<string, unknown>;
      makeClient = (rpc.SuiJsonRpcClient ?? rpc.SuiClient) as Client | undefined;
    } catch {
      const legacy = (await import("@mysten/sui/client")) as Record<string, unknown>;
      makeClient = (legacy.SuiClient ?? legacy.CoreClient) as Client | undefined;
    }
    if (!makeClient) return null;

    const client = new makeClient({ url: "https://fullnode.testnet.sui.io:443" });
    // Accept either a bech32 `suiprivkey…` (from `sui keytool export`) or the
    // raw base64 keystore entry (flag byte + 32-byte secret) — whichever the
    // operator pastes into the env var.
    const keypair = SUI_KEY!.startsWith("suiprivkey")
      ? Ed25519Keypair.fromSecretKey(SUI_KEY!)
      : Ed25519Keypair.fromSecretKey(Buffer.from(SUI_KEY!, "base64").subarray(1));

    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE}::routing::anchor_routing`,
      arguments: [
        tx.object(REGISTRY!),
        tx.pure.vector("u8", Array.from(Buffer.from(opts.source))),
        tx.pure.vector("u8", Array.from(Buffer.from(opts.target))),
        tx.pure.u64(BigInt(opts.count)),
        tx.pure.vector("u8", Array.from(Buffer.from(opts.digestHex, "hex"))),
        tx.object("0x6"), // shared Clock
      ],
    });

    const res = await client.signAndExecuteTransaction({ signer: keypair, transaction: tx });
    return { digest: res.digest, suiscan: `https://suiscan.xyz/testnet/tx/${res.digest}` };
  } catch {
    return null;
  }
}
