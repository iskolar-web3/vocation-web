<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0039 — Cap how long an unpaid booking holds a slot; rate-limit checkout and payout re-authentication

- **Date:** 2026-11-03
- **Status:** Accepted
- **Supersedes:** the sentence in [ADR-0031](ADR-0031-paymongo-gateway.md) that says a pending paid
  booking keeps its slot "24 h after the last checkout was issued". The code already used 30 minutes
  of idleness; this ADR makes that the recorded rule and adds an absolute cap.
- **Builds on:** [ADR-0033](ADR-0033-postgres-rate-limits-replica-safe-jobs.md) (Postgres-backed
  limits), [ADR-0034](ADR-0034-manual-coach-payouts.md) (current password to change payout details).
- **Owner:** Issues #98 (SEC-33) and #99 (SEC-34); Audit.md SEC-33, SEC-34, SEC-06.

## Context

1. `POST /bookings/{id}/checkout` had no limiter and `SetGatewayRef` sets `updated_at = now()`. The
   expiry sweep looked only at `updated_at`, so re-issuing checkout every under 30 minutes kept an
   unpaid booking, and its coach slot, alive until the session started. That defeats the 10 per hour
   booking-create limit, whose purpose is to stop slot squatting.
2. `PATCH /me/coach-profile` checks the current password before a payout change (ADR-0034) but had no
   limiter, so a stolen coach session could guess the password without bound. Every other
   current-password check already spends one shared budget.

## Decision

1. **Absolute hold cap.** `CheckoutMaxHold = 2h`, measured from `booking.created_at`. The sweep
   expires a `pending`/`pending` booking when it has been idle for `CheckoutWindow` (30 minutes since
   `updated_at`) **or** is older than `CheckoutMaxHold`, whatever its `updated_at`. The SQL selection
   and the re-check under the row lock use the same predicate. Expiry reuses `ExpireUnpaid`, which
   cancels the booking, sets `payment_status = expired` and frees `availability_slot.booking_id`
   (SEC-06 is unchanged: a second student can then book the slot).
2. **Checkout refuses past the cap.** Under the booking row lock, `POST /bookings/{id}/checkout`
   returns `409` once the booking is older than `CheckoutMaxHold`, so a re-issue cannot race the
   sweep. No Checkout Session is created.
3. **Checkout limiter.** `POST /bookings/{id}/checkout` is limited to 10 per hour per account, in its
   own bucket `booking-checkout`, on the shared Postgres store. It runs after the session and owner
   checks, so unauthenticated or non-owner calls do not spend it. Excess calls return `429` with
   `Retry-After`.
4. **Payout re-authentication joins the shared password-change budget.** The coach profile handler
   spends one unit of bucket `password-change` (5 per 15 minutes per account, shared with
   `POST /auth/password/change` and `PATCH /me/settings`) before verifying the password, and only when
   a payout field is sent. Past the budget it returns `429` with `Retry-After`. Edits that change no
   payout field are unaffected.

5. **Cancel-and-rebook is closed.** `POST /bookings` for a paid session returns `409` when the
   student already has 3 bookings with `status=pending` and `payment_status=pending`, and `409` when
   the same student had a booking for the same coach slot end unpaid (`cancelled` with
   `payment_status` `expired` or `failed`) in the last 30 minutes, so another student gets a window.
   Both checks run in the `CreateBooking` transaction that locks the slot, under a per-student advisory
   lock so parallel requests cannot beat the cap. Free sessions are unaffected.
6. **The sweep takes the oldest hold first.** `ListStalePendingBookings` orders by `created_at`
   (matching `booking_pending_payment_idx`), so its limit of 100 cannot starve capped rows whose
   `updated_at` keeps being refreshed.
7. **Checkout past the cap releases the hold.** The same locked call that returns `409` expires the
   stored Checkout Session and runs `ExpireUnpaid`, so the slot frees immediately. If PayMongo reports
   a payment in flight, nothing is expired and the in-progress `409` is returned.

## Consequences

- An unpaid booking holds a slot for at most 2 hours from creation plus one sweep interval (2
  minutes), however often checkout is re-issued. The 30 minute idle rule is a separate, earlier
  trigger. A student who needs longer must book again.
- The same-slot cooldown also follows idle-sweep and hold-cap expiry, so a slow payer whose booking
  lapsed must wait 30 minutes or pick another slot.
- Accepted trade-off: a coach cancelling an unpaid booking also starts that student's cooldown.
  `booking` has no cancelled-by column and a migration is not worth it now.
- Out of scope, tracked separately: free and intro-call bookings are confirmed immediately and have
  no hold cap (pre-existing; its own issue).
- Residual, pre-existing: the sweep reads at most 100 rows per run, so rows that keep being skipped
  (for example a payment in flight) at the head of the queue could delay later ones.
- A slow genuine payer past 2 hours gets `409` and must rebook; the sweep expires any open gateway
  session first.
- A coach who mistypes their password five times in 15 minutes is locked out of password-gated
  changes for the remainder of the window, the same as on the other routes.
- Limits are `[assumption]` figures in [`api-spec.md`](../api-spec.md) §Rate limits; the Security
  Engineer owns the final numbers.
