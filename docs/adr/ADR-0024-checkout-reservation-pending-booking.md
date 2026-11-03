<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0024 — Checkout reservation is the pending booking row (erd Q3)

- **Date:** 2026-09-22
- **Status:** Accepted

## Context

`erd.md` Q3 asked how long a slot stays reserved during checkout, to decide whether
`availability_slot.booking_id` is set at UF-005 step 5 or step 8. ADR-0008 already answered the
mechanism by choosing its Option 1: the booking row is written first (`status=pending`), the PayMongo
intent is created second, and a sweeper resolves bookings left `pending` with no live intent. That
ADR explicitly rejected Option 3 — "an explicit short-lived reservation record" — as a third state
and third table on the money path, over-engineered for the expected volume. What it left open was the
wording Q3 owns: "the hold window that `erd.md` Q3 still has to set."

## Options considered

1. **The pending booking row is the reservation.** `availability_slot.booking_id` is set in
   `CreateBooking`'s transaction (step 5); the slot is released when the booking is cancelled,
   completed, or swept. No separate hold table or time-boxed reservation exists. This is ADR-0008
   Option 1, already implemented.
2. **A new time-boxed hold.** A separate reservation entity with its own expiry window. This is
   ADR-0008's Option 3, already rejected there.

## Decision

**Option 1.** The pending booking row is the reservation during checkout; `booking_id` is set at step
5, not step 8. The orphan sweeper (ADR-0008) is the expiry mechanism: a booking left `pending` with
no live intent is reclaimed, which frees the slot.

Separately, migration 0015 adds `UNIQUE (coach_account_id, starts_at)` and an EXCLUDE constraint over
the slot time range. These are **complementary integrity protection** — they stop a coach from ever
creating duplicate or overlapping slots in the first place — **not a new hold system**. They change
neither how long a slot is reserved nor introduce any time-boxed expiry.

## Consequences

- **Easier:** Q3 is closed with no new mechanism to build or operate; the sweeper already exists as
  ADR-0008's explicit task.
- **Harder:** none new — a dead `pending` booking still holds its slot until the sweeper runs, the
  same bounded staleness ADR-0008 already accepted.
- **Owed:** the orphan sweeper remains an explicit task (ADR-0008's "Owed" list). This ADR records
  that it is the expiry; it does not implement it.
