<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0034 — Manual coach payouts, 7-day hold and clawback

- **Date:** 2026-10-18
- **Status:** Accepted
- **Supersedes:** the disbursement part of [ADR-0028](ADR-0028-payouts-and-disbursement.md) (the
  Xendit payout runner and webhook). ADR-0028's ledger, append-only rule and masked destination stand.
- **Builds on:** [ADR-0026](ADR-0026-take-rate-10-percent.md) (10% take rate),
  [ADR-0031](ADR-0031-paymongo-gateway.md) (PayMongo, dispute fields).
- **Owner:** Issue #68, plus the payout-details item of #74.

## Context

At launch coaches are paid by hand every week. #66 removed Xendit, and the automatic payout runner
was left unwired. The rules decided on 13 Oct (#26): the coach earns 90% of the price; a late student
cancel (within 24 h) still earns the coach 90%; earnings are held 7 days; a coach is clawed back only
when a refund or lost chargeback was the coach's fault; Vocation absorbs PayMongo fees and fraud; once
a chargeback is filed the booking is never refunded.

## Decision

1. **Xendit payout code is removed.** `payout_runner.go`, the payout webhook repository code and the
   runner-only repository methods are deleted. `internal/payments/payout.go` is left in place for a
   future PayMongo Transfers transport. The ledger and `payout_batch` stay.
2. **Owed amount, computed on the server.** For each coach, earnings are payable only when their
   booking's hold clock is at least 7 days old and it has `disputed_at IS NULL`. Booking-linked
   debits (`reversal` and `clawback`) always reduce the owed amount, regardless of the booking's hold
   or dispute state. Every ledger row with no booking (payouts and payout reversals) also counts. The
   hold clock is `COALESCE(completed_at, slot_ends_at)`:
   a late-cancelled booking never completes, so it releases 7 days after its slot. A dispute filed
   after a payout is not netted back automatically; the admin uses the clawback endpoint, and a
   negative balance nets against the coach's next payout (and logs an `ALERT payout clawback`).
   A coach with a zero or negative result is not listed.
3. **`GET /admin/payouts`** lists owed coaches: `coach_name` (display name), `verified_name`
   (`account.full_name`, see 6), channel, **masked** account, holder name, `amount_centavos`,
   `booking_ids`.
4. **`POST /admin/payouts`** takes `coach_account_id`, `reference` and `amount_centavos`. The amount
   **must equal the owed amount recomputed inside the transaction**; otherwise `409` with
   `owed_centavos`. Chosen over per-booking selection because it is the simplest safe design: an admin
   cannot overpay, underpay by accident, or pay an ineligible earning, and a stale list fails loudly.
   Under the `coach_profile` row lock it inserts a `payout_batch` (`status='paid'`, `reference`,
   `recorded_by`) and a negative `payout` ledger entry. `UNIQUE (coach_account_id, reference)`
   plus the lock make it idempotent: a repeat with the same amount is `200` with `replayed: true`;
   the same reference with another amount is `409`. The replay lookup runs before the amount check,
   because after the first payout owed is 0.
5. **Credit and clawback.** `CreditCoachForBooking(ctx, bookingID, reason)` writes an `earning` for a
   paid booking that will not complete (#67's late student cancel); the one-earning-per-booking index
   makes it idempotent and stops double earning. `ClawBack(ctx, bookingID, reason)` writes one negative
   `clawback` entry equal to what is still credited for the booking (earning plus any historical
   reversal), so it is a no-op when nothing is credited.
   `ledger_entry.reason` records why. `POST /admin/bookings/{id}/clawback` (admin, `reason` required)
   is the way to claw back a lost chargeback or any coach-fault refund; there is no automatic fault
   signal for disputes. The coach-cancel path calls `ClawBack` too, but a booking cancelled before it
   completes has no earning, so today that call writes nothing.
6. **Payout details.** `PATCH /me/coach-profile` changing any payout field needs `current_password`
   (missing, empty, wrong, or a Google-only account: `403`), and `payout_account_holder_name` must equal
   the account's `full_name` ignoring case and whitespace (`422`; a coach with no `full_name` gets
   `422`). Vocation has no separate verified-name field, so `account.full_name` is the verified name.
   After a successful change the handler calls `PayoutDetailsNotifier` (default no-op) for #69's
   email alert.

## Consequences

- A successful refund on a completed paid booking keeps the coach's earning and emits an `ALERT` for
  admin review. Only an admin clawback for coach fault debits it; a clawback after payout can make
  the balance negative, and future earnings repay that debt before another payout is owed.
- The 7-day hold applies to what is *owed*, not to the ledger balance shown to the coach.
- Migration `000022`: `clawback` entry type, `ledger_entry.reason`, partial unique clawback index,
  `payout_batch.reference` / `recorded_by` and `UNIQUE (coach_account_id, reference)`.
