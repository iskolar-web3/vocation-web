<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0010 — MVP cut to 17 features; 8 deferred

- **Date:** 2026-09-08
- **Status:** Accepted

## Context

The charter defines 25 features across four modules, which the spec suite expanded into 47 API
contracts and 30 screens. Charter §IV names **one** Full Stack Developer (`jemslzr`). The other four
roles are a Project Lead, a PM, a Security Engineer and a Penetration Tester — two of whom carry
review duties and no build capacity. No designer and no QA role exists, against a full Design
milestone (M2) and a JMeter/Vitest/Manual Testing milestone (M4).

`VOCATION.md` §B9 names the single riskiest assumption: that Filipino students will pay a
Philippine-market price for a coaching session. The entire revenue model is a 5% take on that
transaction.

## Options considered

1. **Cut to the features that test the thesis (17).** Defer employer self-serve, coach verification,
   and programs. Pros: the paid-coaching funnel ships months earlier; removes the government-ID
   upload path and with it the largest RA 10173 exposure before it exists. Cons: needs this ADR
   against charter §II scope, and admin must enter listings manually at launch.
2. **Proceed with all 25.** Pros: full charter fidelity; employers self-serve from day one. Cons: one
   developer against 47 endpoints and 30 screens, and the only thesis test lands last.
3. **Cut harder, to ~12.** Also defer saves, reviews and the student dashboard. Cons: without reviews
   there is no coach quality signal at all, and without saves the directory has no reason to hold an
   account — removing the main registration trigger.

## Decision

**Option 1.** v1 is **17 features**. Deferred, and marked `Deferred` in place across the specs rather
than deleted:

| Deferred | Why it does not test the thesis |
|---|---|
| F-030, F-031, F-032, F-033 — employer self-serve | A directory needs listings, not an employer signup funnel. Admin enters them at launch |
| F-043, F-051, F-052 — coach and company verification | A trust badge is theatre until there are enough coaches to rank, and it makes the platform custodian of government IDs |
| F-012 — programs / cohorts | A second product |

F-050 changes purpose: admin moderation existed to review employer submissions, so with employer
self-serve deferred it becomes **admin listing CRUD**. Without that, nothing can create a posting at
all — and F-001 requires featured items from live data, not fixtures.

## Consequences

- **Easier:** the student-pays-coach funnel is reachable in roughly half the build. The
  government-ID retention question disappears from v1 entirely.
- **Harder:** admin manually enters listings, which is recurring operational work with no named
  owner. Link health for `external_apply_url` also becomes iSkolar's duty rather than the employer's,
  changing EV-002.
- **Owed:** `prd.md`, `sitemap.md`, `user-flow.md`, `api-spec.md`, `erd.md` and `index.md` all mark
  the deferred ids; admin listing CRUD and admin bootstrap become explicit tasks.
