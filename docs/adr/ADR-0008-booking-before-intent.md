<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0008 — Booking row written before the PayMongo intent; orphan sweeper

- **Date:** 2026-09-08
- **Status:** Accepted
- **Supersedes:** the atomicity claim in `api-spec.md` API-041

## Context

`api-spec.md` API-041 promised, on a PayMongo failure, that "the booking is not left half-created;
either both the row and the intent exist, or neither does."

That is not implementable. A Postgres transaction cannot span an HTTP call to PayMongo. One of the
two writes always commits first, and either can fail independently. The spec required a guarantee no
code can deliver, which means the real behaviour would have been decided accidentally by whoever
wrote the handler.

## Options considered

1. **Write the booking first, then create the intent; sweep orphans.** Pros: a PayMongo failure
   leaves a `pending` booking with no intent, which F-022's Complete-payment action already covers —
   the student retries and nothing is lost. No student can ever be charged for a booking with no row.
   Reuses the intent-expiry sweeper. Cons: dead `pending` bookings hold coach slots until the sweeper
   runs.
2. **Create the intent first, then write the booking.** Pros: no orphan bookings in the student's
   list; slots never held by a booking that will not be paid. Cons: a database failure after a
   successful charge leaves a paid student with no booking — unrecoverable without manual
   reconciliation against PayMongo. Also needs somewhere to stage the intent before the booking
   exists, which means another table anyway.
3. **Option 1 plus an explicit short-lived reservation record.** Pros: strongest correctness — no
   orphan bookings, no charged-without-row, no stale holds. Closes `erd.md` Q3 and EV-005 too. Cons:
   a third state and a third table on the money path, which is more moving parts on the code the
   single developer can least afford to get wrong. Over-engineered for the expected booking volume.

## Decision

**Option 1.** The booking row is written first with `status=pending`, `payment_status=pending`. The
PayMongo intent is created second. A sweeper resolves bookings left `pending` with no live intent.

API-041's atomicity sentence is removed and replaced with the explicit ordering and the failure
behaviour.

## Consequences

- **Easier:** the worst failure is a recoverable one. A stuck `pending` booking is visible to the
  student and retryable; a charge with no booking is neither.
- **Harder:** slot availability is briefly wrong while a dead `pending` booking holds a slot, bounded
  by the hold window that `erd.md` Q3 still has to set.
- **Owed:** API-041 rewritten; the sweeper becomes an explicit task rather than an implied one; Q3
  must be answered before the paid path ships.
