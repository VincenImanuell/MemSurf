# MemSurf — On-chain deployment (Sui testnet)

The `memsurf::routing` Move package is **published and live on Sui testnet**.
Every value below is public, on-chain, and independently verifiable on a block explorer.

## Addresses

| What | ID |
|--|--|
| **Package** (`memsurf::routing`) | `0xf13a3c58afab129da743cb1fb1f3804cf08f6b172ba699cee8aeeceb9e5c788a` |
| **RoutingRegistry** (shared object) | `0x3e816f9502040fff7ca017d47175182a0abed0ba5ba3c5bb3a401e08d7a8a6ae` |
| **Signer / deployer address** | `0x5455d4870384cd98bfdb45789729bcac29a6f27bed250d87fd2d816fb88251e9` |
| Network | Sui **testnet** |

## Transactions

| Tx | Digest |
|--|--|
| **Publish** | `72dBkvuRB8jW3cpK1kZUVeZjhKcbwGRSrauF66SNmRfP` |
| **First anchor** (`anchor_routing`, emits `RoutingAnchored`) | `8ipEB22bqgGPBhzJMoFV2y7RvpU4EqEsjuhNPNt81HBu` |

The first anchor emitted a real `RoutingAnchored` event:
`seq=1, source="research-agent", target="trading-bot", count=1, digest=0xdeadbeef`.

## Explorer links

- Package — https://suiscan.xyz/testnet/object/0xf13a3c58afab129da743cb1fb1f3804cf08f6b172ba699cee8aeeceb9e5c788a
- Registry — https://suiscan.xyz/testnet/object/0x3e816f9502040fff7ca017d47175182a0abed0ba5ba3c5bb3a401e08d7a8a6ae
- Publish tx — https://suiscan.xyz/testnet/tx/72dBkvuRB8jW3cpK1kZUVeZjhKcbwGRSrauF66SNmRfP
- Anchor tx — https://suiscan.xyz/testnet/tx/8ipEB22bqgGPBhzJMoFV2y7RvpU4EqEsjuhNPNt81HBu
- SuiVision (package) — https://testnet.suivision.xyz/package/0xf13a3c58afab129da743cb1fb1f3804cf08f6b172ba699cee8aeeceb9e5c788a

## What it does

`anchor_routing(registry, source, target, count, digest, clock)` records a tamper-evident,
ordered, permanent witness on Sui every time the MemSurf Router moves memory between agents.
A third party can audit *that* a routing happened, when, between which agents, and over which
memory (by content digest) — independent of MemWal or MemSurf's backend.

## Re-anchor manually (proof / demo)

```bash
sui client call \
  --package 0xf13a3c58afab129da743cb1fb1f3804cf08f6b172ba699cee8aeeceb9e5c788a \
  --module routing --function anchor_routing \
  --args 0x3e816f9502040fff7ca017d47175182a0abed0ba5ba3c5bb3a401e08d7a8a6ae \
         "research-agent" "trading-bot" 1 "[222,173,190,239]" 0x6 \
  --gas-budget 50000000
```

## Wiring the live app (optional)

To let the deployed app anchor automatically, set these env vars (Vercel + `.env.local`):

```
MEMSURF_PACKAGE_ID=0xf13a3c58afab129da743cb1fb1f3804cf08f6b172ba699cee8aeeceb9e5c788a
MEMSURF_REGISTRY_ID=0x3e816f9502040fff7ca017d47175182a0abed0ba5ba3c5bb3a401e08d7a8a6ae
MEMSURF_SUI_KEY=<bech32 suiprivkey… of the signer address — export with:  sui keytool export --key-identity 0x5455d4870384cd98bfdb45789729bcac29a6f27bed250d87fd2d816fb88251e9 >
```

> The signer holds only testnet faucet SUI for gas. Keep `MEMSURF_SUI_KEY` out of git
> (it's only ever an env var). The package + registry IDs are public and safe to commit.
