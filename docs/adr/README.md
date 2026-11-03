<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# Decision Register — iSkolar Vocation

**Maintained by:** Alexandre Nevero (PM)
**Last reconciled:** 2026-10-01
**FMD version:** 4.6.2

> **This one folder is the whole decision home.** By owner decision, FMD's three separate decision
> artifacts are combined here:
>
> | FMD doc | Lives here as |
> |---|---|
> | `adr/` — decision changelog | The `ADR-####-*.md` files |
> | `decision-ledger` — names, assumptions, pivots, rejected approaches | §1, §2, §3, §5 below |
> | `change-record` — CR-### log for changes to Locked docs | §4 below |
>
> **Append-only. Never edit a past entry — supersede it.** Newest Accepted ADR wins over stale
> narrative anywhere else until that narrative is reconciled.

## How the team uses this

**Read this folder before changing a recorded choice.** Chat memory is not a record.

- Making a real product, architecture, or plan decision? **Append an ADR.** Copy
  `fmd/templates/adr.md`'s shape: Date, Status, Context, Options considered, Decision,
  Consequences. Number it next in sequence. Then add one line to §3.
- Changing a doc that is marked **Locked**? **Append a CR to §4** as well, so everyone knows the
  spec moved and why.
- Skip both only for trivial, instantly reversible edits with no lasting "why".

The test for an ADR: *would a future reader ask "why did we do it this way?"* If yes, write it.

## 0. ADR index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-0001](ADR-0001-backend-language-go.md) | Go for the server API, against the charter's own prose | **Accepted, provisional** | 2026-09-07 |
| [ADR-0002](ADR-0002-two-repo-split.md) | Two repositories with the API spec as the only seam | Accepted *(amended by 0011)* | 2026-09-07 |
| [ADR-0003](ADR-0003-aws-postgres-not-supabase.md) | AWS with self-managed PostgreSQL, not Supabase or Azure | Accepted *(DB host superseded by 0016; hosting superseded by 0036)* | 2026-09-07 |
| [ADR-0004](ADR-0004-modular-monolith.md) | Modular monolith rather than services | Accepted | 2026-09-07 |
| [ADR-0005](ADR-0005-paymongo-and-take-rate.md) | PayMongo, and the 5% take-rate exposure | Superseded by ADR-0026 (take rate) and ADR-0027 (gateway) | 2026-09-07 |
| [ADR-0006](ADR-0006-store-no-applications.md) | Store no applications; apply by redirect | Accepted | 2026-09-07 |
| [ADR-0007](ADR-0007-money-split-derived-by-subtraction.md) | Money split derived by subtraction; `take_rate` stored per booking | Accepted | 2026-09-08 |
| [ADR-0008](ADR-0008-booking-before-intent.md) | Booking row written before the PayMongo intent; orphan sweeper | Accepted | 2026-09-08 |
| [ADR-0009](ADR-0009-webhook-alert-slot-fk-coach-deletion.md) | Webhook alerting, slot integrity, coach-deletion retention | Accepted | 2026-09-08 |
| [ADR-0010](ADR-0010-mvp-cut-to-17-features.md) | MVP cut to 17 features; 8 deferred | Accepted | 2026-09-08 |
| [ADR-0011](ADR-0011-spec-sync-per-repo-ownership.md) | Spec sync: separate specs per repo, single ownership (amends 0002) | Accepted | 2026-09-08 |
| [ADR-0012](ADR-0012-session-delivery-model.md) | Session delivery, cancellation, and reschedule model | **Proposed — blocks Wave 3** | 2026-09-08 |
| [ADR-0013](ADR-0013-payout-ledger-and-payment-states.md) | Payout ledger, held balance, `payment_status` failure states | **Proposed** *(ledger schema + disbursement mechanism resolved by 0028; BSP/AMLA held-balance position still owed)* | 2026-09-08 |
| [ADR-0014](ADR-0014-cost-model-and-nfrs.md) | Fixed-cost model and non-functional requirements | **Proposed** | 2026-09-08 |
| [ADR-0015](ADR-0015-fold-idea-into-vocation.md) | `idea.md` folded into `VOCATION.md` | Accepted | 2026-09-08 |
| [ADR-0016](ADR-0016-neon-postgres-not-rds.md) | Managed Postgres on Neon, not self-managed AWS RDS *(supersedes the DB host in 0003)* | Accepted | 2026-09-10 |
| [ADR-0017](ADR-0017-jia-ingestion-pull-and-store.md) | Jia ingestion: pull-and-store, not live proxy | Accepted | 2026-09-13 |
| [ADR-0018](ADR-0018-response-envelope.md) | Response envelope: `{ message, data, meta }` | Accepted | 2026-09-10 |
| [ADR-0019](ADR-0019-defer-company-owner-fk.md) | `company.owner_account_id`: nullable, no FK, until `iam` lands | Accepted | 2026-09-11 |
| [ADR-0020](ADR-0020-sprint1-schema-additions.md) | Sprint 1 schema additions: `session`, deferred `review.booking_id`, coach timestamps | Accepted | 2026-09-11 |
| [ADR-0021](ADR-0021-student-feature-slice-decisions.md) | Student slice: `skills` column, `completeness_pct` equation, notification topic names, upload caps, no new AWS SDK dependency | Accepted | 2026-09-18 |
| [ADR-0022](ADR-0022-ledger-foundation-schema.md) | Ledger foundation schema (`ledger_entry`, `payout_batch`) — adopts ADR-0013 Option 1's shape only, not its blocked decision | Accepted | 2026-09-18 |
| [ADR-0023](ADR-0023-cors-web-origin.md) | CORS for the web origin, cookie auth, same-site domain topology | Accepted | 2026-09-22 |
| [ADR-0024](ADR-0024-checkout-reservation-pending-booking.md) | Checkout reservation is the pending booking row (erd Q3) | Accepted | 2026-09-22 |
| [ADR-0025](ADR-0025-account-deletion-anonymisation.md) | Account deletion and retained-record anonymisation | Accepted | 2026-10-01 |
| [ADR-0026](ADR-0026-take-rate-10-percent.md) | 10% coaching take rate | Accepted | 2026-10-01 |
| [ADR-0027](ADR-0027-xendit-gateway.md) | Xendit as the payment gateway *(supersedes the gateway in 0005)* | **Superseded** by ADR-0031 | 2026-10-01 |
| [ADR-0028](ADR-0028-payouts-and-disbursement.md) | Coach payouts and batched disbursement *(resolves the ledger/mechanism parts of 0013)* | Accepted *(disbursement part superseded by 0034)* | 2026-10-01 |
| [ADR-0029](ADR-0029-deploy-pipeline-and-migrations.md) | Deploy pipeline and migrations: Terraform + GitHub Actions OIDC, migrate as a one-off task, `ALERT` metric filter | Superseded by ADR-0036 | 2026-10-01 |
| [ADR-0030](ADR-0030-account-full-name-at-signup.md) | Optional `account.full_name` captured at signup | Accepted | 2026-10-07 |
| [ADR-0031](ADR-0031-paymongo-gateway.md) | PayMongo Checkout Sessions as the payment gateway | Accepted | 2026-10-14 |
| [ADR-0032](ADR-0032-observability-sentry-request-logs.md) | Observability: Sentry for errors, one log line per request, DB-aware health check | Accepted | 2026-10-15 |
| [ADR-0033](ADR-0033-postgres-rate-limits-replica-safe-jobs.md) | Postgres rate limits (fail open) and replica-safe background jobs | Accepted | 2026-10-18 |
| [ADR-0034](ADR-0034-manual-coach-payouts.md) | Manual coach payouts, 7-day hold and clawback; supersedes the disbursement part of 0028 | Accepted | 2026-10-18 |
| [ADR-0035](ADR-0035-resend-email.md) | Transactional email through Resend from `send.vocation.iskolar.io`; async, never fails the request; email verification does not block sign-in | Accepted | 2026-10-18 |
| [ADR-0036](ADR-0036-railway-vercel-deploy.md) | Deploy on Railway (API) and Vercel (web), Resend and Sentry; supersedes ADR-0029 and the hosting part of ADR-0003 | Accepted | 2026-10-18 |
| [ADR-0037](ADR-0037-origin-check-csrf.md) | Check browser origin on write requests as CSRF defense in depth | Accepted | 2026-10-20 |

## 1. Names & immutable identifiers (read first)

| Name / ID | Kind | Where it appears | Rule |
|-----------|------|------------------|------|
| **iSkolar Vocation** | Public product name | UI, landing page, pitch | Use wherever a user sees it. The charter uses this full form |
| **Vocation** | Short form | Internal shorthand, repo names, this doc set | Acceptable internally; never replace the public name in UI copy |
| **iSkolar** | Parent brand | Header, footer, domain | Vocation is a product *of* iSkolar. Note the parent name implies scholarships, which are **out of scope** (charter §I) |
| `iskolar-web3/vocation-server` · `iskolar-web3/vocation-web` | Repository names | GitHub, CI, deploy | **Confirmed 2026-09-08.** Both exist and were empty at that date |
| `F-###` | Feature id | PRD, sitemap, user-flow, api-spec | **IMMUTABLE.** Never renumber. Retire, defer, or add — never reuse. Eight are `Deferred`, not deleted ([ADR-0010](ADR-0010-mvp-cut-to-17-features.md)) |
| `S-###` · `UF-###` · `API-###` · `BR-###` | Screen / flow / contract / rule ids | Their owning docs | **IMMUTABLE.** Same rule |
| `payment_status` values | Enum: `none`, `pending`, `paid`, `refunded`, `failed`, `expired` | DB, API, gateway handler | **Existing values are IMMUTABLE** — renaming one breaks the money audit trail. Additions are permitted; renames are not. `payment.failed` does not change booking state because the checkout session remains payable (ADR-0031) |
| `gateway_ref` | External checkout session key (`cs_…`) | `booking` | **The reconciliation key** between Vocation and PayMongo. Renamed from `paymongo_intent_id` by [ADR-0027](ADR-0027-xendit-gateway.md) (CR-002, migration 0016); the current gateway is PayMongo ([ADR-0031](ADR-0031-paymongo-gateway.md)) |

> A rebrand is a pivot (§3) plus an ADR. Propagate the public name everywhere except IMMUTABLE rows.

## 2. Decision assumptions & evidence

| SUPPORTED (in charter or workbook) | PROVISIONAL (stated, contradicted, or unconfirmed) | UNVALIDATED (do not state as fact) |
|---|---|---|
| Two pillars: internship directory + coach marketplace | Backend is Go — charter §II tools list says Go, charter §I prose says Bun + Hono + TS. Owner chose Go (ADR-0001) | That students will pay for coaching. **The entire revenue model rests on this and nothing tests it** |
| Platform stores no applications; apply is an outbound redirect | ~~5% take rate viability~~ **superseded by the accepted 10% rate in ADR-0026; PayMongo Checkout Sessions are the gateway (ADR-0031)** | Market size. No figure exists anywhere; the "hundreds of thousands" band in `VOCATION.md` §B5 is inferred, **not sourced** |
| 10% platform commission; payout derived by subtraction (ADR-0007, ADR-0026); coach payouts are manual until PayMongo Transfers (ADR-0031) | ~~Repo names~~ **confirmed** | That coach supply can be recruited ahead of student demand |
| PayMongo Checkout Sessions is the gateway (ADR-0031); GCash + Maya + GrabPay + ShopeePay + QRPH | Specific AWS services (ECS Fargate, S3, CloudFront) — charter says only "AWS" and "Docker"; the database is **Neon**, not RDS ([ADR-0016](ADR-0016-neon-postgres-not-rds.md)) | Retention windows in `erd.md`. Every one is an assumption |
| PostgreSQL, AWS, Docker, React/TS/Vite/TanStack/Tailwind | Auth is self-implemented — the charter names no auth provider; Postgres is hosted on Neon, one component off AWS (ADR-0016) | That one developer can deliver four modules across two repos on the charter's milestones |
| Scope excludes scholarships, grants, full-time jobs | Milestone dates — three are in the past relative to the charter; the rest are TBD | "Blockchain components" as a real requirement |
| Five-person team and their roles (charter §IV) | Rate limits in `api-spec.md` | That a coaching session can be delivered at all — no provider, no join path, no cancel path exists (ADR-0012) |
| v1 scope is 17 features (ADR-0010) | Fixed cost ≈ ₱6,000–7,500/month — estimated, not quoted (ADR-0014); stale since the RDS→Neon move (ADR-0016) and unrecomputed | That batched coach payouts stay outside BSP/AMLA scope (ADR-0013) |

## 3. Pivots & decisions (newest first — cite ADR)

### 2026-10-15 — Observability recorded as ADR-0032
- **Change:** every 5xx now logs and reports its cause to Sentry, every request gets an ID and a
  log line, panics are recovered, and `GET /healthz` pings the database.
- **Why:** issue #71. About 70 error paths failed silently and nothing recorded requests.
- **Recorded as:** [ADR-0032](ADR-0032-observability-sentry-request-logs.md).
- **Propagation:** `ops.md` §5 (health check, request logs and errors), `openapi.yaml` (`/healthz`
  503), `.env.example` (`SENTRY_*`); `index.md` §3; this file's §0 index.

### 2026-10-01 — Deploy pipeline, migrations-in-deploy and the `ALERT` alarm recorded as ADR-0029
- **Change:** the environment `docs/ops.md` described as "NOT YET" now exists as code:
  `infra/terraform/` (ECR, ECS Fargate, ALB, Secrets Manager containers, private uploads bucket,
  GitHub OIDC deploy role, CloudWatch `ALERT` alarm) and `.github/workflows/deploy.yml` (build →
  migrate → roll → smoke test). Migrations run as a one-off Fargate task from `db/Dockerfile.migrate`
  before the service update, per `ops.md` §3's ordering rule.
- **Why:** issues #27/#28/#32 are `ops.md` §7's ranked blockers before real money, and all three
  were prose-only. Migrate-before-roll is the only shape that keeps schema and binary from
  disagreeing without putting migrations inside `cmd/api`.
- **Recorded as:** [ADR-0029](ADR-0029-deploy-pipeline-and-migrations.md).
- **Implementation clarification (2026-10-01):** the statement above about preventing schema/binary
  disagreement was too strong. The appended clarification in ADR-0029 requires migrations to stay
  backward compatible with the previous binary during rolling deploys and rollbacks.
- **Propagation:** `ops.md` §2 (secret store), §3 (migrations), §5 (`ALERT` alarm), §7 (statuses),
  §8 (First deploy runbook); `index.md` §3; this file's §0 index.

### 2026-09-13 — Jia ingestion decision recorded as ADR-0017
- **Change:** the ingest-not-proxy model `implementation-plan.md` already described in prose
  ("Jia: ingest, do not proxy") is now a numbered ADR, written at the point the ingestion code
  (`internal/internships/jia.go`, migration 0008, `cmd/jiasync`) actually landed. Five docs had
  cited ADR-0017 by number since Sprint 0 without the file ever existing.
- **Why:** a decision referenced but never recorded is a gap the moment anyone follows the
  citation. `onboarding.md`'s rule — chat and Trello comments are not records — applies here too.
- **Recorded as:** [ADR-0017](ADR-0017-jia-ingestion-pull-and-store.md).
- **Propagation:** `index.md` §3; this file's §0 index.

### 2026-09-11 — Sprint 1 schema: `session` table added, `review.booking_id` deferred, `company` FK closed
- **Change:** `erd.md` gains a `session` entity (server-side sessions, keyed by token hash) that
  wasn't previously modelled; `review.booking_id` ships nullable with no FK ahead of Sprint 2's
  `booking` table; `coach_profile`/`session_type` gain `created_at`/`updated_at`; migration 0005
  finally adds `company.owner_account_id`'s FK now that `account` exists.
- **Why:** `iam` and the coaching read path (F-013's `GET /coaches/:slug/reviews`) are in scope this
  sprint, `booking` is not — the same shape of problem ADR-0019 already accepted for
  `company.owner_account_id`.
- **Recorded as:** [ADR-0020](ADR-0020-sprint1-schema-additions.md).
- **Propagation:** `erd.md` (session entity, coach timestamp columns, review.booking_id note);
  migrations 0002–0005.

### 2026-09-11 — `company.owner_account_id` ships nullable, no FK, in migration 0001
- **Change:** `erd.md`'s `NOT NULL` + `FK → account` on `company.owner_account_id` is not enforced
  in migration 0001 — the column is nullable with no FK.
- **Why:** migration 0001 is scoped to `company` and `internship` only (`account` lands with `iam`
  in Sprint 1), and ADR-0010 already removed employer self-serve from v1, so no employer account is
  guaranteed to exist to own a `company` row.
- **Recorded as:** [ADR-0019](ADR-0019-defer-company-owner-fk.md).
- **Propagation:** owed — a Sprint 1 migration adds the FK once `account` exists, or `erd.md` is
  amended if admin-authored companies turn out to be the permanent v1 answer.

### 2026-09-10 — Response envelope fixed at `{ message, data, meta }`
- **Change:** `api-spec.md` specified `{ data, meta }` for lists and nested the error string inside
  `error`; `AGENTS.md` and the `academy-web` pattern specified `{ message, data }` with a
  top-level `message`. Both are now one shape: `{ message, data }`, plus `meta` on lists and
  `error` on failures, with `message` always top-level and always displayable.
- **Why:** the two repos share no build step (ADR-0011), so the spec is the only thing keeping the
  handler and the Zod boundary parse in agreement. A disagreement about the wrapper surfaces at
  integration, not at review. The error-shape half would have broken every error path silently.
- **Recorded as:** [ADR-0018](ADR-0018-response-envelope.md).
- **Propagation:** `api-spec.md` §Overview, §Error codes and API-001; `vocation-web/AGENTS.md`;
  `implementation-plan.md`.

### 2026-09-10 — Database moves from AWS RDS to Neon
- **Change:** Postgres host: **Multi-AZ RDS PostgreSQL → Neon** (managed, serverless, Postgres-wire
  compatible). The rest of the topology is unchanged — API on ECS Fargate, uploads on S3, client on
  CloudFront, secrets in Secrets Manager (now holding the Neon connection string). Local dev still
  uses Postgres in Docker Compose.
- **Why:** cost and dev velocity. ADR-0014 put the all-AWS topology at ₱6,000–7,500/month before
  traffic, with Multi-AZ RDS + the NAT gateway a large share; Neon's usage-based pricing scales to
  near zero at idle. And there is no ops role to run RDS — Neon gives managed backups/PITR and
  per-branch databases for preview environments with no protocol change (`pgx` unaffected).
- **Recorded as:** [ADR-0016](ADR-0016-neon-postgres-not-rds.md). Supersedes the database-host
  portion of [ADR-0003](ADR-0003-aws-postgres-not-supabase.md); the rest of 0003 stands.
- **Propagation:** `system-design.md` (context + deployment diagrams, tech-choice and trade-off
  tables, scaling), `prd.md` (Dependencies), `index.md` §3, `AGENTS.md` (architecture + stack
  currency), `README.md`, `VOCATION.md` §B9. `ADR-0014` cost inputs left stale and flagged for
  recompute; `ops.md` and `erd.md` retention items owed (data region, PITR window).

### 2026-09-08 — Engineering review: 22 findings, scope cut, five money fixes
- **Change:** 25 features → **17** (8 deferred); the two unsatisfiable money CHECKs replaced by a
  stored `take_rate` and a derived payout; booking/intent ordering made explicit; webhook rejections
  alerted; slot integrity enforced in SQL; coach deletion defined. `idea.md` folded into
  `VOCATION.md`.
- **Why:** `/plan-eng-review` plus an independent outside voice. A ₱499.90 booking could not be
  inserted; API-041 promised atomicity across an HTTP call; a rejected webhook transition vanished
  silently; one developer faced 47 endpoints and 30 screens.
- **Recorded as:** ADR-0007 · ADR-0008 · ADR-0009 · ADR-0010 · ADR-0011 · ADR-0015, with
  ADR-0012 / ADR-0013 / ADR-0014 `Proposed` and gating waves.
- **Propagation:** `VOCATION.md`, `prd.md`, `erd.md`, `api-spec.md`, `sitemap.md`, `user-flow.md`,
  `sad.md`, `onboarding.md`, `index.md`, `AGENTS.md`. `implementation-plan.md` created.

### 2026-09-08 — Root inputs consolidated
- **Change:** `idea.md` → `VOCATION.md` Part B. One root input instead of two.
- **Why:** both were inputs, read at the same moment, answering one question. `index.md` §0 carried
  two rows for what a reader experiences as one document.
- **Recorded as:** [ADR-0015](ADR-0015-fold-idea-into-vocation.md). References `idea.md §N` → **§BN**.

### 2026-09-07 — Doc set generated; `Vocation.pptx` superseded as a source
- **Change:** the earlier `Vocation.pptx` framing (AI-powered matching and profiling, AI coaching
  module, on-platform applications with employer screening, HEI/CHED OJT compliance reporting,
  Supabase + Azure) → the charter and workbook scope (search-and-filter directory, **human** coach
  marketplace, apply-by-redirect with no stored applications, PostgreSQL on AWS).
- **Why:** the Project Charter (2026-09-05) and the 24-story workbook are the authoritative
  sources. The deck described a materially different product.
- **Recorded as:** this entry. No ADR — a source-of-truth correction, not a design choice.
- **Propagation:** `VOCATION.md` and `docs/prd.md` were rewritten. Anyone still working from the deck
  is working from a superseded brief.

### 2026-09-07 — Backend language set to Go over the charter's own prose
- **Change:** charter §I "Bun + Hono + TypeScript" → Go.
- **Why:** owner statement, and charter §II's own tools list. The charter contradicts itself.
- **Recorded as:** [ADR-0001](ADR-0001-backend-language-go.md). **The charter prose needs correcting.**

### 2026-09-07 — Three charter architecture deliverables collapsed into one HLD
- **Change:** "System Design" + "System Architecture" + "System Model" → `system-design.md` (HLD)
  + `erd.md` (entities). "System Architecture" is dropped as a separate artifact.
- **Why:** three deliverables describing one architecture guarantees three overlapping documents
  with no owner. FMD's one-fact-one-home rule.
- **Recorded as:** this entry, and `VOCATION.md` charter mapping.

## 4. Change records (CR-###)

Docs move **Draft → Locked → Superseded**. While `Draft`, edit freely. Once **Locked** — agreed and
being built against — an edit **requires a CR here**.

**Every doc in this suite is currently `Draft`.** CR-001–CR-004 are recorded below for the
2026-10-01 changes (take rate, gateway, payouts, machine-readable contract). The 2026-09-08 review
edits needed no CR — they are recorded as ADRs and as the §3 pivot above.

Copy this shape (from `fmd/templates/change-record.md`):

### CR-001 — Take rate 5% → 10%
- **Date:** 2026-10-01
- **Author:** Project owner (decision); engineering (propagation)
- **Doc(s) changed:** `internal/payments/split.go`; `internal/payments/split_test.go`; `internal/coaching/booking.go`; `internal/coaching/booking_handler_test.go`; `internal/coaching/earnings_handler_test.go`; `AGENTS.md`; `docs/prd.md`; `docs/erd.md`; `docs/methods.md`; `docs/adr/ADR-0005-paymongo-and-take-rate.md`; `docs/adr/ADR-0026-take-rate-10-percent.md`; `docs/adr/README.md`; `docs/index.md`; `docs/onboarding.md`; `docs/implementation-plan.md`; `docs/sad.md`; `docs/system-design.md`; `docs/ops.md`. **Lifecycle:** Draft → Draft
- **Change:** New bookings use a 10% (`0.1000`) take rate; older booking rows keep their stored rate.
- **Reason:** The project owner ratified a 10% take rate together with Xendit on 2026-10-01; see ADR-0026.
- **Impact / propagation:** `vocation-web` (Jem) must replace its hardcoded `0.05` and display the server-returned split; PM must correct charter §I separately; coaches onboarding copy must state the 10% commission and approximate 90% share.
- **Consequences:** The platform retains a larger commission on new paid bookings. Existing split rows and database CHECK constraints do not change.

### CR-002 — Gateway PayMongo → Xendit
- **Date:** 2026-10-01
- **Author:** Project owner (decision); engineering (propagation)
- **Doc(s) changed:** `internal/payments/client.go`; `internal/payments/webhook.go`; `internal/payments/doc.go`; `internal/payments/client_test.go`; `internal/payments/webhook_test.go`; `internal/coaching/booking.go`; `internal/coaching/booking_repository.go`; `internal/coaching/booking_handler.go`; `internal/coaching/webhook_handler.go`; `internal/coaching/booking_fakes_test.go`; `internal/coaching/booking_handler_test.go`; `internal/coaching/booking_internal_test.go`; `internal/coaching/webhook_handler_test.go`; `internal/coaching/booking_repository_integration_test.go`; `cmd/api/main.go`; `.env.example`; `db/migrations/000016_rename_gateway_columns.*.sql`; `docs/adr/ADR-0027-xendit-gateway.md`; `docs/adr/README.md`; `docs/api-spec.md`; `docs/erd.md`; `docs/ops.md`; `docs/system-design.md`; `docs/methods.md`; `docs/prd.md`; `docs/index.md`; `docs/onboarding.md`; `docs/implementation-plan.md`; `docs/sad.md`; `AGENTS.md`; `CLAUDE.md`; `README.md`. **Lifecycle:** Draft → Draft
- **Change:** The payment gateway is Xendit (Invoices API) rather than PayMongo. Renamed env vars: `PAYMONGO_SECRET_KEY` → `XENDIT_SECRET_KEY`, `PAYMONGO_BASE_URL` → `XENDIT_BASE_URL`, `PAYMONGO_WEBHOOK_SECRET` → `XENDIT_CALLBACK_TOKEN`, `PAYMONGO_SUCCESS_URL` → `CHECKOUT_SUCCESS_URL`, `PAYMONGO_CANCEL_URL` → `CHECKOUT_CANCEL_URL`; added `APP_ENV`. New webhook route `POST /webhooks/xendit` (was `/webhooks/paymongo`). Renamed columns: `booking.paymongo_intent_id` → `gateway_ref`, `payment_event.paymongo_event_id` → `gateway_event_id` (migration 0016).
- **Reason:** Xendit has a disbursement API needed by issue #35, and its key prefix enforces test vs live; see [ADR-0027](ADR-0027-xendit-gateway.md).
- **Impact / propagation:** Whoever configures the Xendit dashboard must set the invoice webhook URL to `POST /webhooks/xendit` and install the callback token; the API must be deployed before the callback can reach it (`ops.md` §2). `vocation-web` needs no change unless it references PayMongo, because the API response field is still `checkout_url`. Anyone with a local `.env` must rename the five `PAYMONGO_*` variables. A DTI/SEC-registered entity is required before live activation.
- **Consequences:** Payouts become programmable; dev/staging can never charge real money; the API response contract is unchanged. `docs/api-spec.md` Q5 is partly answered (programmatic disbursement exists; the endpoint is issue #35 / ADR-0028) and Q9 still blocks Wave 4.

### CR-003 — Coach payouts live
- **Date:** 2026-10-01
- **Author:** Engineering (issue #35); reviewed by `payments-auditor` and the Security Engineer
- **Doc(s) changed:** `db/migrations/000017_payouts_and_ledger.*`; `internal/coaching/booking_repository.go`; `internal/coaching/ledger.go`; `internal/coaching/ledger_repository.go`; `internal/coaching/payout_runner.go`; `internal/coaching/earnings_handler.go`; `internal/coaching/search_params.go`; `internal/coaching/repository.go`; `internal/coaching/coach.go`; `internal/coaching/profile_handler.go`; `internal/coaching/webhook_handler.go`; `internal/coaching/ledger_repository_integration_test.go`; `internal/payments/payout.go`; `internal/payments/payout_webhook.go`; `internal/payments/payout_test.go`; `internal/platform/httpx/envelope.go`; `cmd/payouts/main.go`; `cmd/api/main.go`; `.env.example`; `docs/adr/ADR-0028-payouts-and-disbursement.md`; `docs/adr/README.md`; `docs/api-spec.md`; `docs/erd.md`; `docs/methods.md`; `docs/prd.md`; `docs/ops.md`; `docs/index.md`. **Lifecycle:** Draft → Draft
- **Change:** The ledger is written on booking completion (`earning`) and refund (`reversal`); coaches set a Xendit payout destination through API-061; API-064 keeps `data` as the per-booking array and adds `meta.balance`, with a new paginated `GET /me/earnings/ledger`; a weekly `cmd/payouts` binary batches disbursements via Xendit's Payouts API and a payout webhook on `POST /webhooks/xendit` confirms them. A definitive gateway rejection fails and reverses the batch; an unknown outcome keeps it `processing` and the next run re-drives it with the same idempotency key; a `REVERSED` bounceback returns the money. Flat v2 payout callbacks are recognised by shape and their stored payload is redacted to a masked destination. Migration 0017 makes `ledger_entry` append-only, adds the `payout_batch` columns (including the masked destination snapshot), adds the `coach_profile` payout destination, and drops the `ledger_entry.coach_account_id` FK (ADR-0025).
- **Reason:** Issue #35: `GET /me/earnings` showed a number and nothing could move money to a coach. ADR-0013 blocked Wave 4; the ledger existed empty since ADR-0022.
- **Impact / propagation:** `vocation-web` (**Jem**) reads `meta.balance` on the earnings screen without breaking on `data` (still the booking array) and exposes the payout destination on API-061. **Ops** must schedule `cmd/payouts` weekly (ops.md §4) and watch the payout `ALERT` lines, including `held for re-drive`. **Finance** must keep the Xendit payout balance funded. `api-spec.md` Q5/Q9, `erd.md` Q9 and PRD Q10 are now answered.
- **Consequences:** Every peso is traceable and a failed disbursement reverses itself; the money path gains a second async actor and a scheduled binary whose stuck-`processing` state is re-driven automatically and documented (ops.md §6). The BSP/AMLA held-balance question remains owed; the ledger/batch retention window is recorded as 10 years `[assumption]` in ADR-0028 and the ERD, owed to the Security Engineer to confirm.

### CR-004 — Machine-readable API contract (`openapi.yaml`)
- **Date:** 2026-10-01
- **Author:** Engineering (issue #36)
- **Doc(s) changed:** `docs/openapi.yaml` (new); `internal/platform/apicontract/doc.go`; `internal/platform/apicontract/openapi_test.go`; `go.mod`/`go.sum` (test-only `github.com/getkin/kin-openapi`); `docs/api-spec.md` (Contract section, Q1); `docs/index.md` (§0 row, suite, health check); `docs/adr/README.md`. **Lifecycle:** Draft → Draft
- **Change:** `api-spec.md`'s prose contract gains a machine-readable twin. `docs/openapi.yaml` is a hand-written OpenAPI **3.0.3** document describing every route the mux registers, `operationId` = the `API-###` id, the ADR-0018 envelope as shared components, the `vocation_session` cookie scheme (ADR-0023), the Xendit `x-callback-token` webhook path (ADR-0027/ADR-0028), money as integer centavos, and `429` + `Retry-After` on rate-limited operations. A Go test (`internal/platform/apicontract/openapi_test.go`) loads it with `kin-openapi` and calls `Validate`, so CI fails on an invalid file.
- **Reason:** Issue #36 / api-spec Q1: the two repositories share only prose under ADR-0011, so field-name drift cannot be caught by anything. The YAML is now the type half of the contract.
- **Impact / propagation:** **`vocation-web` (Jem)** generates its TypeScript types from `docs/openapi.yaml` (e.g. `openapi-typescript`) and deletes hand-written duplicates; PRs are reviewed against the generated types, not a re-typed schema. **Server** PRs that add, remove or change a route update the file in the same PR. `docs/api-spec.md` keeps ownership of intent, and its prose is fixed to match the YAML (and the code) whenever they disagree.
- **Consequences:** Drift becomes a CI failure instead of an integration surprise. Cost: the file is one more artifact to update on every contract change, and the test-only dependency `github.com/getkin/kin-openapi` is added to `go.mod`.

### CR-005 — Gateway Xendit → PayMongo
- **Date:** 2026-10-14
- **Author:** Engineering (issue #66)
- **Doc(s) changed:** `internal/payments/`; `internal/coaching/`; `cmd/payouts/` (removed); `db/migrations/000019`; `.env.example`; `docs/adr/ADR-0027-xendit-gateway.md`; `docs/adr/ADR-0031-paymongo-gateway.md`; `docs/adr/README.md`; `docs/openapi.yaml`. **Lifecycle:** Draft → Draft
- **Change:** Gateway checkout and webhook move from Xendit to PayMongo Checkout Sessions. Environment names change: `XENDIT_SECRET_KEY` → `PAYMONGO_SECRET_KEY`, `XENDIT_BASE_URL` → `PAYMONGO_BASE_URL`, `XENDIT_CALLBACK_TOKEN` → `PAYMONGO_WEBHOOK_SECRET`; `PAYOUT_MINIMUM_PESOS` is removed. Webhook route changes from `/webhooks/xendit` to `/webhooks/paymongo`. Migration 000019 adds `gateway_payment_ref` and `gateway_refund_ref` (both unique) and `disputed_at` on `booking`; `gateway_ref` is the existing checkout reference. `cmd/payouts` is removed; coach payouts are manual until PayMongo Transfers lands.
- **Reason:** The team cannot access Xendit; PayMongo is available for paid bookings and verified webhook confirmation (BR-007). See [ADR-0031](ADR-0031-paymongo-gateway.md).
- **Impact / propagation:** Register the PayMongo webhook at `/webhooks/paymongo`; rename local `.env` variables. `vocation-web` has no change because the response remains `checkout_url`.
- **Consequences:** Checkout and payment confirmation use PayMongo; the gateway-neutral ledger remains, and coach payouts stay manual pending Transfers.

```
### CR-001 — <title>
- **Date:** YYYY-MM-DD
- **Author:** <who>
- **Doc(s) changed:** <slug + section>  ·  **Lifecycle:** Locked → Locked (amended) | → Superseded
- **Change:** <old → new, precisely>
- **Reason:** <what reality diverged from the spec>
- **Impact / propagation:** <which other docs, F-###/API-### refs must reconcile>
- **Consequences:** <easier / harder downstream>
```

**Recommended lock order**, so downstream work is not built on moving specs:
`prd` → `erd` → `api-spec` → `sitemap` → `user-flow` → `system-design`.
The PRD locks first because it owns the `F-###` spine; `api-spec` locks before any client work,
because two repositories cannot share a moving contract.

## 5. Rejected approaches

| Approach considered | Rejected because | Would revisit if |
|---------------------|------------------|------------------|
| Bun + Hono + TypeScript API (charter §I prose) | Owner chose Go; charter §II tools list agrees | The single full-stack developer proves to be the binding constraint — a unified TS stack halves their context-switching. **This is a live risk, not a closed question** (ADR-0001) |
| Microservices per module | One developer, four modules. Deploy and failure surface would multiply with no team to absorb it | Team grows past ~4 engineers, or one module needs independent scaling |
| Supabase (Postgres + Auth + Storage) | Charter §II specifies AWS and PostgreSQL. The `Vocation.pptx` mention is superseded | AWS operational load proves unsustainable for a team with no ops role |
| Self-managed RDS PostgreSQL on AWS (ADR-0003) | Multi-AZ RDS + the NAT gateway its private subnets need is a large share of a ₱6–7.5k/month fixed cost for a pre-launch platform, and there is no ops role to run it. Neon scales to zero and gives managed PITR + per-branch databases (ADR-0016) | AWS-wide consolidation becomes a hard requirement, or Neon's connection/latency model or data-region options prove unworkable |
| Azure OpenAI / any LLM component | No AI feature exists in the charter or the 24 stories. The deck's "AI-powered matching" is not in scope | "Sort: relevance" (PRD Q5) is specified in a way that needs embeddings |
| Collecting applications on-platform (an ATS) | Charter §II.1.c and BR-001/BR-014/BR-015 exclude it outright, and it is the business model (ADR-0006) | Never, without reversing ADR-0006 and re-deriving the revenue model |
| Charging employers to post | Would require the ATS above; employers already have their own pipeline | Coaching revenue fails to cover cost and a second stream is needed |
| Next.js with SSR | Not in the charter's tool list, though it would fix indexability of the public marketing routes | Public-route SEO proves to matter for acquisition (sitemap Q2) |
| GitHub Projects / Issues as execution truth | FMD's own guidance: the Markdown plan is sole execution truth, and the team uses Trello | Never as *truth*; a mirror is fine |
| A `vocation-docs` repo with a CI mirror into both app repos | Owner chose separate specs per repo (ADR-0011). It was the review's recommendation | Spec drift appears despite the drift guard |
| Collapsing to a monorepo | Charter §I specifies two repositories. It was free while both were empty; that window closed | The two-repo seam proves too costly for one developer |
| Keeping all 25 charter features in v1 | One developer, 47 endpoints, 30 screens, and none of the deferred blocks tests the riskiest assumption (ADR-0010) | Team capacity grows |
| Computing `coach_payout` as an independent percentage of price | Rounding both halves independently makes some prices unrepresentable — ₱499.90 failed at the former 5% rate (ADR-0007) | Never. It is arithmetically wrong |
| Treating booking-write and intent-creation as atomic | A Postgres transaction cannot span an HTTP call (ADR-0008) | Never |
| HEI / CHED SIPP compliance features | No HEI role in the charter; Vocation is not in the regulatory path | A university partnership makes the internship office the buyer |

## 6. Open items / risks

Ranked by consequence, not by ease.

1. **A coaching session has no delivery mechanism.** `booking.join_url` is produced by nothing and
   `booking_status = cancelled` is set by nothing, so a confirmed booking cannot be attended or
   cancelled — while payment is captured before delivery with no delivery evidence.
   [ADR-0012](ADR-0012-session-delivery-model.md) **blocks Wave 3.**
2. **Payouts force a ledger the ERD lacks, and refunds are unrepresentable.** Xendit's disbursement
   API can push funds ([ADR-0027](ADR-0027-xendit-gateway.md)), but payouts must still be batched
   (per-booking transfer cost exceeds the commission) and no `payout_batch`, `ledger_entry` or
   `refunded_amount` exists. [ADR-0013](ADR-0013-payout-ledger-and-payment-states.md) **blocks
   Wave 4**; issue #35 / ADR-0028 owns the payout endpoint.
3. **`payment_status` cannot express failure or expiry**, so failed bookings stay `pending` forever
   and the reconciler polls dead intents. The enum is otherwise immutable — add the values before
   go-live. ADR-0013.
4. **Xendit merchant onboarding is unowned**, needs a DTI/SEC-registered entity, a bank account and
   KYC, and requires the S-014–S-017 policy pages live. Weeks of external lead time, no code
   dependency. Test keys work before activation ([ADR-0027](ADR-0027-xendit-gateway.md)).
   `implementation-plan.md` TASK-080.
5. **Xendit rates and break-even amounts are estimates until confirmed against the signed merchant
   agreement.** ADR-0026 records the issue #25 fee schedule and estimated break-even prices.
6. **Fixed cost was never computed** — the old all-RDS topology was roughly ₱6,000–7,500/month,
   implying break-even at 300–600 paid sessions. The RDS→Neon move ([ADR-0016](ADR-0016-neon-postgres-not-rds.md))
   removes the Multi-AZ RDS instance and shrinks the private-subnet/NAT-gateway footprint, so the
   figure and the break-even count both need recomputing.
   [ADR-0014](ADR-0014-cost-model-and-nfrs.md).
7. **Chargeback after payout has no owner and no flow.** Nothing says what happens to money
   already credited to a coach. PRD Q7, Q10, EV-010 — folded into ADR-0013.
8. **Coach payout mechanism is entirely unspecified.** `coach_payout` is recorded; nothing says how
   a coach receives money. PRD Q10 — the ledger shape in ADR-0013 follows from the answer.
9. **Delivery capacity.** One Full Stack Developer against 17 features and two repos, with two
   security roles owning every gate, no named designer, and no named QA — against a full Design
   milestone and a JMeter/Vitest/Manual Testing milestone. `VOCATION.md` Q4.
10. **Milestone dates are incoherent.** Testing 2026-07-09/10 and Deployment 2026-07-14 precede the
   2026-09-05 charter. Everything else is TBD. `VOCATION.md` Q2.
11. **The charter contradicts itself on the backend language.** ADR-0001. Until the prose is
   corrected, two readers of the charter will build different things.
12. ~~**`openapi.yaml` does not exist**, so the two repositories are coupled only by prose —
    load-bearing under ADR-0011. api-spec Q1, TASK-011.~~ **Resolved 2026-10-01:** `docs/openapi.yaml`
    (OpenAPI 3.0.3) is the machine-readable contract, validated in CI; the prose remains the
    narrative. `vocation-web` must generate its types from it (CR-004). api-spec Q1 closed.
13. **`qa-test-plan` coverage gaps.** The plan now exists (generated 2026-10-01 — this item
    supersedes "no `qa-test-plan`"): a 55-path register (47 non-deferred `API-###` operations from
    44 identifiers — API-062, API-067 and API-064 each carry two methods/paths — plus EV-004,
    EV-005, EV-010, the ₱499.90 case, and 4 manual/E2E paths) at **37 Automated / 8 Partial /
    6 Not covered / 4 Manual**. CI now exists (`.github/workflows/ci.yml`, Postgres service,
    integration tests must run) and its latest run `36822948065` (2026-10-01) passed every
    automated path; the 4 manual/E2E and 6 uncovered paths have **no result recorded**. The four
    silent-failure cases — EV-004, EV-006, EV-010, ₱499.90 — are flagged, not closed: no
    reconciliation job, no orphan sweeper, no chargeback flow, and no database test of the money
    write path or its CHECKs. QA owner still unassigned (PRD Q12).
14. **RA 10173 exposure is unassessed.** Student resumes are sensitive personal information; NPC
   registration is mandatory past 1,000 data subjects. No `security-compliance` doc yet. PRD Q11.
   *(Government IDs left v1 with F-043 — ADR-0010.)*
15. **`methods` is not generated**, so no displayed number has an equation home, including the
   commission split.
16. **`ops` is not generated** for a system that will hold payment records, and no ops role exists.
17. **Netlify versus AWS.** `academy-web` deploys to Netlify; charter §II says AWS. `VOCATION.md` Q9.
18. **"Blockchain components"** appears in one role description and nowhere else, in an org named
   `iskolar-web3`. `VOCATION.md` Q3.

## References

- [`../index.md`](../index.md) — §0 ownership map
- [`../../VOCATION.md`](https://github.com/iskolar-web3/vocation-server/blob/main/VOCATION.md) — context intake
- `Vocation Project Charter.pdf` · `Vocation User Stories.xlsx` — project root
- `fmd/templates/adr.md` · `fmd/templates/decision-ledger.md` · `fmd/templates/change-record.md`
