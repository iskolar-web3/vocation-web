<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# Documentation Index — iSkolar Vocation

**Maintained by:** Alexandre Nevero (PM)
**Last updated:** 2026-10-01
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
| **Machine-readable API contract** — paths, fields, enums, request/response types | [`openapi.yaml`](openapi.yaml) | server · mirrored | OpenAPI 3.0.3. The type half of the contract; `api-spec.md` is the narrative half. Validated in CI by `internal/platform/apicontract/openapi_test.go`; `vocation-web` generates its types from it |
| **Schedule** — milestone Gantt, sprint calendar, current sprint commitments, review responsibilities | [`implementation-plan.md`](https://github.com/iskolar-web3/vocation-server/blob/main/docs/implementation-plan.md) | server | Owns *when*. Live task state lives in **GitHub Issues + the `Vocation Delivery` Project** (re-homed 2026-09-21; Trello and Shortcut retired for this project). The `TASK-###` ledger was removed 2026-09-10 |
| Build-time agent roster | [`sad.md`](sad.md) | server · mirrored | Materialises to `.claude/agents/*.md` |
| How to get productive · which docs belong to whom · what is missing | [`onboarding.md`](onboarding.md) | server · mirrored | Points, never restates |
| Code conventions · definition of done · stack currency · which `BR-###` governs which code area | [`../AGENTS.md`](../AGENTS.md) | both | Root agent guide. The rules table is an **index**, not a copy — the PRD wins |
| Every computed number — equation, inputs, rounding | [`methods.md`](methods.md) | server · mirrored | `platform_fee`, `coach_payout`, `rating_avg`, `completeness_pct`, refund and completion windows. Also records the equations that **do not exist yet** |
| Deploy · secrets · migrations · workers · monitoring · incidents · backup | [`ops.md`](https://github.com/iskolar-web3/vocation-server/blob/main/docs/ops.md) | server | Operating the system. Deployment *topology* stays in `system-design.md` |
| Tests · cases · traceability `F-###` → test · the per-release Passed/Failed tracker | [`qa-test-plan.md`](qa-test-plan.md) | server | Generated 2026-10-01. Owns the 55-path register (47 non-deferred `API-###` operations from 44 identifiers, + EV-004/005/010 and the ₱499.90 case, + 4 manual/E2E paths), how to run each level, the money checklist, and the workbook tracker |

**The rule:** a fact lives in its canonical doc; everything else links to it. Do not restate.

### Deliberately absent

These are **not** owned by anything yet. Do not assume a fact in one of these areas has a home.

| Concern | Would be owned by | Status |
|---|---|---|
| Security · authz model · threat model · RA 10173 compliance | `security-compliance.md` | **Not generated.** Student resumes are sensitive personal information |
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
| OpenAPI contract | [`openapi.yaml`](openapi.yaml) | Draft | 2026-10-01 |
| Implementation Plan | [`implementation-plan.md`](https://github.com/iskolar-web3/vocation-server/blob/main/docs/implementation-plan.md) | Draft | 2026-09-10 |
| SAD (agent roster) | [`sad.md`](sad.md) | Draft | 2026-09-08 |
| Onboarding | [`onboarding.md`](onboarding.md) | Draft | 2026-09-08 |
| Methods (equations) | [`methods.md`](methods.md) | Draft | 2026-09-21 |
| Ops | [`ops.md`](https://github.com/iskolar-web3/vocation-server/blob/main/docs/ops.md) | Draft | 2026-10-01 |
| QA Test Plan | [`qa-test-plan.md`](qa-test-plan.md) | Draft | 2026-10-01 |
| Decision Register | [`adr/README.md`](adr/README.md) | Draft | 2026-10-01 |
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

- [ ] **Core features have tests or an explicit manual plan** — partial.
      [`qa-test-plan.md`](qa-test-plan.md) owns the 55-path register: **37 Automated, 8 Partial,
      6 Not covered, 4 Manual**, of which CI run `36822948065` (2026-10-01) passed every
      automated path; the four silent-failure cases — EV-004, EV-006, EV-010, ₱499.90 — are
      flagged, not closed, and the 4 manual/E2E and 6 uncovered paths are unrun.
- [x] No doc restates a fact owned by another (§0 respected). The `BR-###` triplication in
      `AGENTS.md` and `sad.md` was collapsed to citations on 2026-09-08.
- [ ] **Network-exposed surfaces declare auth/authz** — partial. `api-spec.md` and `sitemap.md` §5
      name the schemes and enforcement points, but no `security-compliance` doc owns the threat model
      or the RA 10173 position.
- [x] **Displayed numbers cite equations** — [`methods.md`](methods.md) owns `platform_fee`,
      `coach_payout`, `rating_avg`, `completeness_pct` and the refund/completion windows. Platform
      *net* revenue per booking still needs an equation and owner.
- [x] Every `S-###` serves an `F-###`; every `UF-###` step cites an existing `S-###`; every
      `API-###` names the `F-###` it serves. Deferred rows are marked, not orphaned.
- [x] **`openapi.yaml` exists** — [`openapi.yaml`](openapi.yaml) is the machine-readable contract,
      validated in CI. `vocation-web` still owes the type-generation step (CR-004).
- [ ] **One ADR is `Proposed` and blocks a wave** — ADR-0012 (Wave 3). ADR-0013's ledger/mechanism
      parts are resolved by ADR-0028; its BSP/AMLA held-balance question is still owed.

## 3. Decision changelog

**Read [`adr/`](adr/) first for decision history.** Newest Accepted ADR wins over stale narrative
elsewhere until that narrative is reconciled. Do not reconstruct a decision from chat memory.

| ADR | Title | Status |
|---|---|---|
| [ADR-0001](adr/ADR-0001-backend-language-go.md) | Go for the server API, against the charter's own prose | **Accepted, provisional** |
| [ADR-0002](adr/ADR-0002-two-repo-split.md) | Two repositories, API spec as the only seam | Accepted *(amended by 0011)* |
| [ADR-0003](adr/ADR-0003-aws-postgres-not-supabase.md) | AWS + self-managed PostgreSQL | Accepted *(DB host superseded by 0016; hosting by 0036)* |
| [ADR-0004](adr/ADR-0004-modular-monolith.md) | Modular monolith rather than services | Accepted |
| [ADR-0005](adr/ADR-0005-paymongo-and-take-rate.md) | PayMongo, and the 5% take-rate exposure | Superseded by ADR-0026 (take rate) and ADR-0031 (gateway) |
| [ADR-0006](adr/ADR-0006-store-no-applications.md) | Store no applications; apply by redirect | Accepted |
| [ADR-0007](adr/ADR-0007-money-split-derived-by-subtraction.md) | Money split derived by subtraction; `take_rate` stored | Accepted |
| [ADR-0008](adr/ADR-0008-booking-before-intent.md) | Booking written before checkout; 24 h checkout expiry | Accepted |
| [ADR-0009](adr/ADR-0009-webhook-alert-slot-fk-coach-deletion.md) | Webhook alerting, slot integrity, coach-deletion retention | Accepted |
| [ADR-0010](adr/ADR-0010-mvp-cut-to-17-features.md) | MVP cut to 17 features; 8 deferred | Accepted |
| [ADR-0011](adr/ADR-0011-spec-sync-per-repo-ownership.md) | Spec sync: separate specs per repo, single ownership | Accepted |
| [ADR-0012](adr/ADR-0012-session-delivery-model.md) | Session delivery, cancellation, reschedule | **Proposed — blocks Wave 3** |
| [ADR-0013](adr/ADR-0013-payout-ledger-and-payment-states.md) | Payout ledger, held balance, `payment_status` failure states | **Proposed** *(ledger + mechanism resolved by 0028; BSP/AMLA owed)* |
| [ADR-0014](adr/ADR-0014-cost-model-and-nfrs.md) | Fixed-cost model and non-functional requirements | **Proposed** |
| [ADR-0015](adr/ADR-0015-fold-idea-into-vocation.md) | `idea.md` folded into `VOCATION.md` | Accepted |
| [ADR-0016](adr/ADR-0016-neon-postgres-not-rds.md) | Managed Postgres on Neon, not self-managed AWS RDS | Accepted |
| [ADR-0017](adr/ADR-0017-jia-ingestion-pull-and-store.md) | Jia ingestion: pull-and-store, not live proxy | Accepted |
| [ADR-0018](adr/ADR-0018-response-envelope.md) | Response envelope: `{ message, data, meta }` | Accepted |
| [ADR-0019](adr/ADR-0019-defer-company-owner-fk.md) | `company.owner_account_id`: nullable, no FK, until `iam` lands | Accepted |
| [ADR-0020](adr/ADR-0020-sprint1-schema-additions.md) | Sprint 1 schema additions: `session`, deferred `review.booking_id`, coach timestamps | Accepted |
| [ADR-0021](adr/ADR-0021-student-feature-slice-decisions.md) | Student slice: `skills` column, `completeness_pct` equation, notification topic names, upload caps, no new AWS SDK dependency | Accepted |
| [ADR-0022](adr/ADR-0022-ledger-foundation-schema.md) | Ledger foundation schema (`ledger_entry`, `payout_batch`) — adopts ADR-0013 Option 1's shape only, not its blocked decision | Accepted |
| [ADR-0023](adr/ADR-0023-cors-web-origin.md) | CORS for the web origin, cookie auth, same-site domain topology | Accepted |
| [ADR-0024](adr/ADR-0024-checkout-reservation-pending-booking.md) | Checkout reservation is the pending booking row (erd Q3) | Accepted |
| [ADR-0025](adr/ADR-0025-account-deletion-anonymisation.md) | Account deletion and retained-record anonymisation | Accepted |
| [ADR-0026](adr/ADR-0026-take-rate-10-percent.md) | 10% coaching take rate | Accepted |
| [ADR-0031](adr/ADR-0031-paymongo-gateway.md) | PayMongo as the payment gateway (supersedes ADR-0005's gateway part) | Accepted |
| [ADR-0028](adr/ADR-0028-payouts-and-disbursement.md) | Coach payouts and batched disbursement (ADR-0013 ledger/mechanism) | Accepted |
| [ADR-0029](adr/ADR-0029-deploy-pipeline-and-migrations.md) | Deploy pipeline and migrations: Terraform + GitHub Actions OIDC, migrate as a one-off task, `ALERT` metric filter | Superseded by ADR-0036 |
| [ADR-0030](adr/ADR-0030-account-full-name-at-signup.md) | Optional `account.full_name` captured at signup | Accepted |
| [ADR-0032](adr/ADR-0032-observability-sentry-request-logs.md) | Observability: Sentry for errors, one log line per request, DB-aware health check | Accepted |
| [ADR-0036](adr/ADR-0036-railway-vercel-deploy.md) | Deploy on Railway + Vercel (Resend, Sentry); supersedes ADR-0029 and hosting in ADR-0003 | Accepted |

The decision ledger (names, immutable ids, assumptions, pivots, rejected approaches) and the
change-record log live in the same folder: [`adr/README.md`](adr/README.md) §1–§6.

## 4. The five things most likely to hurt

From [`adr/README.md`](adr/README.md) §6, ranked by consequence:

1. **A coaching session has no delivery mechanism.** `booking.join_url` is produced by nothing and
   `booking_status = cancelled` is set by nothing, so a confirmed booking cannot be attended or
   cancelled. [ADR-0012](adr/ADR-0012-session-delivery-model.md) blocks Wave 3.
2. **Coach payouts landed, but the held-balance question is counsel's.** The ledger is written,
   API-064 reads a real balance, and manual disbursements remain until PayMongo Transfers lands
   ([ADR-0028](adr/ADR-0028-payouts-and-disbursement.md)). [ADR-0013](adr/ADR-0013-payout-ledger-and-payment-states.md)
   still owes the **BSP/AMLA position on holding coach balances** before launch.
3. **PayMongo live activation is unowned and has weeks of external lead time** — it needs a DTI/SEC
   entity, KYC, and the S-014–S-017 policy pages live. `implementation-plan.md` TASK-080;
4. **Fixed cost may exceed plausible revenue for a long time** — roughly ₱6,000–7,500/month against
   ₱12.50 net per ₱500 e-wallet booking. [ADR-0014](adr/ADR-0014-cost-model-and-nfrs.md).
5. **No designer and no QA**, and with two agent-assisted developers **review throughput is now the
   binding constraint**, not dev-days. `VOCATION.md` Q4; `implementation-plan.md`.
