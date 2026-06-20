import { MemWal } from "@mysten-incubation/memwal";

export const DEFAULT_TESTNET_RELAYER = "https://relayer-staging.memory.walrus.xyz";

export interface MemWalCredentials {
  key: string;
  accountId: string;
  serverUrl?: string;
  namespace?: string;
}

export function createMemWalClient({ key, accountId, serverUrl, namespace }: MemWalCredentials) {
  return MemWal.create({
    key,
    accountId,
    serverUrl: serverUrl ?? DEFAULT_TESTNET_RELAYER,
    namespace,
  });
}
