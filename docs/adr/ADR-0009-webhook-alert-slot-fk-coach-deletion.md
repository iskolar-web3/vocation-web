<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0009 — Webhook alerting, slot integrity, and coach-deletion retention

- **Date:** 2026-09-08
- **Status:** Accepted

## Context

Three independent defects, grouped because each is a single spec correction with one clear fix.

**1. A rejected webhook transition vanished.** `api-spec.md` API-045 said to reject any
`payment_status` transition outside `none → pending → paid → refunded` and "leave the row
untouched", while also always returning `200` once the event was stored. So a `payment.paid` arriving
for an already-`refunded` booking is refused, answered `200`, PayMongo stops retrying, and nobody
learns the database and reality have diverged. Permanently.

**2. Two sources of truth for slot occupancy.** `erd.md` gives `availability_slot.booking_id`
("null means bookable") and separately copies `slot_starts_at` / `slot_ends_at` onto `booking` so a
later availability edit cannot move a booked session. Both are individually correct, but nothing in
the schema stops the `availability_slot` row being deleted while the booking keeps its times.
API-062's "422 on removing a slot that has a booking" is application-level only.

**3. Coach account deletion undefined.** `erd.md` §Retention specifies only the student case: "A
student deleting their account must not erase `booking.coach_payout`." A coach deleting an account
with confirmed future bookings has no defined behaviour, and `booking.coach_account_id` is a foreign
key to `coach_profile`.

## Decision

1. **Alert, do not swallow.** API-045 keeps returning `200` so retries stop, but a rejected
   transition writes a dead-letter row and raises an operational alert. Silence is the bug, not the
   status code.
2. **Enforce slot integrity in SQL.** `availability_slot` gains `ON DELETE RESTRICT` against the
   referencing booking, so the database refuses the delete rather than trusting the handler.
3. **Mirror the student rule for coaches.** Hard-delete personal fields, null the account reference
   on financial rows, keep `coach_payout` and `payment_event`, and **block deletion outright while
   confirmed future bookings exist** — a coach cannot walk away from sessions students have paid for.

## Consequences

- **Easier:** each of the three failures becomes visible or impossible instead of silent.
- **Harder:** coach deletion is now a blocking operation with a precondition, which needs a
  user-facing message explaining why.
- **Owed:** `api-spec.md` API-045 and API-062, `erd.md` §Constraints and §Retention.
