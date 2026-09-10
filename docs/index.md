<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# Documentation Index — iSkolar Vocation

**Maintained by:** Alexandre Nevero (PM)
**Last updated:** 2026-09-10
**FMD version:** 4.6.2

<!--
Read this FIRST. §0 says which single doc owns which fact. Built from the doc set actually
generated — no row exists here for a doc that does not exist.
-->

New to the project? Start with [`onboarding.md`](onboarding.md), then come back here.

**Scope:** v1 is **17 features**, not the charter's 25. Eight are marked `Deferred` in place —
[ADR-0010](adr/ADR-0010-mvp-cut-to-17-features.md). A struck-through row anywhere in these docs means
*designed, not built yet*.

## 0. Source-of-truth map (one fact, one home)

Each concern has **exactly one** canonical owner. Every other doc *links* to it and never restates
it. **When two docs disagree, the canonical owner wins** until the loser is reconciled.

The **Repo** column is the document's home under
[ADR-0011](adr/ADR-0011-spec-sync-per-repo-ownership.md). `web` documents live in `vocation-web`;
everything else lives in `vocation-server`, and four are mirrored read-only into `vocation-web`.

| Concern | Canonical owner | Repo | Note |
|---|---|---|---|
| **How big this build is, and what it is** — team, mode, time budget, the flags that select the doc set · vision · problem · segment · value proposition · the `F-###` origin | [`../VOCATION.md`](https://github.com/iskolar-web3/vocation-server/blob/main/VOCATION.md) | server | **The single root input.** Part A sizes the build; Part B is the seed brief. `idea.md` was folded in on 2026-09-08 ([ADR-0015](adr/ADR-0015-fold-idea-into-vocation.md)) — `idea.md §N` is now **§BN** |
| Decision *why* · pivots · names and immutable ids · assumptions · rejected approaches · changes to Locked docs (`CR-###`) | [`adr/`](adr/) | server · mirrored | **Combined decision home**: ADR changelog + decision ledger + change records in one folder. Append-only — supersede, never edit. Read newest first |
| What we build: features `F-###`, business rules `BR-###`, journeys `UJ-###`, acceptance criteria | [`prd.md`](prd.md) | server · mirrored | Owns the id spine. The workbook was the raw input; this is the home now |
| How it is built: components, data flow, technology choices, deployment topology, scaling | [`system-design.md`](https://github.com/iskolar-web3/vocation-server/blob/main/docs/system-design.md) | server | The charter's "System Design" **and** "System Architecture", collapsed |
| Entities · schema · constraints · indexes · privacy classification · retention | [`erd.md`](https://github.com/iskolar-web3/vocation-server/blob/main/docs/erd.md) | server | FMD's `data-model`, renamed. The charter's "System Model" |
| Screens `S-###` · information architecture · routes · access zones · responsive variants | [`sitemap.md`](https://github.com/iskolar-web3/vocation-web/blob/main/docs/sitemap.md) | **web** | Static half of ux-maps |
| Journeys `UF-###` · edge cases `EV-###` · instrumentation events | [`user-flow.md`](https://github.com/iskolar-web3/vocation-web/blob/main/docs/user-flow.md) | **web** | Dynamic half of ux-maps. The charter's "User Journey" |
| API contracts `API-###` · auth schemes · error codes · rate limits · versioning | [`api-spec.md`](api-spec.md) | server · mirrored | **The only coupling between the two repositories** |
| **Schedule** — milestone Gantt, sprint calendar, current sprint commitments, review responsibilities | [`implementation-plan.md`](https://github.com/iskolar-web3/vocation-server/blob/main/docs/implementation-plan.md) | server | Owns *when*. Live task state lives in **Shortcut**; Trello mirrors the five charter milestones. The `TASK-###` ledger was removed 2026-09-10 |
| Build-time agent roster | [`sad.md`](sad.md) | server · mirrored | Materialises to `.claude/agents/*.md` |
| How to get productive · which docs belong to whom · what is missing | [`onboarding.md`](onboarding.md) | server · mirrored | Points, never restates |
| Code conventions · definition of done · stack currency · which `BR-###` governs which code area | [`../AGENTS.md`](../AGENTS.md) | both | Root agent guide. The rules table is an **index**, not a copy — the PRD wins |

**The rule:** a fact lives in its canonical doc; everything else links to it. Do not restate.

### Deliberately absent

These are **not** owned by anything yet. Do not assume a fact in one of these areas has a home.

| Concern | Would be owned by | Status |
|---|---|---|
| Tests · cases · traceability `F-###` → test | `qa-test-plan.md` | **Not generated.** The eng review mapped **48 paths at 0% coverage**, and the workbook's per-criterion Passed/Failed tracker still has nowhere to live. Largest gap in the suite |
| Every computed number (equation + inputs) | `methods.md` | **Not generated.** `platform_fee`, `coach_payout`, `rating_avg` and `completeness_pct` all lack an equation home |
| Security · authz model · threat model · RA 10173 compliance | `security-compliance.md` | **Not generated.** Student resumes are sensitive personal information |
| Deploy · secrets · monitoring · incidents · backup | `ops.md` | **Not generated**, for a system that will hold payment records |
| UI tokens · components · visual states | `design-system.md` | **Not generated.** No named designer against charter M2 |

See [`onboarding.md`](onboarding.md) for who owes each one.

## 1. Document suite

| Document | File | Status | Last updated |
|---|---|---|---|
| Root input (context + brief) | [`../VOCATION.md`](https://github.com/iskolar-web3/vocation-server/blob/main/VOCATION.md) | Draft | 2026-09-08 |
| PRD | [`prd.md`](prd.md) | Draft | 2026-09-10 |
| System Design (HLD) | [`system-design.md`](https://github.com/iskolar-web3/vocation-server/blob/main/docs/system-design.md) | Draft | 2026-09-10 |
| ERD | [`erd.md`](https://github.com/iskolar-web3/vocation-server/blob/main/docs/erd.md) | Draft | 2026-09-08 |
| Sitemap | [`sitemap.md`](https://github.com/iskolar-web3/vocation-web/blob/main/docs/sitemap.md) | Draft | 2026-09-08 |
| User Flow | [`user-flow.md`](https://github.com/iskolar-web3/vocation-web/blob/main/docs/user-flow.md) | Draft | 2026-09-08 |
| API Spec | [`api-spec.md`](api-spec.md) | Draft | 2026-09-08 |
| Implementation Plan | [`implementation-plan.md`](https://github.com/iskolar-web3/vocation-server/blob/main/docs/implementation-plan.md) | Draft | 2026-09-10 |
| SAD (agent roster) | [`sad.md`](sad.md) | Draft | 2026-09-08 |
| Onboarding | [`onboarding.md`](onboarding.md) | Draft | 2026-09-08 |
| Decision Register | [`adr/README.md`](adr/README.md) | Draft | 2026-09-10 |
| Agent guide | [`../AGENTS.md`](../AGENTS.md) | Draft | 2026-09-10 |

**Every doc is `Draft`.** Nothing is Locked, so no `CR-###` is required to edit yet. Recommended
lock order: `prd` → `erd` → `api-spec` → `sitemap` → `user-flow` → `system-design`
([`adr/README.md`](adr/README.md) §4).

### Inputs (not generated, do not edit as docs)

| Input | Role |
|---|---|
| `../Vocation Project Charter.pdf` | Authoritative scope, stack, milestones, team. 6pp, dated 2026-09-05 |
| `../Vocation User Stories.xlsx` | 24 stories with acceptance criteria and a Passed/Failed tracker |
| `Vocation.pptx` (Google Drive) | **Superseded.** Describes a materially different product — AI matching, on-platform applications, Supabase + Azure. See [`adr/README.md`](adr/README.md) §3 |

## 2. Light health check (advisory)

- [ ] **Core features have tests or an explicit manual plan** — ✗ no `qa-test-plan`. 48 paths, 0%
      covered, four of them silent money failures.
- [x] No doc restates a fact owned by another (§0 respected). The `BR-###` triplication in
      `AGENTS.md` and `sad.md` was collapsed to citations on 2026-09-08.
- [ ] **Network-exposed surfaces declare auth/authz** — partial. `api-spec.md` and `sitemap.md` §5
      name the schemes and enforcement points, but no `security-compliance` doc owns the threat model
      or the RA 10173 position.
- [ ] **Displayed numbers cite equations** — ✗ no `methods.md`. The commission split is money and has
      no equation home, though [ADR-0007](adr/ADR-0007-money-split-derived-by-subtraction.md) now
      pins the derivation.
- [x] Every `S-###` serves an `F-###`; every `UF-###` step cites an existing `S-###`; every
      `API-###` names the `F-###` it serves. Deferred rows are marked, not orphaned.
- [ ] **`openapi.yaml` exists** — ✗. Two repositories are coupled by prose alone until TASK-011.
- [ ] **Three ADRs are `Proposed` and block waves** — ADR-0012 (Wave 3), ADR-0013 (Wave 4), and
      ADR-0005 (parked by the owner, Wave 4).

## 3. Decision changelog

**Read [`adr/`](adr/) first for decision history.** Newest Accepted ADR wins over stale narrative
elsewhere until that narrative is reconciled. Do not reconstruct a decision from chat memory.

| ADR | Title | Status |
|---|---|---|
| [ADR-0001](adr/ADR-0001-backend-language-go.md) | Go for the server API, against the charter's own prose | **Accepted, provisional** |
| [ADR-0002](adr/ADR-0002-two-repo-split.md) | Two repositories, API spec as the only seam | Accepted *(amended by 0011)* |
| [ADR-0003](adr/ADR-0003-aws-postgres-not-supabase.md) | AWS + self-managed PostgreSQL | Accepted *(DB host superseded by 0016)* |
| [ADR-0004](adr/ADR-0004-modular-monolith.md) | Modular monolith rather than services | Accepted |
| [ADR-0005](adr/ADR-0005-paymongo-and-take-rate.md) | PayMongo, and the 5% take-rate exposure | **Proposed — parked by owner** |
| [ADR-0006](adr/ADR-0006-store-no-applications.md) | Store no applications; apply by redirect | Accepted |
| [ADR-0007](adr/ADR-0007-money-split-derived-by-subtraction.md) | Money split derived by subtraction; `take_rate` stored | Accepted |
| [ADR-0008](adr/ADR-0008-booking-before-intent.md) | Booking written before the PayMongo intent; orphan sweeper | Accepted |
| [ADR-0009](adr/ADR-0009-webhook-alert-slot-fk-coach-deletion.md) | Webhook alerting, slot integrity, coach-deletion retention | Accepted |
| [ADR-0010](adr/ADR-0010-mvp-cut-to-17-features.md) | MVP cut to 17 features; 8 deferred | Accepted |
| [ADR-0011](adr/ADR-0011-spec-sync-per-repo-ownership.md) | Spec sync: separate specs per repo, single ownership | Accepted |
| [ADR-0012](adr/ADR-0012-session-delivery-model.md) | Session delivery, cancellation, reschedule | **Proposed — blocks Wave 3** |
| [ADR-0013](adr/ADR-0013-payout-ledger-and-payment-states.md) | Payout ledger, held balance, `payment_status` failure states | **Proposed — blocks Wave 4** |
| [ADR-0014](adr/ADR-0014-cost-model-and-nfrs.md) | Fixed-cost model and non-functional requirements | **Proposed** |
| [ADR-0015](adr/ADR-0015-fold-idea-into-vocation.md) | `idea.md` folded into `VOCATION.md` | Accepted |
| [ADR-0016](adr/ADR-0016-neon-postgres-not-rds.md) | Managed Postgres on Neon, not self-managed AWS RDS | Accepted |
| [ADR-0018](adr/ADR-0018-response-envelope.md) | Response envelope: `{ message, data, meta }` | Accepted |

The decision ledger (names, immutable ids, assumptions, pivots, rejected approaches) and the
change-record log live in the same folder: [`adr/README.md`](adr/README.md) §1–§6.

## 4. The five things most likely to hurt

From [`adr/README.md`](adr/README.md) §6, ranked by consequence:

1. **A coaching session has no delivery mechanism.** `booking.join_url` is produced by nothing and
   `booking_status = cancelled` is set by nothing, so a confirmed booking cannot be attended or
   cancelled. [ADR-0012](adr/ADR-0012-session-delivery-model.md) blocks Wave 3.
2. **Payouts force a ledger the ERD lacks, and refunds are unrepresentable.** PayMongo has no
   Connect equivalent, so payouts are manual and must be batched.
   [ADR-0013](adr/ADR-0013-payout-ledger-and-payment-states.md) blocks Wave 4.
3. **PayMongo merchant onboarding is unowned and has weeks of external lead time**, and it requires
   the S-014–S-017 policy pages to be live. `implementation-plan.md` TASK-080.
4. **Fixed cost may exceed plausible revenue for a long time** — roughly ₱6,000–7,500/month against
   ₱12.50 net per ₱500 e-wallet booking. [ADR-0014](adr/ADR-0014-cost-model-and-nfrs.md).
5. **No designer and no QA**, and with two agent-assisted developers **review throughput is now the
   binding constraint**, not dev-days. `VOCATION.md` Q4; `implementation-plan.md`.
