<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0005 — PayMongo, and the 5% take-rate exposure

- **Date:** 2026-09-07
- **Status:** **Superseded by ADR-0026 (take rate) and ADR-0027 (gateway)**

## Context

Charter §I sets the revenue model: paid coaching sessions collect through **PayMongo**, the
platform retains a **5% commission** (described as Fiverr-style), and the coach receives **95%**.
The workbook confirms it (BR-008: `coach_payout` is 95% **of price**) and lists the methods: card,
GCash, Maya, GrabPay. PayMongo is the only gateway named, and it is the right category of choice
for the Philippine market — local e-wallets matter here and Stripe does not offer them.

The problem is arithmetic. Because the coach receives 95% *of price*, the platform's entire 5%
must absorb the gateway fee.

Published PayMongo rates: **cards ≈ 3.5% + ₱15** per successful transaction (some sources quote
3% + ₱15); **e-wallets ≈ 2.5%** with no fixed component.

Platform net on a card payment for a session priced `P`:

```
0.05P - (0.035P + 15) = 0.015P - 15    →  negative below P ≈ ₱1,000
                                          (≈ ₱750 at the 3% + ₱15 rate)
```

| Session price | Platform 5% | Card fee | **Net (card)** | E-wallet fee | **Net (e-wallet)** |
|---|---|---|---|---|---|
| ₱300 | ₱15.00 | ₱25.50 | **−₱10.50** | ₱7.50 | +₱7.50 |
| ₱500 | ₱25.00 | ₱32.50 | **−₱7.50** | ₱12.50 | +₱12.50 |
| ₱1,000 | ₱50.00 | ₱50.00 | **₱0.00** | ₱25.00 | +₱25.00 |
| ₱2,000 | ₱100.00 | ₱85.00 | +₱15.00 | ₱50.00 | +₱50.00 |

Student coaching sessions are likely to be priced well under ₱1,000. If students pay by card, the
platform loses money on every booking, before AWS or moderation cost. E-wallets are
margin-positive at every price because there is no fixed fee.

The comparison to Fiverr does not hold: Fiverr's take is ~20%, four times this one.

## Options considered

1. **Keep 5% of price and absorb the fee** — pros: matches the charter and the workbook exactly;
   simplest to explain to coaches. Cons: structurally loss-making on small card payments.
2. **Raise the take rate** — pros: fixes the margin. Cons: contradicts a charter commitment;
   coaches may have been told 95%.
3. **Pass the gateway fee to the payer** — the student pays `price + fee`, the coach still gets 95%
   of price, the platform keeps a clean 5%. Pros: preserves both charter numbers; standard
   marketplace practice. Cons: a visible surcharge at checkout, which suppresses conversion on the
   one event the business depends on.
4. **Set a minimum session price** (≈₱1,000) — pros: makes every booking margin-positive. Cons:
   prices out exactly the students the product exists for.
5. **Steer to e-wallets** — default to GCash/Maya/GrabPay, de-emphasise or drop cards. Pros: 2.5%
   with no fixed fee is always positive against a 5% take, and e-wallets are how this market
   already pays. Cons: excludes card-only payers.

## Decision

**Not yet made. This ADR is Proposed and blocks build.**

The working recommendation is **5 combined with 3**: make an e-wallet the default and most
prominent method, and if cards are offered, pass the card fee difference to the payer rather than
absorbing it. That keeps the charter's 5%/95% promise to coaches intact while removing the
loss-making case.

## Consequences

- **If option 1 stands unchanged:** every card-paid session under ~₱1,000 is a loss. At volume
  that is worse, not better — the classic negative-unit-economics failure. `VOCATION.md` §B9 already
  names this a kill criterion.
- **Whatever is chosen:** the take rate should be a **stored column** on `booking`, not a
  hard-coded `CHECK (platform_fee = ROUND(price * 0.05, 2))` (`erd.md` Q6), or a future rate change
  invalidates every historical row.
- **Owed before build:**
  1. **Confirm the actual rates in a live PayMongo agreement.** Every figure above is a published
     list price, and volume pricing exists.
  2. Decide the option and record it as an amendment to this ADR.
  3. Resolve the payout mechanism (PRD Q10) — `coach_payout` is recorded but nothing says how a
     coach receives money. PayMongo's own payout fees then apply on top of everything above.
  4. Resolve chargeback-after-payout (PRD Q7, EV-010). A chargeback on money already sent to a
     coach is a direct loss with no defined recovery path.
