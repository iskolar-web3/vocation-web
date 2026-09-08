# vocation-web

Client web app for **iSkolar Vocation** — an internship/OJT directory paired with a coach
marketplace for Filipino students. Vite + React + TypeScript + TanStack + Tailwind, mobile-first
(375px primary target).

> **No application code yet.** This repo currently holds the screen and journey specs.
> Scaffolding is `TASK-005`.

## Start here

1. **[docs/index.md](docs/index.md) §0** — which document owns which fact.
2. **[docs/sitemap.md](docs/sitemap.md)** — the 30 screens, routes, and access zones.
3. **[AGENTS.md](AGENTS.md)** — conventions, and **which docs you may edit**.

## Docs ownership

This repo **owns** `docs/sitemap.md` and `docs/user-flow.md`.

Every other file under `docs/` is **mirrored read-only** from
[vocation-server](https://github.com/iskolar-web3/vocation-server) and carries a `MIRRORED` banner.
**Do not edit those.** Edit upstream, then:

```bash
scripts/sync-docs.sh
```

`docs/.synced-from` records the upstream commit the mirror came from.
See [ADR-0011](docs/adr/ADR-0011-spec-sync-per-repo-ownership.md).

## Scope

v1 is **17 features**, not the charter's 25 —
[ADR-0010](docs/adr/ADR-0010-mvp-cut-to-17-features.md). Deferred screens are struck through in the
sitemap, not deleted. If you are about to build something struck through, stop.
