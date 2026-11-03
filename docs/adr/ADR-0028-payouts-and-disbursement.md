<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0028 — Coach payouts and batched disbursement

- **Date:** 2026-10-01
- **Status:** **Accepted** *(disbursement part superseded by [ADR-0034](ADR-0034-manual-coach-payouts.md); ledger part stands)*
- **Resolves (in part):** [ADR-0013](ADR-0013-payout-ledger-and-payment-states.md)'s ledger and
  `payment_status` questions. ADR-0013's BSP/AMLA held-balance question remains owed to counsel and
  is not decided here.
- **Builds on:** [ADR-0022](ADR-0022-ledger-foundation-schema.md) (the empty ledger schema),
  [ADR-0027](ADR-0027-xendit-gateway.md) (Xendit, whose Payouts API is the delivery mechanism),
  [ADR-0025](ADR-0025-account-deletion-anonymisation.md) (erasure must not rewrite ledger rows),
  [ADR-0007](ADR-0007-money-split-derived-by-subtraction.md) / **BR-008** (the split).
- **Owner:** Issue #35. Reviewed by `payments-auditor` and the Security Engineer
  ([`../sad.md`](../sad.md)).

## Context

`GET /me/earnings` (API-064) showed a coach a number, and nothing could move money to them.
`ledger_entry` and `payout_batch` existed since migration 0013 ([ADR-0022](ADR-0022-ledger-foundation-schema.md))
but no code wrote to them; the endpoint summed `booking` rows directly. ADR-0013 diagnosed the
gaps and blocked Wave 4: no ledger writes, no balance, no mechanism by which a coach is paid
(PRD Q10), and no endpoint or batch operation (api-spec Q5/Q9, erd Q9).

Three constraints shape the answer:

1. **Per-booking transfers are loss-making.** Xendit's VAT-inclusive disbursement fee is ₱11.20; the
   net commission on a ₱500 e-wallet booking is far below that. Payouts must be **batched**
   (`methods.md` §8–9).
2. **A payout is an outbound push from the platform's own account**, not a gateway split. Each batch
   must be recorded before it is sent and reconciled against the gateway afterwards.
3. **The ledger is append-only and must survive account erasure.** ADR-0025 requires an erased
   coach's ledger reference to stop identifying or constraining a deleted profile **without updating
   existing ledger rows**.

## Options considered

1. **Write the ledger, pay per booking on completion.** Simplest ledger; a disbursement per booking
   destroys the margin (ADR-0013's core finding). Rejected.
2. **Write the ledger, batch weekly via the Xendit Payouts API, confirm by webhook.** The margin
   survives, every peso is traceable, and a failure is reversable by an offsetting ledger entry.
   Chosen.
3. **Keep paying out-of-band; only fix the read model.** Leaves coach earnings in a spreadsheet,
   which is the record that must survive an audit and a dispute (ADR-0013 option 2). Rejected.

## Decision

**Option 2.** The ledger becomes the source of truth for a coach's balance, and a scheduled binary
disburses it in batches through Xendit.

### Ledger (migration `0017_payouts_and_ledger`)

- `ledger_entry` is now **append-only**: DB triggers reject `UPDATE`/`DELETE`, identical to
  `payment_event` (migration 0007, AGENTS.md).
- `entry_type` is checked against exactly `earning`, `reversal`, `payout`, `payout_reversal`.
- Partial unique indexes make writes idempotent: **at most one `earning` and one `reversal` per
  `booking_id`**.
- **ADR-0025 resolution:** the `ledger_entry.coach_account_id` foreign key to `coach_profile` is
  **dropped**, and the column stays a non-null pseudonymous `uuid`. `ON DELETE SET NULL` was
  considered and rejected: it issues an `UPDATE` against an append-only row, which the new trigger
  forbids, and ADR-0025 explicitly says existing ledger rows are not updated. Once the
  `coach_profile` row is erased the uuid resolves to nothing, so it no longer identifies or
  constrains a deleted profile, and the money history is retained intact.
- `payout_batch` gains `coach_account_id` (also a plain uuid, same erasure reason), `gateway_ref`
  (the Xendit payout id, unique), `failure_reason`, a masked `destination_channel_code` /
  `destination_account_last4` snapshot, and a `status` check
  (`pending`/`processing`/`paid`/`failed`). The full destination is never copied here, so erasing a
  coach's destination leaves no second copy of the PII.
- `coach_profile` gains the payout destination: `payout_channel_code` (e.g. `PH_GCASH`, `PH_BDO`),
  `payout_account_number`, `payout_account_holder_name` — all nullable.

### The balance equation (`methods.md` §7)

```
available = SUM(ledger_entry.amount)                       -- every entry: earnings/reversals, payouts debited
in_transit = SUM(payout_batch.total_amount) over processing -- held, not yet confirmed
paid_out  = SUM(payout_batch.total_amount) over paid        -- money the gateway actually disbursed
pending   = SUM(booking.coach_payout) over confirmed, paid, not-yet-completed bookings
```

`paid_out` is the total of batches that reached `paid`, and never nets a reversal: once a batch is
`reversed` it is no longer `paid`, so it leaves both `paid_out` and `in_transit`. This keeps the
figures faithful to the batches' own states rather than back-computing them from ledger signs. A
balance can never go negative from a payout because the batch only ever pays out what is available.

### Earning and reversal

- A booking completes in exactly two places — the API-047 **complete endpoint** and the
  **auto-complete worker**. Both now write the `earning` entry (`= coach_payout`) in the **same
  transaction** that flips the status, only for `payment_status = 'paid'`. Free/intro bookings
  (`payment_status = 'none'`) earn nothing. `ON CONFLICT DO NOTHING` + the partial unique index make
  the write idempotent.
- When a completed, paid booking is refunded, a `reversal` entry (`= −coach_payout`) is written in
  the same transaction. It is derived from the `earning` row itself, so it only exists when money
  was credited. In v1 the cancel path refuses a `completed` booking, so this is a correctness guard
  for a future refund-after-completion rather than an active path.

### Batched disbursement (`cmd/payouts`)

A new binary, scheduled weekly by an external scheduler like `cmd/jiasync` (no in-process cron
exists). For every coach with `available >= PAYOUT_MINIMUM_PESOS` (default ₱500) and a complete
destination:

1. In one transaction, lock the `coach_profile` row, re-read the balance **and the destination**,
   refuse if a batch is already `pending`/`processing`, then insert a `payout_batch`
   (`status = 'processing'`, `total_amount = available`, `destination_channel_code` and
   `destination_account_last4` for audit) and the matching negative `payout` ledger entry.
   **Commit.** The destination snapshot is what the runner sends — never a stale candidate read.
2. Call Xendit `POST /v2/payouts` with `Idempotency-key: <payout_batch.id>` and the batch id as
   `reference_id`; store the returned payout id as `gateway_ref`.
3. **Definitive rejection** (a 4xx carrying a Xendit error body): no money moved. Mark the batch
   `failed`, insert a positive `payout_reversal` so the money returns to the balance, and **ALERT**.
4. **Unknown outcome** (timeout, network error, 5xx, empty 4xx, malformed 2xx): the payout may
   already exist. Keep the batch `processing` with its debit in place and **ALERT**. Never reverse on
   an unknown — that could return money that is already moving.

Every run first **re-drives** each `processing` batch with no `gateway_ref` by re-sending
`POST /v2/payouts` with the same `Idempotency-key` (the batch id): Xendit returns the original payout
for a repeated key, so the call either recovers the id or creates the payout once, never twice. A
batch whose destination was erased is held for a human instead. A fresh batch is never started for
that balance while one is `processing`.

Re-running can never double-pay: the batch id keys the gateway, the `payout` entry has already
reduced the balance, and an in-flight batch blocks a second one. A crash after the batch commits but
before the gateway call leaves it `processing`, which holds the money until the next run re-drives it
or an operator resolves it — never a double payment.

### Payout webhook

`POST /webhooks/xendit` (same callback token) now routes payout callbacks, after refund callbacks
and before the invoice parser. Xendit's v2 payout callbacks are **flat objects**
(`{"id","reference_id","status","channel_code","amount","failure_code",…}` with status
`SUCCEEDED`/`FAILED`/`EXPIRED`/`REVERSED`, no top-level `event`); the event-enveloped form
(`payout.succeeded` with `data`) is also accepted. A flat payout callback is recognised by its
`reference_id` and/or payout status **and the absence of invoice fields** (`external_id`,
`invoice_url`), so an invoice callback is never mistaken for one.

The event is recorded in `payment_event` exactly once (append-only, idempotent) with `booking_id`
null. Before storage the payload is **redacted**: the destination account number is reduced to its
last four digits and the account holder name is dropped, so the append-only trail is not a second
store of payout PII (ADR-0025). `succeeded` → `paid` + `completed_at`; `failed`/`expired`/`rejected`
→ `failed` + a `payout_reversal` entry; `reversed` → `failed` with reason `reversed` + a
`payout_reversal` entry even when the batch had already reached `paid` (a bounceback returns the
money to the balance). An unmatched reference is answered **200 with an ALERT**, never a 500. A
callback whose status contradicts the stored batch (e.g. a success after the runner already failed
and reversed it) is recorded and **ALERTed for manual reconciliation**, never applied.

### API-064 and the destination

`GET /me/earnings` stays backward compatible: `data` is still the per-booking array exactly as
before, and the balance moves into `meta.balance = { available_centavos, in_transit_centavos,
paid_out_centavos, pending_centavos }` (ADR-0018 meta). The ledger entries are exposed by a new
paginated route `GET /me/earnings/ledger`, so the screen keeps working while the client adopts
`meta.balance`. A coach sets their destination through API-061 (all three fields together,
validated: `PH_`-prefixed uppercase channel code, 6–32 digit account number, non-empty holder name).
The **full account number is never returned** — every response masks it to its last four digits.

## Consequences

- **Easier:** coaches have a real, auditable balance and a system that pays them; every peso is
  traceable through append-only rows; a failed disbursement reverses itself; the payout ledger
  survives account erasure. api-spec Q5/Q9, erd Q9 and PRD Q10 are answered by the mechanism.
- **Harder:** the money path gained a second asynchronous actor (the payout webhook) and a scheduled
  binary with state that can wedge in `processing`; that runbook (ops.md §6) is now load-bearing.
- **Owed before launch:** **counsel must confirm the BSP/AMLA position on holding coach balances**
  (ADR-0013 still owns this). The `cmd/payouts` cadence must be scheduled by ops. Finance must keep
  the Xendit payout balance funded. Xendit's disbursement figure (₱11.20) is still an issue-#25
  estimate until a signed merchant agreement.
### Retention (ADR-0025 requirement satisfied before ledger use)

`ledger_entry` and `payout_batch` are financial records and are retained **10 years `[assumption]`,
matching `booking`'s existing financial-record window in `erd.md`** — never deleted, and append-only
by DB trigger (migration 0017). Erasure acts on the account reference, not the money history:
`ledger_entry.coach_account_id` carries no FK and becomes a pseudonymous uuid once the profile is
gone, and `payout_batch` stores only a masked destination. The 10-year period is an
`[assumption]`, owned by the Security Engineer to confirm (ADR-0025); the ERD retention table now
records it.

- **Owed:** Security Engineer/counsel confirms the 10-year financial-record window; a
  `completed`-booking refund path, if ADR-0012 ever allows one, already has its reversal hook.

## Implementation clarification — 2026-10-01

This append-only clarification supersedes the earlier statements that the completed-booking
reversal is only a future guard and that an uncertain batch can immediately re-POST. The verified
`refund.succeeded` webhook can refund a completed booking today. Its `paid → refunded` transition
and the one `reversal` derived from an existing `earning` commit in the same transaction. A
duplicate callback adds no entry. If the earning was already disbursed, the reversal still records
the debt and may leave `available` negative; operations receives a clawback alert. The runner
never starts a payout while `available <= 0` (balance equation: [`methods.md` §7](../methods.md)).

For a `processing` batch with no `gateway_ref`, the runner first queries Xendit with
`GET /v2/payouts?reference_id=<batch id>`. A found payout is adopted: its gateway id is stored and
`SUCCEEDED` or `FAILED`/`EXPIRED`/`REJECTED`/`REVERSED` has the same batch and ledger effect as a
callback. An unknown status remains processing. If the query finds no payout, the runner compares
the coach's current channel code and account last four with the masked batch snapshot. It re-POSTs
with the original idempotency key only when they match and the destination is complete. A changed
or erased destination, an uncertain lookup, or a duplicate/idempotency-key 4xx keeps the debit
held and alerts operations for manual reconciliation.
