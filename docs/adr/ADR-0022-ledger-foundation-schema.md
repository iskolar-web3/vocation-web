<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0022 — Ledger foundation schema: adopting ADR-0013 Option 1's shape, not its decision

- **Date:** 2026-09-18
- **Status:** Accepted

## Context

Implementing API-064 (`GET /me/earnings`) exposed that Wave 4's payout work has nowhere to land:
`erd.md` has no `ledger_entry`, no `payout_batch`, no balance column anywhere — exactly what
ADR-0013 already diagnosed. ADR-0013 itself is still **Proposed — blocks Wave 4**, with its own
Decision section reading "Not yet made", because it bundles three separable questions: (1) the
schema shape for a ledger/payout-batch, (2) whether the platform can legally hold coach balances
(BSP/AMLA — a question for counsel, not this ADR), and (3) how a coach actually receives money at
all (PRD Q10, unresolved).

Building `GET /me/earnings` did not require an answer to any of those — it reads `booking` rows
directly, exactly as `api-spec.md` API-064 specifies today. But leaving the schema question
unresolved any longer repeats the exact mistake ADR-0013 itself warns about: "adding `failed` and
`expired` [to `payment_status`] is cheap now and a ledger-breaking migration after go-live" — the
same logic applies to the ledger tables' shape once bookings and money start accumulating against
a schema that has no place to eventually record a payout.

## Options considered

1. **Land only the two tables from ADR-0013's Option 1** (`ledger_entry`, `payout_batch`), with no
   application code reading or writing them yet. Pros: the schema exists before more booking volume
   accumulates against nothing; zero behavior change, so it carries none of ADR-0013's unresolved
   risk. Cons: two tables with no consumer is dead weight until Wave 4 actually lands.
2. **Wait for ADR-0013 to resolve fully** (PRD Q10 answered, BSP/AMLA position confirmed) before
   adding any schema. Pros: no schema decided before the product decision it serves. Cons: repeats
   the enum lesson — a schema-only migration is cheap now and gets harder once `booking` volume and
   `GET /me/earnings` usage grow around its absence.
3. **Skip the ledger tables; keep `GET /me/earnings` summing `booking` rows indefinitely.** Pros:
   simplest possible v1. Cons: this is ADR-0013's Option 3 (defer payouts entirely) by accident
   rather than by decision — it forecloses batched payouts without anyone having chosen to.

## Decision

**Option 1, scoped narrowly.** This PR adds `payout_batch` and `ledger_entry` (migration
`000013_create_ledger_and_payout_batch`) as schema only:

- `payout_batch`: `id`, `status`, `initiated_at`, `completed_at`, `total_amount`, `created_at`.
- `ledger_entry`: `id`, `coach_account_id` (FK `coach_profile`), `booking_id` (nullable FK
  `booking` — not every future entry ties to a booking), `payout_batch_id` (nullable FK
  `payout_batch` — null until a batch claims it), `entry_type`, `amount`, `created_at`. Append-only,
  same rule as `payment_event`/`moderation_action`/`audit_log` (AGENTS.md) — no UPDATE/DELETE path
  is ever added; a correction is a new offsetting row.

**This ADR does not supersede ADR-0013's blocked status.** It resolves none of ADR-0013's open
questions:

- PRD Q10 (how a coach actually receives money) is still unanswered.
- The BSP/AMLA position on holding coach balances is still counsel's to confirm.
- `GET /me/earnings` (API-064) is **not** rewired to read from `ledger_entry` — it still sums
  `booking.price`/`platform_fee`/`coach_payout` directly, per its existing `api-spec.md` contract.
  No code in this PR writes a `ledger_entry` or `payout_batch` row.
- `docs/api-spec.md`'s open questions Q5 ("Is there a coach payout endpoint at all?") and Q9 ("No
  payout or ledger endpoints exist") are unchanged and still owed to Emmanuel + PM before Wave 4.

## Consequences

- **Easier:** Wave 4 payout-batch work has a schema to build against instead of also having to design
  and migrate it under deadline; the enum-style "cheap now, breaking later" risk is closed for the
  ledger shape specifically.
- **Harder:** two tables now exist with zero application code — a reviewer scanning `erd.md` could
  mistake their presence for payouts being implemented. This ADR is the record that they are not.
- **Owed:** ADR-0013 itself still needs its Decision section resolved (PRD Q10, BSP/AMLA) before any
  code reads or writes these tables — this ADR only unblocks schema availability, not Wave 4 entry.
