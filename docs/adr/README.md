<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# Decision Register — iSkolar Vocation

**Maintained by:** Alexandre Nevero (PM)
**Last reconciled:** 2026-09-10
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
| [ADR-0003](ADR-0003-aws-postgres-not-supabase.md) | AWS with self-managed PostgreSQL, not Supabase or Azure | Accepted *(DB host superseded by 0016)* | 2026-09-07 |
| [ADR-0004](ADR-0004-modular-monolith.md) | Modular monolith rather than services | Accepted | 2026-09-07 |
| [ADR-0005](ADR-0005-paymongo-and-take-rate.md) | PayMongo, and the 5% take-rate exposure | **Proposed — parked by owner** | 2026-09-07 |
| [ADR-0006](ADR-0006-store-no-applications.md) | Store no applications; apply by redirect | Accepted | 2026-09-07 |
| [ADR-0007](ADR-0007-money-split-derived-by-subtraction.md) | Money split derived by subtraction; `take_rate` stored per booking | Accepted | 2026-09-08 |
| [ADR-0008](ADR-0008-booking-before-intent.md) | Booking row written before the PayMongo intent; orphan sweeper | Accepted | 2026-09-08 |
| [ADR-0009](ADR-0009-webhook-alert-slot-fk-coach-deletion.md) | Webhook alerting, slot integrity, coach-deletion retention | Accepted | 2026-09-08 |
| [ADR-0010](ADR-0010-mvp-cut-to-17-features.md) | MVP cut to 17 features; 8 deferred | Accepted | 2026-09-08 |
| [ADR-0011](ADR-0011-spec-sync-per-repo-ownership.md) | Spec sync: separate specs per repo, single ownership (amends 0002) | Accepted | 2026-09-08 |
| [ADR-0012](ADR-0012-session-delivery-model.md) | Session delivery, cancellation, and reschedule model | **Proposed — blocks Wave 3** | 2026-09-08 |
| [ADR-0013](ADR-0013-payout-ledger-and-payment-states.md) | Payout ledger, held balance, `payment_status` failure states | **Proposed — blocks Wave 4** | 2026-09-08 |
| [ADR-0014](ADR-0014-cost-model-and-nfrs.md) | Fixed-cost model and non-functional requirements | **Proposed** | 2026-09-08 |
| [ADR-0015](ADR-0015-fold-idea-into-vocation.md) | `idea.md` folded into `VOCATION.md` | Accepted | 2026-09-08 |
| [ADR-0016](ADR-0016-neon-postgres-not-rds.md) | Managed Postgres on Neon, not self-managed AWS RDS *(supersedes the DB host in 0003)* | Accepted | 2026-09-10 |

## 1. Names & immutable identifiers (read first)

| Name / ID | Kind | Where it appears | Rule |
|-----------|------|------------------|------|
| **iSkolar Vocation** | Public product name | UI, landing page, pitch | Use wherever a user sees it. The charter uses this full form |
| **Vocation** | Short form | Internal shorthand, repo names, this doc set | Acceptable internally; never replace the public name in UI copy |
| **iSkolar** | Parent brand | Header, footer, domain | Vocation is a product *of* iSkolar. Note the parent name implies scholarships, which are **out of scope** (charter §I) |
| `iskolar-web3/vocation-server` · `iskolar-web3/vocation-web` | Repository names | GitHub, CI, deploy | **Confirmed 2026-09-08.** Both exist and were empty at that date |
| `F-###` | Feature id | PRD, sitemap, user-flow, api-spec | **IMMUTABLE.** Never renumber. Retire, defer, or add — never reuse. Eight are `Deferred`, not deleted ([ADR-0010](ADR-0010-mvp-cut-to-17-features.md)) |
| `S-###` · `UF-###` · `API-###` · `BR-###` | Screen / flow / contract / rule ids | Their owning docs | **IMMUTABLE.** Same rule |
| `payment_status` values | Enum: `none`, `pending`, `paid`, `refunded` | DB, API, PayMongo handler | **Existing values are IMMUTABLE** — renaming one breaks the money audit trail. [ADR-0013](ADR-0013-payout-ledger-and-payment-states.md) proposes **adding** `failed` and `expired`; additions are permitted, renames are not. Add them **before go-live** or the migration becomes ledger-breaking |
| `paymongo_intent_id` | External key | `booking`, `payment_event` | **IMMUTABLE.** The reconciliation key between Vocation and PayMongo |

> A rebrand is a pivot (§3) plus an ADR. Propagate the public name everywhere except IMMUTABLE rows.

## 2. Decision assumptions & evidence

| SUPPORTED (in charter or workbook) | PROVISIONAL (stated, contradicted, or unconfirmed) | UNVALIDATED (do not state as fact) |
|---|---|---|
| Two pillars: internship directory + coach marketplace | Backend is Go — charter §II tools list says Go, charter §I prose says Bun + Hono + TS. Owner stated Go | That students will pay for coaching. **The entire revenue model rests on this and nothing tests it** |
| Platform stores no applications; apply is an outbound redirect | 5% take rate is viable — see ADR-0005; published PayMongo card fees make small sessions loss-making | Market size. No figure exists anywhere; the "hundreds of thousands" band in `VOCATION.md` §B5 is inferred, **not sourced** |
| 5% platform commission; payout derived by subtraction (ADR-0007) | ~~Repo names~~ **confirmed** | That coach supply can be recruited ahead of student demand |
| PayMongo is the gateway; cards + GCash + Maya + GrabPay | Specific AWS services (ECS Fargate, S3, CloudFront) — charter says only "AWS" and "Docker"; the database is **Neon**, not RDS ([ADR-0016](ADR-0016-neon-postgres-not-rds.md)) | Retention windows in `erd.md`. Every one is an assumption |
| PostgreSQL, AWS, Docker, React/TS/Vite/TanStack/Tailwind | Auth is self-implemented — the charter names no auth provider; Postgres is hosted on Neon, one component off AWS (ADR-0016) | That one developer can deliver four modules across two repos on the charter's milestones |
| Scope excludes scholarships, grants, full-time jobs | Milestone dates — three are in the past relative to the charter; the rest are TBD | "Blockchain components" as a real requirement |
| Five-person team and their roles (charter §IV) | Rate limits in `api-spec.md` | That a coaching session can be delivered at all — no provider, no join path, no cancel path exists (ADR-0012) |
| v1 scope is 17 features (ADR-0010) | Fixed cost ≈ ₱6,000–7,500/month — estimated, not quoted (ADR-0014); stale since the RDS→Neon move (ADR-0016) and unrecomputed | That batched coach payouts stay outside BSP/AMLA scope (ADR-0013) |

## 3. Pivots & decisions (newest first — cite ADR)

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

**Every doc in this suite is currently `Draft`. No CRs exist yet.** The first CR becomes due when
the team locks the PRD. The 2026-09-08 review edits therefore needed no CR — they are recorded as
ADRs and as the §3 pivot above.

Copy this shape (from `fmd/templates/change-record.md`):

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
| Computing `coach_payout` as 95% of price | Rounding both halves independently makes some prices unrepresentable — ₱499.90 fails (ADR-0007) | Never. It is arithmetically wrong |
| Treating booking-write and intent-creation as atomic | A Postgres transaction cannot span an HTTP call (ADR-0008) | Never |
| HEI / CHED SIPP compliance features | No HEI role in the charter; Vocation is not in the regulatory path | A university partnership makes the internship office the buyer |

## 6. Open items / risks

Ranked by consequence, not by ease.

1. **A coaching session has no delivery mechanism.** `booking.join_url` is produced by nothing and
   `booking_status = cancelled` is set by nothing, so a confirmed booking cannot be attended or
   cancelled — while payment is captured before delivery with no delivery evidence.
   [ADR-0012](ADR-0012-session-delivery-model.md) **blocks Wave 3.**
2. **Payouts force a ledger the ERD lacks, and refunds are unrepresentable.** PayMongo has no
   Connect equivalent, so payouts are manual and must be batched (per-booking transfer cost exceeds
   the commission). No `payout_batch`, no `ledger_entry`, no `refunded_amount`.
   [ADR-0013](ADR-0013-payout-ledger-and-payment-states.md) **blocks Wave 4.**
3. **`payment_status` cannot express failure or expiry**, so failed bookings stay `pending` forever
   and the reconciler polls dead intents. The enum is otherwise immutable — add the values before
   go-live. ADR-0013.
4. **PayMongo merchant onboarding is unowned**, needs PH business registration, a bank account and
   KYC, and requires the S-014–S-017 policy pages live. Weeks of external lead time, no code
   dependency. `implementation-plan.md` TASK-080.
5. **The 5% take rate may be structurally unprofitable on card payments.** Published PayMongo card
   fees (≈3.5% + ₱15) exceed a 5% take below ≈₱1,000 per session. **Parked by the owner.**
   ADR-0005, PRD Q8.
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
12. **`openapi.yaml` does not exist**, so the two repositories are coupled only by prose —
   load-bearing under ADR-0011. api-spec Q1, TASK-011.
13. **No `qa-test-plan`.** 48 test paths, 0% covered, and four would fail silently: EV-004, EV-006,
   EV-010 and the ₱499.90 constraint case. The workbook's per-criterion tracker still has nowhere
   to live. **Highest-value missing document.**
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
