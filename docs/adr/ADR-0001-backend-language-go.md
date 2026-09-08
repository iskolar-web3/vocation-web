<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0001 — Go for the server API, against the charter's own prose

- **Date:** 2026-09-07
- **Status:** **Accepted, provisional** — pending a charter correction and a conscious re-confirmation

## Context

`Vocation Project Charter.pdf` contradicts itself on the backend:

- **§I Project Summary:** "a server API (**Bun + Hono + TypeScript** over PostgreSQL)"
- **§II Tools to be used → Backend:** "i. pnpm  ii. **Go**"

The owner (PM) stated on 2026-09-07 that the main backend language is Go. Note that §II also lists
`pnpm` under Backend, which is a JavaScript package manager and belongs to the Bun/Hono reading —
so the tools list is itself internally mixed.

This is not a preference question. Two people reading the same charter will build different
systems, and the team has exactly **one** Full Stack Developer (charter §IV) whose other repo is
`Vite + React + TypeScript`.

## Options considered

1. **Go** — pros: single static binary, trivial Docker image, strong stdlib HTTP, good Postgres
   tooling (`pgx`/`pgxpool`), and it matches the tools list the team assembled. Cons: the one
   developer context-switches languages between the two repos; no type sharing with the client;
   `pnpm` in the same list becomes meaningless.
2. **Bun + Hono + TypeScript** — pros: one language across both repos, which for a single
   full-stack developer is a real velocity multiplier; types shareable with the client; matches
   §I prose and the `pnpm` entry. Cons: Bun is a younger runtime for a system that moves money;
   contradicts the tools list.
3. **Defer and prototype both** — cons: the charter's Development milestone has no slack for it,
   and the decision blocks all server work.

## Decision

**Go**, per the owner's statement and charter §II's tools list. `docs/system-design.md` and
`docs/api-spec.md` are written for Go.

Status is **provisional** for two reasons: the charter prose still says otherwise and must be
corrected, and the trade-off in option 2 was never consciously weighed — Go appears to have been
inherited from a tools list rather than chosen against the one-developer constraint.

## Consequences

- **Easier:** deployment (one static binary in a minimal container), runtime predictability,
  and the money-handling paths benefit from Go's explicitness.
- **Harder:** the single developer switches languages between repos. No shared types across the
  seam, which makes `openapi.yaml` (api-spec Q1) load-bearing rather than nice-to-have — it is now
  the *only* mechanism keeping the two repos honest.
- **Owed:**
  1. Correct charter §I prose, or record why it stays as written.
  2. Remove `pnpm` from the Backend tools list, or explain what it is for.
  3. Re-confirm this against delivery capacity (PRD Q12). If the one developer becomes the binding
     constraint, option 2 should be reopened — it is listed as a live risk in `README.md` §5, not a
     closed question.
