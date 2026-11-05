<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# Methods — every computed number and its equation

**Maintained by:** Alexandre Nevero (PM)
**Last updated:** 2026-10-01

<!--
Canonical owner of **every computed number**: its equation, its inputs, its rounding, and where it
is evaluated. `index.md` §0 gives this file that concern. Nothing else in the suite may restate an
equation — link here instead.

Rule for adding a row: a number belongs here the moment it is *displayed* or *stored derived*. If
you cannot write its equation, it does not ship.
-->

Per [`index.md`](index.md) §0 this document owns one concern: **the equation behind any number the
system computes, stores derived, or displays.** Business rules (`BR-###`) live in
[`prd.md`](prd.md); columns and types live in [`erd.md`](https://github.com/iskolar-web3/vocation-server/blob/14d7d2db2d250323067e18f056216b9686b3ba04/docs/erd.md); wire formats live in
[`api-spec.md`](api-spec.md). This file owns only the arithmetic connecting them.

## 0. Conventions that apply to every money equation

| Concern | Rule | Where enforced |
|---|---|---|
| **At rest** | `numeric(12,2)` — pesos with two decimal places. **No floats, ever** | Migration `000006` |
| **On the wire** | Integer **centavos** (`price_centavos`, `platform_fee_centavos`, …) | [`api-spec.md`](api-spec.md) |
| **In Go** | `int64` centavos; rates as decimal **strings** parsed to `math/big.Rat` | `internal/payments/split.go` |
| **Rounding mode** | Half away from zero, matching Postgres `ROUND(numeric, 2)` | `roundHalfAwayFromZero` |
| **Conversion** | `centavos = ROUND(pesos * 100)`; `pesos = centavos / 100` | Repository boundary only |

**Why no floats:** `0.1 + 0.2 ≠ 0.3` in binary floating point. On money that becomes a centavo that
exists in one system and not the other, and the database `CHECK` constraints below would start
rejecting rows the application believed were correct.

**Why the rounding mode matters:** Go computes the split and Postgres re-checks it in a `CHECK`
constraint. If the two rounded differently, a legitimate booking would be rejected at insert time.
They agree because both round half away from zero. Any change to one must change the other.

---

## 1. Platform fee — `booking.platform_fee`

Owned by **BR-008** / [ADR-0007](adr/ADR-0007-money-split-derived-by-subtraction.md).

```
platform_fee = ROUND(price × take_rate, 2)
```

| Input | Source | Note |
|---|---|---|
| `price` | `session_type.price`, snapshotted onto the booking at creation | A later price change never touches an existing booking |
| `take_rate` | `booking.take_rate`, `numeric(5,4)`, captured at creation | **Stored per booking, never read live.** `payments.DefaultTakeRate = "0.1000"` supplies the current value |

**Evaluated:** `payments.Split()` at booking creation.
**Re-checked:** `CONSTRAINT booking_platform_fee_matches_rate CHECK (platform_fee = ROUND(price * take_rate, 2))`.

## 2. Coach payout — `booking.coach_payout`

Owned by **BR-008** / [ADR-0007](adr/ADR-0007-money-split-derived-by-subtraction.md).

```
coach_payout = price − platform_fee
```

**Derived by subtraction. Never computed independently as `0.90 × price`.**

Rounding both halves independently makes some prices unrepresentable. At the current 10% rate and
`price = 10.05`:

| Method | Platform | Coach | Sum |
|---|---|---|---|
| Both rounded independently | `ROUND(10.05 × 0.10)` = 1.01 | `ROUND(10.05 × 0.90)` = 9.05 | **10.06 ✗** |
| Subtraction (this rule) | 1.01 | 9.04 | **10.05 ✓** |

At **₱499.90**, the current split is a **₱49.99** fee and **₱449.91** coach payout.

**Re-checked:** `CONSTRAINT booking_split_sums_to_price CHECK (platform_fee + coach_payout = price)`.
The invariant is structural — no application bug can write a row that violates it.

> **Frontend note.** `vocation-web` currently recomputes this in the browser with a hardcoded
> `0.05` (`DataContext.tsx`, `BookingDialog.tsx`). That is a defect: the client must **display the
> server's `platform_fee_centavos` / `coach_payout_centavos`**, never re-derive them, or the
> displayed split silently diverges the day `take_rate` changes.

## 3. Refund eligibility

Owned by [ADR-0012](adr/ADR-0012-session-delivery-model.md).

```
refund_due = actor_is_coach OR (now < slot_starts_at − 24h)
```

A coach cancelling always refunds. A student cancelling refunds only strictly more than 24 hours
before the session starts — at exactly 24 hours, no refund.

**Evaluated:** `coaching.RefundDue()`. **Amount:** always the full `price_centavos`; v1 has no
partial refunds.

**Timing:** PayMongo refund responses `pending` or `processing` leave `payment_status=paid`
(cancelled + paid = refund in flight) until the verified `refund.succeeded` webhook lands. A
`succeeded` response sets `payment_status=refunded`; `failed` (or any non-2xx) changes nothing and
the cancel returns `502 upstream_failed`. Never mark a booking `refunded` before the gateway
confirms it.

## 4. Completion eligibility and auto-completion

Owned by [ADR-0012](adr/ADR-0012-session-delivery-model.md).

```
can_complete    = now ≥ slot_ends_at
auto_completes  = status = 'confirmed' AND now ≥ slot_ends_at + 24h
```

**Evaluated:** `coaching.CanComplete()` for the manual path (API-047); the auto-complete worker
polls on a 10-minute ticker (see [`ops.md`](https://github.com/iskolar-web3/vocation-server/blob/14d7d2db2d250323067e18f056216b9686b3ba04/docs/ops.md) §4).

## 5. Coach rating — `coach_profile.rating_avg` / `rating_count`

Owned by **BR-011**.

```
rating_avg   = ROUND(AVG(review.rating), 2)   -- over all reviews for that coach
rating_count = COUNT(review.*)                 -- same scope
```

`rating` is an integer 1–5. `rating_avg` is `NULL` until the first review exists — it is **not**
zero, and must not render as a 0.00-star coach.

**Evaluated:** recomputed in the **same transaction** as the review insert (BR-011), never by a
background job, so the aggregate can never lag the reviews it summarises.

## 6. Student profile completeness — `student_profile.completeness_pct`

Owned by [ADR-0021](adr/ADR-0021-student-feature-slice-decisions.md), which closed `erd.md` Q2.

```
completeness_pct = 40 (profile exists — the four required onboarding fields)
                 + 15 if bio        is present
                 + 15 if avatar_key is present
                 + 15 if resume_key is present
                 + 15 if skills     is non-empty
                 = 100 maximum
```

The four required fields (`full_name`, `school`, `course`, `year_level`) are worth 40 collectively
because a profile cannot exist without all four. The four optional fields are worth 15 each.

**Evaluated:** `computeCompletenessPct()`, in the same statement as every `CreateProfile` /
`UpdateProfile` — never a background job.

## 7. Coach earnings and balance — API-064

Owned by [ADR-0028](adr/ADR-0028-payouts-and-disbursement.md).

Per booking (unchanged): `price_centavos`, `platform_fee_centavos`, `coach_payout_centavos`,
`payment_status`.

Balance, read from the append-only `ledger_entry` (migration `000013`, migration `000017`) and the
batches it pays out through:

```
available  = SUM(ledger_entry.amount)                          -- every entry for the coach
in_transit = SUM(payout_batch.total_amount) over processing    -- held, not yet confirmed
paid_out   = SUM(payout_batch.total_amount) over paid          -- money actually disbursed
pending    = SUM(booking.coach_payout) over confirmed, paid, not-yet-completed bookings
```

| Entry | Sign | Written when |
|---|---|---|
| `earning` | `+coach_payout` | A **paid** booking completes — API-047 or the auto-complete worker, in the same transaction as the status flip |
| `reversal` | `−coach_payout` | A completed paid booking is refunded |
| `payout` | `−total` | A coach disbursement is recorded; payouts are manual until PayMongo Transfers is implemented |
| `payout_reversal` | `+total` | That disbursement fails, is rejected, or is reversed by the gateway — including a bounceback after it had succeeded |

`paid_out` counts batches whose stored status is `paid` and never nets a reversal: a reversed batch
is `failed`, so it leaves both `paid_out` and `in_transit`. `available` is the ledger sum. A payout
cannot make it negative because the batch pays at most the positive available amount. The only
permitted negative balance is a post-payout refund: the `reversal` still records the debt,
and no automatic payout batch is sent. There is no payout transport until PayMongo Transfers lands; disbursements remain manual.

**Evaluated:** `coaching.PGRepository.LedgerTotals()` for `available`/`in_transit`/`paid_out`;
`PendingEarnings()` supplies `pending`.

API-064 (`GET /me/earnings`) keeps `data` as the per-booking list and adds
`meta.balance = { available_centavos, in_transit_centavos, paid_out_centavos, pending_centavos }`.
`GET /me/earnings/ledger` returns the ledger entries newest-first, paginated.

---

## 8. Equations that do not exist yet

Listed here because `index.md` §0 gives this file the concern — an absent equation is still this
document's fact to record.

| Number | Why it is missing | Blocked on |
|---|---|---|
| **Platform net revenue per booking** | `platform_fee` is *gross*. Nothing anywhere models `platform_fee − gateway_fee − payout_fee`. The fee *inputs* are now recorded in §9; the equation is still unwritten | [ADR-0026](adr/ADR-0026-take-rate-10-percent.md), [ADR-0031](adr/ADR-0031-paymongo-gateway.md) |
| **Internship relevance sort** | `GET /internships?sort=relevance` ranks by Postgres full-text score; the weighting has never been written down | — |
| **Break-even session price** | Issue #25 estimates ₱156 for e-wallets and ₱415 for cards at a 10% take rate; these are pending confirmation in the PayMongo merchant agreement, and the final equation remains to be recorded | [ADR-0026](adr/ADR-0026-take-rate-10-percent.md) |

**The first row is the important one.** Every session in the current demo is priced ₱450 or ₱750.
Until net revenue has an equation and an owner, nobody can say whether either price is profitable.

## 9. Gateway fee inputs (PayMongo)

The rates below are issue #25 estimates carried forward and remain inputs to the missing
platform-net-revenue equation in §8. Confirm them in the PayMongo merchant agreement; no new rates
are introduced here.

| Input | Value | Note |
|---|---|---|
| **E-wallet transaction fee** | **2.80%** of `price`, VAT-inclusive | GCash, Maya, GrabPay. This VAT-inclusive figure needs confirmation in the PayMongo merchant agreement |
| **Card transaction fee** | **3.248%** of `price` **+ ₱16.80**, VAT-inclusive | The fixed component makes small card payments roughly break-even — the same shape ADR-0005 warned about |
| **Disbursement (payout) fee** | **₱11.20** per transfer | Motivates batched payouts (ADR-0013); the payout mechanism is issue #35 / ADR-0028 |

Every figure needs confirmation in the PayMongo merchant agreement before launch.

## References

- [`index.md`](index.md) §0 — ownership map
- [`prd.md`](prd.md) — `BR-007`, `BR-008`, `BR-009`, `BR-010`, `BR-011`
- [`erd.md`](https://github.com/iskolar-web3/vocation-server/blob/14d7d2db2d250323067e18f056216b9686b3ba04/docs/erd.md) — column types, `CHECK` constraints
- [`api-spec.md`](api-spec.md) — centavo wire format
- [ADR-0007](adr/ADR-0007-money-split-derived-by-subtraction.md) · [ADR-0012](adr/ADR-0012-session-delivery-model.md) · [ADR-0021](adr/ADR-0021-student-feature-slice-decisions.md) · [ADR-0022](adr/ADR-0022-ledger-foundation-schema.md)
