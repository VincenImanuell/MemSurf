/**
 * MemWalChatMemory — a LangChain-style memory adapter backed by Walrus.
 *
 * Drop this into an existing agent framework to use MemWal (Walrus Memory) as
 * the agent's long-term memory layer, instead of an in-process buffer that
 * disappears when the process exits. Memories are written to and recalled from
 * Walrus testnet through the exact same MemWal client the MemSurf dashboard uses
 * (see `src/lib/memwal.ts`), so anything an agent remembers here is immediately
 * inspectable, verifiable, and routable inside MemSurf.
 *
 * The interface intentionally mirrors LangChain.js `BaseChatMemory`
 * (`memoryKeys`, `loadMemoryVariables`, `saveContext`, `clear`) so it can be
 * passed wherever a LangChain memory is expected. It deliberately avoids
 * importing the full `langchain` package — the shape is small and stable, and
 * keeping it dependency-free means the adapter also works in a hand-rolled agent
 * loop. To use it as a true `BaseChatMemory`, `extends`/wrap it in a project
 * that already has LangChain installed.
 */

import { createMemWalClient, type MemWalCredentials } from "../lib/memwal";

export interface MemWalChatMemoryConfig extends MemWalCredentials {
  /** Walrus memory namespace this agent reads/writes (e.g. "research-agent"). */
  namespace?: string;
  /** Prompt variable the recalled memory is injected as. Default: "history". */
  memoryKey?: string;
  /** Key of the human turn in `saveContext` input. Default: "input". */
  inputKey?: string;
  /** Key of the AI turn in `saveContext` output. Default: "output". */
  outputKey?: string;
  /** How many relevant memories to recall per turn. Default: 5. */
  topK?: number;
}

export interface MemoryVariables {
  [key: string]: string;
}

export class MemWalChatMemory {
  private client: ReturnType<typeof createMemWalClient>;
  private namespace: string;
  readonly memoryKey: string;
  private inputKey: string;
  private outputKey: string;
  private topK: number;

  constructor(config: MemWalChatMemoryConfig) {
    this.client = createMemWalClient({
      key: config.key,
      accountId: config.accountId,
      serverUrl: config.serverUrl,
      namespace: config.namespace,
    });
    this.namespace = config.namespace ?? "default";
    this.memoryKey = config.memoryKey ?? "history";
    this.inputKey = config.inputKey ?? "input";
    this.outputKey = config.outputKey ?? "output";
    this.topK = config.topK ?? 5;
  }

  /** LangChain calls this to know which prompt variables this memory provides. */
  get memoryKeys(): string[] {
    return [this.memoryKey];
  }

  /**
   * Recall the memories most relevant to the current input and return them as a
   * single string under `memoryKey`, ready to splice into the prompt. With no
   * input we fall back to a broad recall so the agent still gets context.
   */
  async loadMemoryVariables(values: Record<string, unknown> = {}): Promise<MemoryVariables> {
    const query = String(values[this.inputKey] ?? "").trim();
    const { results } = await this.client.recall({
      query: query || "recent context",
      limit: this.topK,
      namespace: this.namespace,
    });
    const history = results.map((r) => r.text).join("\n");
    return { [this.memoryKey]: history };
  }

  /**
   * Persist one conversation turn to Walrus. `rememberAndWait` blocks until the
   * relayer has indexed the blob, so a subsequent `loadMemoryVariables` can
   * recall it. MemWal extracts the salient facts on its side.
   */
  async saveContext(
    inputValues: Record<string, unknown>,
    outputValues: Record<string, unknown>
  ): Promise<void> {
    const human = String(inputValues[this.inputKey] ?? "").trim();
    const ai = String(outputValues[this.outputKey] ?? "").trim();
    if (!human && !ai) return;
    const turn = [human && `Human: ${human}`, ai && `AI: ${ai}`].filter(Boolean).join("\n");
    await this.client.rememberAndWait(turn, this.namespace, { timeoutMs: 30000 });
  }

  /**
   * No-op for the LangChain contract. Walrus is immutable and append-only — you
   * never delete memory, you correct forward. Use MemSurf's Curator to manage
   * stale/duplicate entries instead.
   */
  async clear(): Promise<void> {
    /* intentionally empty — Walrus memory is append-only */
  }
}
