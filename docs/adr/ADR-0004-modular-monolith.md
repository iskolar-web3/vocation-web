<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0004 — Modular monolith rather than services

- **Date:** 2026-09-07
- **Status:** Accepted

## Context

The charter defines four modules (Internships, Coaching, Student Account, Employer) plus admin and
coach surfaces — six logical areas, 25 features. Charter §IV names **one** Full Stack Developer.

## Options considered

1. **Modular monolith** — one Go service, one deployable, internal package boundaries per module.
   Pros: one thing to deploy, test and debug; no network failure modes between modules; a booking
   and its payment row commit in one database transaction. Cons: all modules scale together;
   boundaries erode without discipline.
2. **Service per module** — pros: independent scaling and deploys. Cons: six deployables, six
   pipelines, distributed transactions across booking and payment, and local development requiring
   the whole set running — for one developer.
3. **Two services, split read/write** — pros: the read-heavy directory scales separately from
   bookings. Cons: premature; no load figures exist anywhere to justify it.

## Decision

**Option 1.** One Go binary with enforced module boundaries: `iam`, `internships`, `coaching`,
`payments`, `employer`, `admin`. Cross-module access goes through each module's exported interface,
never directly into another's data access layer, so extraction stays possible later.

## Consequences

- **Easier:** the paid-booking flow — write the booking, compute the split, create the intent —
  is one transaction plus one external call, not a saga. For money, that is decisive.
- **Harder:** a deploy ships everything. The directory and the payment handler share a blast
  radius, so the deploy gate has to cover both.
- **Owed:** enforce the boundary mechanically, not by convention — Go's `internal/` packages plus
  an import-lint rule in CI. Without enforcement, this becomes an unstructured monolith in about
  three months.
