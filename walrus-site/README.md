# MemSurf — Walrus Sites page

A single static page ([`index.html`](index.html)) published via **Walrus Sites**,
in addition to the Vercel-hosted app, to demonstrate direct use of another part
of the Walrus stack.

> The full Next.js app is **not** a Walrus Site — it has server-side API routes
> (MemWal signing, Sui RPC) that need a server. This page is the static summary;
> the live app stays at [memsurf.vercel.app](https://memsurf.vercel.app).

## Publish (testnet)

Needs the [`site-builder`](https://docs.wal.app/walrus-sites/tutorial-install.html)
CLI and a Sui testnet wallet with a little **SUI** + **WAL** (free from the
testnet faucets).

## Published (testnet)

Live on **Walrus testnet** — Site object
[`0x1445d8ca1aa7feef197afab8270ccd6811cb571994c37706a584509371200e78`](https://suiscan.xyz/testnet/object/0x1445d8ca1aa7feef197afab8270ccd6811cb571994c37706a584509371200e78)
(Sui object type `::site::Site`), base36 subdomain
`i6ua4t4now571z0d3q1sloifnv77odb9pjnepo031ruh3hrw8`. `ws-resources.json` tracks
the site object id for future updates.

> **Browsing a testnet site:** `wal.app` only serves **mainnet** sites. To view
> the testnet build, run a portal locally (then open
> `http://i6ua4t4now571z0d3q1sloifnv77odb9pjnepo031ruh3hrw8.localhost:3000`) —
> see the [portal docs](https://docs.wal.app/walrus-sites/portal.html#running-the-portal-locally).
> The Site object itself is verifiable on-chain regardless of portal.

## Reproduce / update

```bash
# binaries (Linux x86_64); configs land in ~/.config/walrus/
curl -fsSL https://storage.googleapis.com/mysten-walrus-binaries/walrus-testnet-latest-ubuntu-x86_64 -o ~/.local/bin/walrus
curl -fsSL https://storage.googleapis.com/mysten-walrus-binaries/site-builder-testnet-latest-ubuntu-x86_64 -o ~/.local/bin/site-builder
chmod +x ~/.local/bin/walrus ~/.local/bin/site-builder
curl -fsSL https://docs.wal.app/setup/client_config.yaml -o ~/.config/walrus/client_config.yaml
curl -fsSL https://raw.githubusercontent.com/MystenLabs/walrus-sites/testnet/sites-config.yaml -o ~/.config/walrus/sites-config.yaml

walrus get-wal --amount 500000000   # swap 0.5 testnet SUI -> WAL

# from this folder — publish (first time) or update (subsequent):
site-builder --config ~/.config/walrus/sites-config.yaml --context testnet publish ./ --epochs 5
site-builder --config ~/.config/walrus/sites-config.yaml --context testnet update --epochs 5 ./ <site-object-id>
```
