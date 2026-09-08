<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0007 — Money split derived by subtraction; `take_rate` stored per booking

- **Date:** 2026-09-08
- **Status:** Accepted
- **Supersedes:** the constraint pair originally specified in `erd.md` §Constraints

## Context

`erd.md` specified two constraints on `booking`, both justified by BR-008:

```
CHECK (platform_fee + coach_payout = price)
CHECK (platform_fee = ROUND(price * 0.05, 2))
```

They are mutually unsatisfiable. Postgres `round(numeric, 2)` rounds half away from zero, so when
`coach_payout` is computed independently as 95% of price, the two halves can round apart:

| Price | `platform_fee` = ROUND(price × 0.05, 2) | 95% of price | Sum |
|---|---|---|---|
| ₱499.90 | 25.00 | 474.91 | **499.91 ≠ 499.90** |
| ₱10.10 | 0.51 | 9.60 | **10.11 ≠ 10.10** |

Any price whose 5% lands on a half-centavo boundary cannot be inserted. ₱499.90 is a realistic
session price, so this fails on real input, not a contrived edge case.

Separately, `erd.md` Q6 asked whether the 5% rate should be a stored column. The two questions have
one answer.

## Options considered

1. **Derive the payout by subtraction, store the rate.** `platform_fee = ROUND(price × take_rate, 2)`
   then `coach_payout = price − platform_fee`. Pros: the sum equals price by construction for every
   possible input, so the invariant cannot be violated; storing `take_rate` per booking closes Q6 and
   leaves ADR-0005 reopenable without a migration. Cons: the coach's share is "price minus 5%
   rounded" rather than literally 95%, so on some prices they receive a centavo more or less than an
   exact 95%.
2. **Drop the 5% CHECK, keep sum-to-price.** Pros: smallest change. Cons: the rate is then enforced
   only in application code, with no database backstop on the money path; Q6 stays open.
3. **Store money as integer centavos.** Pros: no decimal rounding at the storage layer, and matches
   the `price_centavos` wire format. Cons: does not fix the contradiction on its own — 5% of 49990
   centavos is still 2499.5, so a rounding rule and derivation-by-subtraction are still required. It
   is option 1 plus a schema change.

## Decision

**Option 1.** Add `booking.take_rate numeric(5,4) NOT NULL` captured at booking time. Compute
`platform_fee = ROUND(price × take_rate, 2)`, then `coach_payout = price − platform_fee`. Keep
`CHECK (platform_fee + coach_payout = price)`. Replace the 5% CHECK with
`CHECK (platform_fee = ROUND(price * take_rate, 2))`.

Never compute the coach's 95% independently. There is one rounding operation and one subtraction.

## Consequences

- **Easier:** the sum-to-price invariant is structurally unbreakable. A rate change is a new value in
  a column, not a migration, so ADR-0005 can be revisited without touching historical rows.
- **Harder:** the coach's share is defined as a residual, not a percentage. One line is owed in the
  coach-facing terms saying so.
- **Owed:** `erd.md` §booking and §Constraints, `api-spec.md` API-041, and `erd.md` Q6 all update.
  The Wave 4 gate must assert that a ₱499.90 booking inserts cleanly.
