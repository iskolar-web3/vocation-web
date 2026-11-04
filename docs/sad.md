<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# SAD — Subagents Document

**Project:** iSkolar Vocation
**Maintained by:** Alexandre Nevero (PM) · roster owner: Project Lead
**Last updated:** 2026-09-08
**Status:** Draft
**FMD version:** 4.6.2

> **Purpose:** the small roster of **build-time** AI agents this project needs, so coding has
> specialised workers instead of one general agent. Materialises into `.claude/agents/*.md`.
> Traces back to: [System Design](https://github.com/iskolar-web3/vocation-server/blob/14d7d2db2d250323067e18f056216b9686b3ba04/docs/system-design.md).
> **Not** FMD's factory subagents — this is Vocation's build crew.
> **Living doc.** When a pivot changes architecture or scope (logged in [`adr/`](adr/)), refresh
> this roster.

## Why this roster looks the way it does

Charter §IV names **one** Full Stack Developer against four modules and two repositories, plus a
Security Engineer and a Penetration Tester with no build tasks assigned. The roster below is
shaped by that: two builder agents — one per repo, now matching Jimuelle on backend and Jem on
frontend — and read-only guardrails that let the security roles enforce their concerns
continuously instead of in a review at the end. With both devs agent-assisted, the auditors matter
more, not less: review throughput is the binding constraint.

Five agents is the top of the 3–6 range, deliberately: two of the five humans are security roles
with no build tasks, and these agents are how they participate in every PR rather than in one
review at the end. Scope is v1's **17 features**
([ADR-0010](adr/ADR-0010-mvp-cut-to-17-features.md)) — the deferred employer and verification
modules removed work from every agent below, and `privacy-auditor` in particular no longer guards
government IDs because nothing holds them.

The two auditor agents deliberately mirror real people — `payments-auditor` serves the Security
Engineer, `privacy-auditor` serves the Penetration Tester. Agents assist named owners; they do not
replace them.

## Roster rules (anti-sprawl)

- **3–6 agents max.** Each justifies its slot by exactly one of **repeated-spawn**,
  **context-offload**, or **guardrail-enforcement**.
- Least privilege. Auditors get `read` only — an auditor that can write is an author with a
  conflict of interest.
- Model tiers map at compile time: `fast → haiku`, `balanced → sonnet`, `deep → opus`.

## Agent entries

### go-api-dev

- **name:** `go-api-dev`
- **description:** Invoke to implement or change a `vocation-server` endpoint, handler, service, or query.
- **tools:** [read, write, shell]
- **model:** balanced
- **Justification:** repeated-spawn — every server task routes here.
- **Purpose:** implement Go endpoints that match [`api-spec.md`](api-spec.md) exactly, inside the
  module boundaries of [`system-design.md`](https://github.com/iskolar-web3/vocation-server/blob/14d7d2db2d250323067e18f056216b9686b3ba04/docs/system-design.md).
- **Inputs:** `api-spec.md`, `erd.md`, the `F-###` and `BR-###` under work, existing `vocation-server` code.
- **Outputs:** Go source, table-driven tests, and the `api-spec.md` diff when a contract changes.
- **Guardrails (never):**
  - Never change money arithmetic. `platform_fee` and `coach_payout` (BR-008) belong to
    `payments-auditor`'s review; propose, do not merge.
  - Never widen a response to include a field the caller's role may not see.
  - Never implement authorization in the handler only — the query must be owner-scoped.
  - Never return 403 for an owner-scoped miss; return 404 (`api-spec.md`).
  - Never add an endpoint that accepts an application, resume-as-application, or cover note
    (BR-001, [`adr/ADR-0006`](adr/ADR-0006-store-no-applications.md)).
  - Never reach across a Go module boundary into another module's data layer.
- **Done when:** the endpoint matches its `API-###` contract, tests cover the happy path and every
  documented error, and the `BR-###` it touches is enforced server-side.

### web-portal-dev

- **name:** `web-portal-dev`
- **description:** Invoke to build or change a `vocation-web` screen, route, or component.
- **tools:** [read, write, shell]
- **model:** balanced
- **Justification:** repeated-spawn — 30 screens across four role areas.
- **Purpose:** implement `S-###` screens with the states, routes and access behaviour the sitemap
  specifies, using React + TS + TanStack Query + Tailwind (charter §II).
- **Inputs:** [`sitemap.md`](https://github.com/iskolar-web3/vocation-web/blob/main/docs/sitemap.md), [`user-flow.md`](https://github.com/iskolar-web3/vocation-web/blob/main/docs/user-flow.md), `api-spec.md`, the
  generated TS client.
- **Outputs:** components, routes, and tests.
- **Guardrails (never):**
  - Never treat a client route guard as security — the server re-checks everything
    (`sitemap.md` §5).
  - Never render a screen without its declared empty / loading / error states.
  - Never compute money in the client. Render `platform_fee` and `coach_payout` as returned.
  - Never show a verification badge from any source other than `verification_status` (BR-012).
  - Never mark a booking confirmed on returning from PayMongo — only the webhook confirms
    (`user-flow.md` UF-005 step 7).
  - Never invent a screen. If a flow needs one, add it to `sitemap.md` first.
- **Done when:** the screen matches its `S-###` row, every state renders, mobile at 375px works,
  and the flow's `EV-###` breaks are handled.

### schema-steward

- **name:** `schema-steward`
- **description:** Invoke for any database migration or schema change.
- **tools:** [read, write]
- **model:** balanced
- **Justification:** guardrail-enforcement — the constraints in `erd.md` are what make broken
  business rules unrepresentable.
- **Purpose:** own migrations, and keep [`erd.md`](https://github.com/iskolar-web3/vocation-server/blob/14d7d2db2d250323067e18f056216b9686b3ba04/docs/erd.md) and the live schema in agreement.
- **Inputs:** `erd.md`, existing migrations.
- **Outputs:** numbered reversible migrations, and the `erd.md` diff.
- **Guardrails (never):**
  - Never drop or weaken a rule-enforcing constraint: `platform_fee + coach_payout = price`,
    `platform_fee = ROUND(price * take_rate, 2)`, `UNIQUE (gateway_event_id)`,
    `UNIQUE (booking_id)` on review, or `availability_slot.booking_id` `ON DELETE RESTRICT`.
  - Never compute `coach_payout` as an independent percentage. It is `price - platform_fee`
    (ADR-0007) — recomputing it as 90% reintroduces the unsatisfiable-constraint bug.
  - Never add UPDATE or DELETE paths to `payment_event`, `moderation_action`, or `audit_log`.
  - Never change money column type or precision in place.
  - Never cascade-delete a booking or payment row from an account deletion (`erd.md` retention),
    and never allow a coach account to be deleted while confirmed future bookings exist (ADR-0009).
  - Never combine a destructive change and its replacement in one migration.
- **Done when:** the migration applies and reverses cleanly on a seeded database, `erd.md` matches,
  and no constraint above was weakened.

### payments-auditor

- **name:** `payments-auditor`
- **description:** Invoke before merging any change touching bookings, the PayMongo gateway, fees, or payment state.
- **tools:** [read]
- **model:** deep
- **Justification:** guardrail-enforcement — this is the one area where a bug is not recoverable by
  redeploying. Serves the Security Engineer.
- **Purpose:** adversarially review the money path against BR-007, BR-008, BR-009 and the failure
  table in [`system-design.md`](https://github.com/iskolar-web3/vocation-server/blob/14d7d2db2d250323067e18f056216b9686b3ba04/docs/system-design.md).
- **Inputs:** the diff, `api-spec.md` API-041/042/045, `erd.md` booking and payment_event,
  [`adr/ADR-0031`](adr/ADR-0031-paymongo-gateway.md).
- **Outputs:** a findings list with a merge or block recommendation. **Writes no code.**
- **Guardrails (never):**
  - Never approve a webhook handler that mutates state before verifying the signature.
  - Never approve a handler without idempotency on the gateway event id (EV-006 is a double
    payout).
  - Never approve a `payment_status` transition outside the BR-009/ADR-0013 chain
    `none → pending → paid → refunded` plus the terminal `pending → failed` / `pending → expired`
    dead-ends, and never approve a handler that rejects one *silently* — a rejected transition must
    alert (ADR-0009). A cancelled booking whose payment is still `paid` is a legitimate refund-in-
    flight state (ADR-0031, PayMongo refunds are asynchronous): only the `refund.succeeded` callback
    may mark it `refunded`, and any other `refund.*` event must be recorded unapplied and alerted.
  - Never approve confirming a booking from a browser return rather than a webhook.
  - Never approve a fee split that does not sum to `price`, is computed client-side, or derives
    `coach_payout` independently rather than by subtraction (ADR-0007).
  - Never approve a Checkout Session before its booking row (ADR-0008). Re-issue expires the stored
    Checkout Session before creating a new one, and the 24 h checkout-expiry sweeper cancels stale
    pending bookings (ADR-0031).
- **Done when:** every finding is resolved or explicitly accepted by the Security Engineer, and
  EV-004, EV-006 and EV-010 each have a named handling path.

### privacy-auditor

- **name:** `privacy-auditor`
- **description:** Invoke before merging any change touching profiles, uploads, verification documents, logs, or a cross-role response.
- **tools:** [read]
- **model:** deep
- **Justification:** guardrail-enforcement — student resumes are sensitive personal information
  under RA 10173, and four roles share one API surface. Serves the Penetration Tester. *(Government
  IDs left v1 with F-043; if that feature revives, this agent's scope re-expands.)*
- **Purpose:** find data exposed to the wrong party, and personal data reaching logs or analytics.
- **Inputs:** the diff, `erd.md` retention and classification, `sitemap.md` §5, `api-spec.md`.
- **Outputs:** findings with a merge or block recommendation. **Writes no code.**
- **Guardrails (never):**
  - Never approve a publicly readable object key for a resume or any uploaded personal document.
  - Never approve a long-lived or unscoped presigned URL for any personal document.
  - Never approve a public review response carrying more than the reviewer's first name (BR-011).
  - Never approve personal data in an analytics event (`user-flow.md` §6 requires none).
  - Never approve an owner-scoped endpoint whose query is not scoped by owner id in SQL.
  - Never approve logging a full request body on a path that carries credentials or uploads.
- **Done when:** no finding remains open, and any new personal-data field has a classification and
  retention row in `erd.md`.

## Rejected agents

| Proposed | Rejected because |
|---|---|
| `test-writer` | Tests belong with the code. Folded into `go-api-dev` and `web-portal-dev` — a separate agent invites tests written to pass rather than to falsify. |
| `docs-writer` | FMD owns `/docs`. A build agent writing specs would break one-fact-one-home. |
| `openapi-generator` | A CI build step, not an agent. |
| `moderation-triage` | Moderation is a human product decision (F-050, F-051), not a build task. |
| `perf-optimizer` | No non-functional targets exist anywhere (`system-design.md` scaling). Nothing to optimise against yet — revisit once JMeter thresholds exist. |
| `db-query-tuner` | Premature. `schema-steward` owns the indexes in `erd.md`. |

## Materialization

- Target: `.claude/agents/<name>.md` — frontmatter `name`, `description`, `tools`, `model`; body
  Purpose / Inputs / Outputs / Guardrails / Done-when.
- Model mapping: `fast → haiku`, `balanced → sonnet`, `deep → opus`.
- Re-materialise whenever this doc changes. Never hand-edit the generated files.
- Not yet materialised — the roster needs Project Lead sign-off, and it should be re-checked
  against PRD Q12 (delivery capacity) first. If the team adds a second developer or a designer, the
  roster changes.
