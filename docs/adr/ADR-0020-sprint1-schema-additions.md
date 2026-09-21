<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0020 — Sprint 1 schema additions: `session`, deferred `review.booking_id`, coach timestamps

- **Date:** 2026-09-11
- **Status:** Accepted

## Context

Sprint 1 (`iam`, the coaching read path, `apply_click`) needed three schema calls `erd.md` doesn't
settle on its own:

1. **Server-side sessions.** `erd.md` models `account` but has no `session` entity — api-spec.md's
   "Session cookie" scheme and AGENTS.md's "server-side sessions" requirement need somewhere to
   live.
2. **`review.booking_id`.** `erd.md` specifies it `NOT NULL`, `FK → booking`, `UNIQUE`. `booking`
   doesn't exist until Sprint 2 ([`implementation-plan.md`](https://github.com/iskolar-web3/vocation-server/blob/main/docs/implementation-plan.md)), but F-013's
   read path (`GET /coaches/:slug/reviews`, API-008) is in scope now — the same shape of problem
   [ADR-0019](ADR-0019-defer-company-owner-fk.md) already solved for `company.owner_account_id`.
3. **Ordering columns on `coach_profile` and `session_type`.** `erd.md` lists no `created_at` for
   either, but the landing page's featured-coaches rail (API-011) and a session-type listing both
   need a deterministic order.

## Decision

**1. `session` table**, keyed by the SHA-256 hash of the bearer token (`token_hash`, not the raw
token) — `id`, `account_id` FK, `token_hash` unique, `created_at`, `expires_at`. A database read
can never recover a live session token, only confirm a hash matches. Added to `erd.md`.

**2. `review.booking_id` ships nullable, no FK — same pattern as ADR-0019.** Migration 0004
creates `review` with `booking_id uuid` (nullable, unconstrained) rather than waiting for
`booking`. The FK, `NOT NULL`, and `UNIQUE (booking_id)` land in a Sprint 2 migration once
`booking` exists. Until then no code path writes a review at all (API-043 isn't in Sprint 1 either)
— the table exists solely so `GET /coaches/:slug/reviews` has a queryable shape.

**3. `created_at`/`updated_at` added to `coach_profile` and `session_type`**, matching the
convention every other `erd.md` entity already follows. Used for `ORDER BY` on the featured-coaches
query (API-011) and the session-type list (API-007).

**4. `company.owner_account_id` gains its FK now** ([ADR-0019](ADR-0019-defer-company-owner-fk.md)'s
owed item) — migration 0005, once `account` exists. The column stays nullable; ADR-0019's open
question about whether it should be permanently nullable in v1 is unchanged and still owned by the
PM.

## Consequences

- **Easier:** `GET /coaches/:slug/reviews` has a real table to query against without waiting on
  Sprint 2's booking work; API-011's featured rails have a stable, intentional order instead of an
  arbitrary one.
- **Harder:** `review.booking_id` disagrees with `erd.md`'s literal `NOT NULL FK UNIQUE` until
  Sprint 2 closes the gap — the same temporary spec/schema gap ADR-0019 accepted for `company`.
- **Owed:** a Sprint 2 migration adds `booking`, then `review.booking_id`'s FK, `NOT NULL`, and
  `UNIQUE` constraint, once a review-creation endpoint (API-043) exists to populate it.
- **Propagation:** `erd.md` gains the `session` entity and the `coach_profile`/`session_type`
  timestamp columns; the `review.booking_id` note is added at its field definition.
