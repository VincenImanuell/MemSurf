/**
 * Cross-agent routing notification — the "messaging" leg of the
 * memory + messaging + execution workflow.
 *
 * Sui Stack Messaging stores message bodies on Walrus and uses Seal for privacy
 * — the same stack MemSurf already builds on. When the Router moves memory from
 * one agent to another, we also notify the target agent that new knowledge
 * arrived, so the handoff is a real message, not just a silent copy.
 *
 * Two layers, both safe and consistent with src/lib/sui-anchor.ts:
 *
 *  1. ALWAYS: the notification is recorded as a verifiable memory on Walrus, in
 *     the target agent's `inbox:<target>` namespace. This is the part that runs
 *     in the live demo — the message is auditable and re-fetchable from the
 *     public aggregator, exactly like every other memory. (Done by the caller,
 *     which holds the MemWal client.)
 *
 *  2. OPTIONAL: if a Sui Stack Messaging signer is configured
 *     (SUI_MESSAGING_KEY env), attempt a real on-chain message send via the SDK,
 *     loaded dynamically so a missing/version-mismatched SDK degrades to a clean
 *     no-op rather than breaking the build or the request.
 */

const MESSAGING_KEY = process.env.SUI_MESSAGING_KEY; // bech32 suiprivkey… of the sender
const MESSAGING_PACKAGE = process.env.SUI_MESSAGING_PACKAGE_ID;

export function messagingEnabled(): boolean {
  return Boolean(MESSAGING_KEY && MESSAGING_PACKAGE);
}

export interface RouteMessage {
  source: string;
  target: string;
  count: number;
  summary: string;
}

/** Human-readable notification body, used for both the Walrus inbox record and any on-chain send. */
export function routeMessageBody(msg: RouteMessage): string {
  return (
    `📨 ${msg.source} → ${msg.target}: routed ${msg.count} memor${msg.count === 1 ? "y" : "ies"}. ${msg.summary}`
  );
}

export interface MessagingResult {
  /** The Walrus namespace the notification was filed under (inbox:<target>). */
  channel: string;
  /** True once the notification memory is written to Walrus (always, in demo). */
  delivered: boolean;
  /** Tx digest + explorer link if a real on-chain Sui Stack Messaging send fired; null otherwise. */
  onChain: { digest: string; suiscan: string } | null;
}

/**
 * Best-effort real on-chain send. Returns the tx digest, or null if messaging
 * isn't configured or the SDK call fails — never throws. Gated off by default
 * (like on-chain anchoring), so the live demo uses the Walrus inbox record only.
 */
export async function sendRouteMessageOnChain(
  msg: RouteMessage
): Promise<{ digest: string; suiscan: string } | null> {
  if (!messagingEnabled()) return null;
  try {
    const { Ed25519Keypair } = await import("@mysten/sui/keypairs/ed25519");
    const { Transaction } = await import("@mysten/sui/transactions");

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
    const keypair = MESSAGING_KEY!.startsWith("suiprivkey")
      ? Ed25519Keypair.fromSecretKey(MESSAGING_KEY!)
      : Ed25519Keypair.fromSecretKey(Buffer.from(MESSAGING_KEY!, "base64").subarray(1));

    const body = routeMessageBody(msg);
    const tx = new Transaction();
    tx.moveCall({
      target: `${MESSAGING_PACKAGE}::messaging::send`,
      arguments: [
        tx.pure.vector("u8", Array.from(Buffer.from(msg.target))),
        tx.pure.vector("u8", Array.from(Buffer.from(body))),
        tx.object("0x6"), // shared Clock
      ],
    });

    const res = await client.signAndExecuteTransaction({ signer: keypair, transaction: tx });
    return { digest: res.digest, suiscan: `https://suiscan.xyz/testnet/tx/${res.digest}` };
  } catch {
    return null;
  }
}
