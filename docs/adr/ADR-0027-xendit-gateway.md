<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0027 — Xendit as the payment gateway

- **Date:** 2026-10-01
- **Status:** **Superseded** by [ADR-0031](ADR-0031-paymongo-gateway.md)
- **Supersedes:** the gateway part of [ADR-0005](ADR-0005-paymongo-and-take-rate.md). ADR-0005's
  take-rate exposure was already superseded by [ADR-0026](ADR-0026-take-rate-10-percent.md).

## Context

The platform must collect paid coaching through a Philippine gateway that supports cards and the
local e-wallets students actually use (GCash, Maya, GrabPay). ADR-0005 chose PayMongo on that basis
and made the take rate the binding economic question; ADR-0026 then ratified a 10% take rate
against a Xendit fee schedule.

Two things forced the gateway itself to be revisited:

1. **Payouts.** Issue #35 needs to push each coach's share out of the platform account. Xendit has a
   documented disbursement API. PayMongo's third-party payout capability was not confirmed, which
   leaves the payout ledger (ADR-0013, Q9) without a delivery mechanism.
2. **Environment discipline.** PayMongo sandbox is a separate host selected by URL; the existing
   code tried to keep dev off live keys with a base-URL convention. A gateway whose mode is selected
   by the key itself (and which can be refused outright) is easier to keep honest.

The project owner approved Xendit on 2026-10-01. This is not a cost saving: the issue #25 schedule
shows Xendit's headline rates are exclusive of 12% VAT, so the VAT-inclusive figures used for
break-even are e-wallets **2.80%** and cards **3.248% + ₱16.80**, with disbursement at **₱11.20**.

## Options considered

1. **Stay on PayMongo.** Pros: closest to the charter's §I prose and the least code churn — the
   Checkout Sessions API and signed webhooks already work. Cons: no confirmed payout API for issue
   #35, so coach disbursement stays manual and batched with no system of record; sandbox/live
   separation remains URL-based rather than key-based.
2. **Move to Xendit.** Pros: a disbursement API for issue #35; the Invoices API gives one hosted
   checkout covering cards and e-wallets; the key prefix decides test vs live so the environment is
   enforced rather than conventional; invoice expiry is an explicit API call, which closes issue
   #23's "re-issuing invalidates the previous session". Cons: a fresh integration with a new webhook
   shape (static callback token, not an HMAC signature); live activation needs a registered business
   entity and KYC.
3. **Support both behind an abstraction.** Pros: no cutover risk, keep PayMongo as a fallback.
   Cons: the payments module would carry two clients, two webhook parsers and two sets of failure
   modes for one product, and the repo has a single developer. The `IntentCreator` boundary already
   exists, so a future second gateway can be added without designing for it now.

## Decision

**Option 2.** Migrate to Xendit using the **Invoices API**:

- Create checkout with `POST /v2/invoices`; store the returned invoice `id` as
  `booking.gateway_ref` and return `invoice_url` as the API's `checkout_url` (the response field
  name is unchanged, so `vocation-web` is unaffected).
- Expire an invoice with `POST /invoices/{id}/expire!`. API-042 expires the previous invoice before
  storing the new id; cancelling a pending booking expires the live invoice best-effort.
- Authenticate the webhook by comparing the `x-callback-token` header to `XENDIT_CALLBACK_TOKEN` in
  constant time. An unconfigured token rejects every delivery. Map `PAID` → `paid` and
  `EXPIRED` → `expired`; every other status is recorded with no transition.
- Refund with `POST /refunds`, keyed by `Idempotency-key: refund-<booking id>`, mapped to the
  existing `ErrUpstream` on failure.
- Refuse to create invoices when the secret key is live (`xnd_production_…`) and `APP_ENV` is not
  `production`, at startup and on every checkout.

The `payments.IntentCreator` boundary is kept (with `Expire` added); only its implementation and the
webhook change. Columns are renamed gateway-neutral: `booking.paymongo_intent_id` → `gateway_ref`,
`payment_event.paymongo_event_id` → `gateway_event_id` (migration 0016).

## Consequences

- **Easier:** one hosted checkout for cards and e-wallets; invoice expiry closes issue #23; the live
  key guard makes it impossible for dev or staging to charge real money; a disbursement API now
  exists for issue #35 and the ADR-0013 ledger.
- **Harder:** a new webhook shape and a static token to protect; the browser's return from checkout
  still does **not** confirm a booking (BR-007) — only the verified webhook does.
- **Owed before live activation:** a **DTI (sole proprietor) or SEC-registered entity** and the
  associated KYC, because Xendit cannot activate a live account without one. Sandbox/test keys are
  available now, so development and the whole test suite run before activation.
- **Owed before launch:** confirm the fee schedule in a signed merchant agreement — the issue #25
  figures are estimates, and the `methods.md` break-even amounts (₱156 e-wallet / ₱415 card) move
  with them.
- `vocation-web` is unaffected unless it references PayMongo directly; the `checkout_url` contract
  is unchanged.
- **Superseded within this ADR (self-healing sweep):** the Decision above says API-042 expires the
  previous invoice *before* storing the new id. The implementation stores the new id first and then
  sweeps (`GET /v2/invoices?external_id=…`) every other still-`PENDING` invoice, keeping the stored
  one. This is strictly stronger: it also cleans up an invoice Xendit created before a lost response,
  or that a failed store/commit left untracked, which a single "expire the previous id" call cannot
  see. A failed sweep does not fail the re-issue (the stored invoice is the live one); the next
  re-issue or cancel sweeps again, and cancellation sweeps with no keepRef so every pending invoice
  of the booking is expired. `IntentCreator` gains `ExpireOtherPending`.
- **Refunds are asynchronous.** `POST /refunds` answers `PENDING`, `SUCCEEDED` or `FAILED`.
  `SUCCEEDED` marks the booking `refunded` immediately; `PENDING` cancels the booking while leaving
  `payment_status=paid` (a refund-in-flight state completed later by Xendit's `refund.succeeded`
  callback, handled on the same webhook endpoint and distinguished by body shape); `FAILED` changes
  nothing and the cancel returns `502`. A `refund.failed` callback is recorded unapplied and alerts
  for a manual refund.
