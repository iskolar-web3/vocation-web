# iSkolar Vocation (web) — Agent Guide

Client web app for **iSkolar Vocation**: an internship/OJT directory paired with a coach
marketplace for Filipino students. Vite + React + TypeScript + TanStack + Tailwind, mobile-first.

The server API lives in
**[iskolar-web3/vocation-server](https://github.com/iskolar-web3/vocation-server)**.

## ⚠ Which docs you may edit

This repo **owns** exactly two documents:

- [`docs/sitemap.md`](./docs/sitemap.md) — screens `S-###`, IA, routes, access zones, responsive
- [`docs/user-flow.md`](./docs/user-flow.md) — journeys `UF-###`, edge cases `EV-###`, events

Everything else under `docs/` is **mirrored read-only** from `vocation-server` and carries this
banner:

```
<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here. -->
```

**Never edit a file with that banner.** Your change will be silently overwritten by the next sync,
and the two repos will disagree in the meantime. Edit it upstream in `vocation-server`, then run:

```bash
scripts/sync-docs.sh
```

Links to `VOCATION.md`, `erd.md`, `system-design.md` and `implementation-plan.md` are absolute
GitHub URLs, because those documents live only in the server repo. That is deliberate, not a bug.
See [ADR-0011](./docs/adr/ADR-0011-spec-sync-per-repo-ownership.md).

## For teammates (30-second orientation)

- **[`docs/index.md`](./docs/index.md) §0** says which doc owns which fact. Read it first.
- **`F-###`** feature · **`BR-###`** business rule · **`S-###`** screen · **`UF-###`** flow ·
  **`API-###`** contract. **All permanent — never renumber.**
- **[`docs/adr/`](./docs/adr/)** is the decision home. Newest Accepted ADR wins.
- **Scope is v1's 17 features**, not the charter's 25
  ([ADR-0010](./docs/adr/ADR-0010-mvp-cut-to-17-features.md)). Deferred work is struck through in
  the specs. **If you are about to build something struck through, stop.**

## Living plan

`TASK-###` state lives in
[vocation-server/docs/implementation-plan.md](https://github.com/iskolar-web3/vocation-server/blob/main/docs/implementation-plan.md).
Trello mirrors it; the ledger wins. Branch `task/TASK-###-short-slug`.

Web-side scaffolding is `TASK-005`; `apiFetch` is `TASK-006`.

## Build & run

```
Not yet runnable — this repo is empty of application code. Scaffolding is TASK-005.
```

Expected: `pnpm install` → `pnpm dev`. Ported from
[academy-web](https://github.com/iskolar-web3/academy-web): Vite 8, React 19, TanStack Router +
Query, Tailwind 4, shadcn/ui, Biome, Vitest, pnpm.

## Conventions

- **Data access:** every call goes through `apiFetch` — `{ message, data }` envelope,
  `credentials: "include"`, and **Zod re-parsing at the boundary**. The client never trusts raw JSON.
  Same pattern as `academy-web`.
- **Server state:** TanStack Query. Components never call `apiFetch` directly; hooks do.
- **Mobile-first.** Primary target is **375px**. Directory filters are a bottom drawer below 768px
  and a sidebar from 768px up — that is an acceptance criterion (F-002), not a preference.
- **Money:** render `platform_fee` and `coach_payout` exactly as the API returns them. **Never
  compute money in the client.**
- Generated API client comes from `openapi.yaml` (TASK-011). Do not hand-write request types.

## Rules that must never be broken

Rule text lives in [`docs/prd.md`](./docs/prd.md) §Business rules. This is an index.

| Touching this? | Read first | Why |
|---|---|---|
| A route guard | `docs/sitemap.md` §5 | Client guards are **UX only**. The server re-checks every request |
| Anything after the PayMongo return | **BR-007** · `docs/user-flow.md` UF-005 step 7 | Show `pending`, **never** `confirmed`. Only the verified webhook confirms |
| A money value | **BR-008** | Render as returned. Never recompute |
| A verification badge | **BR-012** | `verification_status` only. In v1 no badge is ever shown |
| Any screen | `docs/sitemap.md` §2 | If it is not an `S-###` there, it does not exist. Add it to the sitemap first |
| A screen's states | `docs/sitemap.md` §2 | Empty, loading, error and success are declared per screen. Ship all of them |
| Apply / any student payload | **BR-001**, **BR-002** | Apply is an outbound redirect. The platform stores **no** applications |

## Definition of done

- Build passes; Biome clean; Vitest green.
- The screen matches its `S-###` row, every declared state renders, and it works at **375px**.
- The flow's `EV-###` breaks are handled.
- Access rules are re-checked server-side — a client guard alone is not done.
- No mirrored doc was edited.
- PR states the `TASK-###`, the `F-###` served, and docs impact (`none` is valid).

## References

- [docs/index.md](./docs/index.md) — §0 owners · §3 ADRs · §4 top risks
- [docs/sitemap.md](./docs/sitemap.md) · [docs/user-flow.md](./docs/user-flow.md) — **owned here**
- [docs/prd.md](./docs/prd.md) · [docs/api-spec.md](./docs/api-spec.md) — mirrored
- [vocation-server](https://github.com/iskolar-web3/vocation-server) — API, ERD, system design, plan
