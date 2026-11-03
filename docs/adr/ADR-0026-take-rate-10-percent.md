<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0026 — 10% coaching take rate

- **Date:** 2026-10-01
- **Status:** **Accepted**
- **Supersedes:** the 5% take-rate decision in [ADR-0005](ADR-0005-paymongo-and-take-rate.md); the gateway decision is recorded separately in ADR-0027

## Context

Issue #25 compared Xendit's VAT-inclusive transaction costs against the coaching commission.
Its schedule gives e-wallets a **2.80%** fee, cards **3.248% + ₱16.80**, and payout transfers
**₱11.20**. At a 10% commission, the resulting estimated break-even session prices are **₱156
for e-wallets** and **₱415 for cards**. The project owner approved the 10% take rate together with
the Xendit gateway on 2026-10-01.

The original 5% commission and 95% coach share in charter §I and workbook rule BR-008 do not match
this decision. The charter is an immutable input to this repository and needs a separate correction
by the PM. The canonical business rule is updated here through the PRD.

## Decision

Set the default take rate for new paid bookings to **10% (`0.1000`)**. Capture that rate on each
booking. Compute `platform_fee = ROUND(price × take_rate, 2)` and derive
`coach_payout = price − platform_fee`, following ADR-0007. Do not recompute historical booking
amounts: each existing row retains its captured rate and split.

## Consequences

- Coaches receive the booking price less the 10% platform fee (approximately 90%, subject to the
  centavo rounding rule in ADR-0007).
- Existing bookings and the database CHECK constraints remain unchanged; `numeric(5,4)` represents
  `0.1000`.
- `vocation-web` must replace its hardcoded `0.05` and display the server's split.
- Coaches onboarding copy must be updated to explain the 10% commission / approximate 90% share.
- The charter's §I commission statement requires a separate PM correction.
- The Xendit rate schedule and break-even figures are estimates from issue #25; confirm the signed
  merchant agreement before launch.
