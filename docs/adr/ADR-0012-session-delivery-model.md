<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0012 — Session delivery, cancellation, and reschedule model

- **Date:** 2026-09-08
- **Status:** **Proposed — blocks Wave 3**

## Context

The product sells a coaching session. Nothing in the spec suite says how one is delivered, cancelled,
or proven to have happened.

Concretely, from the specs as written:

- `booking.join_url` is a **nullable text column that nothing produces.** `api-spec.md` API-037
  returns it for `confirmed` bookings, and `user-flow.md` UF-005 shows the student receiving it. No
  endpoint sets it. No video provider is chosen anywhere in 19 documents.
- `booking_status` includes **`cancelled`**, and **no endpoint or screen sets it.** A student or coach
  who must cancel has no path at all. `user-flow.md` §5 lists 17 edge cases and cancellation is not
  among them.
- No reschedule. No no-show policy. No reminders — notification delivery is itself unresolved.
- Payment is captured **before** delivery, and no delivery evidence is retained.

That last point is why the refund question (PRD Q7) has stayed unanswerable: there is no record of
whether the thing being refunded was delivered. This is not an edge case; it is the core transaction.

## Options considered

1. **Coach enters the join link.** The coach pastes a Meet/Zoom link when confirming, or stores a
   standing personal room on their profile. Pros: no integration, no vendor, no API keys, works
   immediately. Cons: no attendance signal at all, so `completed` stays a manual judgement (PRD Q9)
   and no-show disputes are unresolvable from platform data.
2. **Integrate one video provider.** Generate a room per booking. Pros: a real attendance signal,
   which makes `completed` automatic and gives refunds something factual to rest on. Cons: a vendor,
   API keys, per-minute cost against a ₱12.50 net commission, and a new failure mode on the money
   path.
3. **Off-platform delivery, on-platform confirmation.** No link at all; both parties mark the session
   done, and a dispute window precedes payout. Pros: cheapest; sidesteps video entirely. Cons: pushes
   coordination into email or chat the platform cannot see, and two-party confirmation is its own
   workflow.

## Decision

**Not yet made.** This ADR is `Proposed` and blocks Wave 3.

Working recommendation is **option 1 for v1**, on the grounds that it needs no vendor and no spend
while paid conversion is still unproven, and that option 2 remains available later without
re-deciding anything else. Whichever is chosen, the same three things are owed: a producer for
`join_url`, a cancel endpoint with a defined refund consequence, and a rule for who sets
`completed`.

## Consequences

- **Whatever is chosen:** `erd.md`, `api-spec.md`, `sitemap.md` and `user-flow.md` all gain a
  cancellation path, and PRD Q9 (`completed`) is answered as a side effect.
- **If left unresolved:** Wave 3 ships a marketplace that takes bookings it cannot deliver and cannot
  cancel. Wave 4 then layers payment on top, making every unresolved case a money dispute.
- **Owed before Wave 3:** pick an option; define the cancellation window and its refund consequence;
  name who sets `completed`.
