<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0031 — PayMongo Checkout Sessions as the payment gateway

- **Date:** 2026-10-14
- **Status:** **Accepted**
- **Supersedes:** [ADR-0027](ADR-0027-xendit-gateway.md). ADR-0028's gateway-neutral payout ledger stands; PayMongo Transfers is future work.

## Context

The team cannot access Xendit. Paid coaching still needs hosted checkout and a verified webhook
before payment can be confirmed (BR-007). PayMongo Checkout Sessions supports the local payment
methods needed for v1 and provides signed webhooks. Coach payout transport is withdrawn; coaches
will be paid manually until PayMongo Transfers is implemented in follow-up work.

## Options considered

1. **Stay on Xendit.** Pros: the current adapter and payout transport already exist. Cons: the team
   cannot access Xendit, so paid bookings cannot be tested or operated.
2. **Return to PayMongo Checkout Sessions.** Pros: hosted checkout, local payment methods, and
   signed webhooks are available to the team. Cons: checkout and webhook behavior needs a new
   integration, and coach payouts remain manual.
3. **Support both gateways.** Pros: preserves a possible Xendit path. Cons: two clients and webhook
   paths add failure modes without an available Xendit account.

## Decision

Use PayMongo Checkout Sessions through the existing `payments.IntentCreator` boundary:

- Create sessions with `POST /v1/checkout_sessions`, enabling `gcash`, `paymaya`, `grab_pay`,
  `shopee_pay`, and `qrph`. Cards are excluded; over-the-counter is excluded because it cannot be
  refunded. Store the returned session id (`cs_…`) in `gateway_ref` and return its `checkout_url`.
- Store the payment id (`pay_…`) as `gateway_payment_ref`, refund id (`ref_…`) as
  `gateway_refund_ref`, and dispute time as `disputed_at`.
- Before replacing a checkout, expire the stored session, then create and store its replacement.
  A session created by PayMongo whose response is lost has no stored reference and cannot be paid
  by the customer, because its checkout URL was never returned. This avoids a list-sweep; PayMongo
  has no API to list or search sessions.
- A pending paid booking retains its slot for 24 h after the last checkout was issued. The sweeper
  then expires the session and cancels the booking; sessions do not expire on their own and do not
  emit an expiry webhook.
- Verify `Paymongo-Signature` as `t=<ts>,te=<hex>,li=<hex>` using HMAC-SHA256 over `<t>.<raw body>`
  with `PAYMONGO_WEBHOOK_SECRET`, and compare in constant time. Verify before parsing the body; use
  no timestamp tolerance. Confirm the signature format with the PayMongo tunnel test with a real
  test event.
- Handle four events: `checkout_session.payment.paid` identifies the paid payment in the session's
  `payments[]` and confirms the booking; `payment.failed` is recorded as `EventUnhandled` (applied,
  with no booking state change) because a failed attempt leaves the session payable, and is logged
  without an alert; `refund.succeeded` marks the payment refunded; `dispute.created` records
  `disputed_at` (the event documents no payment id, so linkage remains to be confirmed by the
  PayMongo tunnel test with a real test event). Confirm the refund event name with that test as well.
- Issue refunds under the booking row lock, so a recorded dispute blocks the refund; PayMongo's
  refusal to refund a disputed transaction is the gateway backstop. Use
  `Idempotency-Key: refund-<booking id>`.
- Refuse `sk_live_` keys unless `APP_ENV=production`, at startup and on each checkout.
- Use `PAYMONGO_SECRET_KEY`, `PAYMONGO_BASE_URL`, and `PAYMONGO_WEBHOOK_SECRET`; register the
  webhook at `/webhooks/paymongo`.
- Withdraw the Xendit payout transport and remove `cmd/payouts`. ADR-0028's ledger and
  `payout_batch` remain; coach payouts are manual until PayMongo Transfers is implemented (future work).

## Consequences

- **Easier:** the team can use PayMongo test keys for checkout and verified webhook development;
  the five chosen methods support local digital payments.
- **Harder:** coach payouts are manual until Transfers work is delivered; Checkout Sessions need an
  explicit 24 h sweeper and expire-before-replace flow.
- The `vocation-web` contract remains `checkout_url`.
- **Unconfirmed until the PayMongo tunnel test with a real test event:** the webhook signature
  format, refund event name, and dispute linkage.
