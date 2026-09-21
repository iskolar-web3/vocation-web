<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0019 — `company.owner_account_id`: nullable, no FK, until `iam` lands

- **Date:** 2026-09-11
- **Status:** Accepted

## Context

[`erd.md`](https://github.com/iskolar-web3/vocation-server/blob/main/docs/erd.md) specifies `company.owner_account_id` as `uuid NOT NULL`, `FK → account`
(role `employer`). Sprint 0's migration 0001 is explicitly scoped to **`company` and `internship`
only** — not the other 18 tables in `erd.md`, `account` included
([`implementation-plan.md`](https://github.com/iskolar-web3/vocation-server/blob/main/docs/implementation-plan.md)). `account` lands with `iam` in Sprint 1.

Separately, [ADR-0010](ADR-0010-mvp-cut-to-17-features.md) already deferred all employer
self-serve out of v1: admin creates companies and listings directly (F-050, repurposed), so no
employer account is guaranteed to exist to own a `company` row in v1 at all.

## Options considered

1. **`owner_account_id` nullable, no FK, in migration 0001; tighten later.** Pros: migration 0001
   applies and reverses cleanly with no dependency on a table that doesn't exist yet; seed data
   (Sprint 0) can create companies without fabricating `account` rows. Cons: `erd.md`'s `NOT NULL`
   + FK isn't literally enforced yet — a temporary gap between spec and schema.
2. **Create a throwaway `account` table now, just to satisfy the FK.** Pros: matches `erd.md`
   literally. Cons: violates the explicit Sprint 0 scope; `iam`'s real design (Argon2id, sessions)
   is separately-owned Sprint 1 work, and a placeholder table would need replacing immediately —
   two migrations doing one job.
3. **A placeholder default value for `owner_account_id`.** Cons: fabricates a value with no real
   referent — worse than leaving the column null, and harder to distinguish from a genuine owner
   later.

## Decision

**Option 1.** In migration 0001, `company.owner_account_id` is `uuid` (nullable, no FK). A Sprint 1
migration adds the FK once `account` exists — at which point `erd.md`'s open Q1 (single-valued
role?) and ADR-0010's admin-owns-listings model should also settle whether the column stays
permanently nullable for v1, since no employer signup path exists to populate it.

## Consequences

- **Easier:** migration 0001 has no dependency on unbuilt tables; `cmd/seed` creates companies
  without fabricating account rows.
- **Harder:** `erd.md` and the live schema disagree on this one field until Sprint 1's migration
  closes the gap.
- **Owed:** a Sprint 1 migration adds `REFERENCES account (id)` to `owner_account_id` (or `erd.md`
  is amended to make the column permanently optional, if admin-authored companies turn out to be
  the v1-long answer — the same question `erd.md` Q1 already leaves open).
