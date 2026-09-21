<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0012 — Session delivery, cancellation, and reschedule model

- **Date:** 2026-09-11
- **Status:** **Accepted**

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

**Option 1 is accepted for v1.**
Coaches will provide a join link (e.g., Google Meet, Zoom) when confirming the booking or by setting a default link in their profile.

**Rules established:**
1. **Producer for `join_url`:** The coach provides this either on their profile (default) or upon confirmation.
2. **Cancellation window and refunds:** Students can cancel up to 24 hours before the session start time for a full refund. Coaches can cancel at any time prior to the session, which automatically triggers a full refund.
3. **Completion (`completed` status):** The session is marked `completed` manually by either party after the session time. If neither party acts, it auto-completes 24 hours after the scheduled end time to ensure coaches get paid. Disputes must be raised within this 24-hour window.

## Consequences

- `erd.md`, `api-spec.md`, `sitemap.md`, and `user-flow.md` must be updated to include the cancellation path.
- The refund policy based on the 24-hour window must be enforced on the backend.
- A background job or chron task must be introduced to auto-complete sessions 24 hours post-schedule.
- Sprint 2 (Bookings) is unblocked and can proceed.
