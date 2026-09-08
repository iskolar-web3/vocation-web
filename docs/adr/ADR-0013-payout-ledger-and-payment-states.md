<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0013 — Payout ledger, held balance, and `payment_status` failure states

- **Date:** 2026-09-08
- **Status:** **Proposed — blocks Wave 4**

## Context

Three findings that turn out to be one problem: the money model has no ledger.

**1. PayMongo has no Stripe-Connect equivalent.** There is no split-payment product that pays an
arbitrary third party out of a charge. So 95% of every peso lands in the platform's own account and
must be pushed out deliberately. At roughly ₱15 per bank transfer against ₱12.50 net commission on a
₱500 e-wallet booking, **paying per booking is loss-making**, so payouts must be batched. Batching
requires a held balance and a payout-batch entity. `erd.md` has neither: no `payout`, no
`ledger_entry`, no balance column anywhere.

**2. A refund is unrepresentable.** `CHECK (platform_fee + coach_payout = price)` holds for the life
of the row. There is no `refunded_amount`, no reversal row, and `payment_event` is an append-only
audit trail, not a ledger. So a partial refund cannot be recorded at all, and a full refund leaves
`coach_payout` still asserting the coach is owed 95% of a booking whose money went back to the
student. `payment_status = 'refunded'` is reachable while the row's money fields claim the opposite.

**3. `payment_status` cannot express failure or expiry.** API-045 permits only
`none → pending → paid → refunded`. A `payment.failed` event has no target state, so
`user-flow.md` UF-005 correctly notes a failed booking "stays `pending`". Intent expiry (EV-005)
also leaves `pending`. Consequences: the reconciliation index
`booking (payment_status, created_at) WHERE payment_status = 'pending'` grows without bound and
cannot distinguish "mid-checkout" from "declined an hour ago" from "abandoned three weeks ago"; the
reconciler polls dead intents forever; and F-022's Complete-payment button never disappears.

Holding coach balances is also money held for other people, which may touch BSP and AMLA scope. That
is a question for counsel, not for this ADR, but it is a consequence of batching rather than an
independent choice.

## Options considered

1. **Full ledger.** `ledger_entry` (append-only, double-entry), `payout_batch`, a derived coach
   balance, `refunded_amount` on booking, and `failed` / `expired` added to `payment_status`. Pros:
   every peso is traceable; partial refunds and chargebacks-after-payout become representable;
   reconciliation queries become bounded. Cons: the largest schema addition in the project, on the
   money path, with a single developer.
2. **Minimal patch.** Add `refunded_amount` and the two enum values, keep paying coaches ad hoc
   outside the system. Pros: much smaller. Cons: coach earnings then live in someone's spreadsheet,
   which is precisely the record that must survive an audit and a dispute.
3. **Defer payouts entirely; launch free-only.** Pros: zero payout machinery; Wave 3's free
   marketplace already works without any of this. Cons: no revenue, so the riskiest assumption in
   `VOCATION.md` §B9 stays untested.

## Decision

**Not yet made.** This ADR is `Proposed` and blocks Wave 4 entry, alongside PRD Q7, Q9 and Q10.

Working recommendation is **option 1**, because options 2 and 3 both end with money state living
outside the system that is accountable for it. The `payment_status` additions should land regardless
and land **early**: `adr/README.md` §1 declares that enum IMMUTABLE, so adding `failed` and `expired`
is cheap now and a ledger-breaking migration after go-live.

## Consequences

- **Easier, if adopted:** refunds, chargebacks, batched payouts and reconciliation all become
  expressible. `GET /me/earnings` reads a balance instead of summing bookings.
- **Harder:** it is the single largest piece of schema design remaining, and it is the one place
  `payments-auditor` and the Security Engineer must both sign off.
- **Owed before Wave 4:** answer PRD Q10 (how a coach actually receives money) — the ledger shape
  follows from it, not the other way round. Confirm the BSP/AMLA position on held balances.
