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

```bash
# 1. install site-builder per the Walrus Sites docs, then from this folder:
site-builder publish ./ --epochs 5

# 2. it prints the new site object id + a portal URL like:
#    https://<base36-id>.walrus.site
```

After publishing, paste the resulting URL into the repo `README.md` and
`SUBMISSION.md` (the "Links" section).

To update later: `site-builder update ./ <site-object-id> --epochs 5`.
