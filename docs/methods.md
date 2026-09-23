<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# Methods — every computed number and its equation

**Maintained by:** Alexandre Nevero (PM)
**Last updated:** 2026-09-21

<!--
Canonical owner of **every computed number**: its equation, its inputs, its rounding, and where it
is evaluated. `index.md` §0 gives this file that concern. Nothing else in the suite may restate an
equation — link here instead.

Rule for adding a row: a number belongs here the moment it is *displayed* or *stored derived*. If
you cannot write its equation, it does not ship.
-->

Per [`index.md`](index.md) §0 this document owns one concern: **the equation behind any number the
system computes, stores derived, or displays.** Business rules (`BR-###`) live in
[`prd.md`](prd.md); columns and types live in [`erd.md`](https://github.com/iskolar-web3/vocation-server/blob/main/docs/erd.md); wire formats live in
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
| `take_rate` | `booking.take_rate`, `numeric(5,4)`, captured at creation | **Stored per booking, never read live.** `payments.DefaultTakeRate = "0.0500"` supplies today's value |

**Evaluated:** `payments.Split()` at booking creation.
**Re-checked:** `CONSTRAINT booking_platform_fee_matches_rate CHECK (platform_fee = ROUND(price * take_rate, 2))`.

## 2. Coach payout — `booking.coach_payout`

Owned by **BR-008** / [ADR-0007](adr/ADR-0007-money-split-derived-by-subtraction.md).

```
coach_payout = price − platform_fee
```

**Derived by subtraction. Never computed independently as `0.95 × price`.**

Rounding both halves independently makes some prices unrepresentable. At `price = 499.90`:

| Method | Platform | Coach | Sum |
|---|---|---|---|
| Both rounded independently | `ROUND(499.90 × 0.05)` = 25.00 | `ROUND(499.90 × 0.95)` = 474.91 | **499.91 ✗** |
| Subtraction (this rule) | 25.00 | 474.90 | **499.90 ✓** |

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

## 4. Completion eligibility and auto-completion

Owned by [ADR-0012](adr/ADR-0012-session-delivery-model.md).

```
can_complete    = now ≥ slot_ends_at
auto_completes  = status = 'confirmed' AND now ≥ slot_ends_at + 24h
```

**Evaluated:** `coaching.CanComplete()` for the manual path (API-047); the auto-complete worker
polls on a 10-minute ticker (see [`ops.md`](https://github.com/iskolar-web3/vocation-server/blob/main/docs/ops.md) §4).

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

## 7. Coach earnings — API-064

```
per booking:  price_centavos, platform_fee_centavos, coach_payout_centavos, payment_status
```

API-064 returns **one row per booking**, newest first, with no aggregate and no balance. It reads
the `booking` table directly.

> **Known gap.** This is a *list of what was earned*, not *a balance owed*. It counts every
> booking regardless of `payment_status`, so a `pending` or `failed` booking appears alongside a
> `paid` one. The `ledger_entry` and `payout_batch` tables exist (migration `000013`,
> [ADR-0022](adr/ADR-0022-ledger-foundation-schema.md)) but **nothing writes to them yet**, so
> there is no balance to read. This is `api-spec.md` Q9 and `erd.md` Q9, both still open.

---

## 8. Equations that do not exist yet

Listed here because `index.md` §0 gives this file the concern — an absent equation is still this
document's fact to record.

| Number | Why it is missing | Blocked on |
|---|---|---|
| **Platform net revenue per booking** | `platform_fee` is *gross*. Nothing anywhere models `platform_fee − gateway_fee − payout_fee`, so no code or document knows whether a booking makes money | [ADR-0005](adr/ADR-0005-paymongo-and-take-rate.md), still `Proposed` |
| **Coach balance owed** | Requires the ledger to be written. See §7 | `api-spec.md` Q9 |
| **Internship relevance sort** | `GET /internships?sort=relevance` ranks by Postgres full-text score; the weighting has never been written down | — |
| **Break-even session price** | Depends on the gateway fee schedule, which changes with the gateway | [ADR-0005](adr/ADR-0005-paymongo-and-take-rate.md) |

**The first row is the important one.** Every session in the current demo is priced ₱450 or ₱750.
Until net revenue has an equation and an owner, nobody can say whether either price is profitable.

## References

- [`index.md`](index.md) §0 — ownership map
- [`prd.md`](prd.md) — `BR-007`, `BR-008`, `BR-009`, `BR-010`, `BR-011`
- [`erd.md`](https://github.com/iskolar-web3/vocation-server/blob/main/docs/erd.md) — column types, `CHECK` constraints
- [`api-spec.md`](api-spec.md) — centavo wire format
- [ADR-0007](adr/ADR-0007-money-split-derived-by-subtraction.md) · [ADR-0012](adr/ADR-0012-session-delivery-model.md) · [ADR-0021](adr/ADR-0021-student-feature-slice-decisions.md) · [ADR-0022](adr/ADR-0022-ledger-foundation-schema.md)
