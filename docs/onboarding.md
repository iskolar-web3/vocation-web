<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# Onboarding — iSkolar Vocation

**Maintained by:** Alexandre Nevero (PM)
**Last updated:** 2026-09-08
**Status:** Draft
**FMD version:** 4.6.2

> **Purpose:** get a teammate or an AI agent productive in a few minutes. It **points**; it does
> not restate. Every fact lives in one canonical doc — see [`index.md`](index.md) §0.
>
> **Read this if you are Jem, Jimuelle, Emmanuel, Louigie or John Richie** and wondering what these
> documents are and which ones are yours.

## What this is

iSkolar Vocation is a mobile-first web platform pairing an internship and OJT directory with a
marketplace of coaches. Students apply on each company's own site — the platform stores no
applications. Revenue is a 10% commission on paid coaching, collected through PayMongo Checkout Sessions.

Full brief: [`../VOCATION.md`](https://github.com/iskolar-web3/vocation-server/blob/main/VOCATION.md). Scope: `Vocation Project Charter.pdf` §II.

## Read first, in this order

Three documents orient everything. Twenty minutes total.

1. **[`index.md`](index.md) §0** — the source-of-truth map. Which document owns which fact. Read
   this before you read anything else, because it tells you where *not* to look.
2. **[`prd.md`](prd.md)** — what we are building. It owns the `F-###` feature ids that every other
   doc and every branch name references.
3. **[`adr/README.md`](adr/README.md)** — why things are the way they are, plus the open risks.
   §6 is the honest list of what is still broken or undecided.

## How this doc set works

Four ideas. Learn these and the rest is navigation.

### 1. One fact, one home

Every concern has exactly one canonical owner, listed in [`index.md`](index.md) §0. Other docs
**link** to it; they never restate it. So screens are only in `sitemap.md`, entities are only in
`erd.md`, and money rules are only in `prd.md`.

**When two docs disagree, the canonical owner wins** until the other is reconciled. If you find a
contradiction, that is a bug in the docs — say so rather than picking one.

### 2. Stable ids are the connective tissue

| Id | Means | Owned by |
|----|-------|----------|
| `F-###` | A feature | [`prd.md`](prd.md) |
| `BR-###` | A business rule the system must enforce | [`prd.md`](prd.md) |
| `UJ-###` | A user journey | [`prd.md`](prd.md) |
| `S-###` | A screen | [`sitemap.md`](https://github.com/iskolar-web3/vocation-web/blob/main/docs/sitemap.md) |
| `UF-###` / `EV-###` | A flow / a way it breaks | [`user-flow.md`](https://github.com/iskolar-web3/vocation-web/blob/main/docs/user-flow.md) |
| `API-###` | An endpoint contract | [`api-spec.md`](api-spec.md) |
| `ADR-####` / `CR-###` | A decision / a change to a locked doc | [`adr/`](adr/) |

**These ids are permanent.** Never renumber one — retire it and add a new one. They are how a
commit, a test, and a spec find each other: a PR that says "F-011, BR-008" is instantly locatable.

### 3. Docs have a lifecycle: Draft → Locked → Superseded

While **Draft**, edit freely. Once **Locked** — agreed and being built against — an edit requires a
**CR** entry in [`adr/README.md`](adr/README.md) §4, so nobody builds against a spec that moved
underneath them.

**Everything is currently Draft.** Recommended lock order is in `adr/README.md` §4:
`prd` → `erd` → `api-spec` → `sitemap` → `user-flow` → `system-design`.

### 4. Decisions get written down

Making a real product, architecture, or scope choice? **Append an ADR.** Chat and Trello comments
are not records. The test: *would a future reader ask "why did we do it this way?"*

## Which docs are yours

| You are | Own | Read closely | Skim |
|---------|-----|--------------|------|
| **Louigie** — Project Lead | [`adr/`](adr/) decisions, [`system-design.md`](https://github.com/iskolar-web3/vocation-server/blob/main/docs/system-design.md), [`api-spec.md`](api-spec.md) contract | `prd.md`, `erd.md`, `sad.md` | `sitemap.md`, `user-flow.md` |
| **Alexandre** — PM | [`../VOCATION.md`](https://github.com/iskolar-web3/vocation-server/blob/main/VOCATION.md), [`prd.md`](prd.md), [`index.md`](index.md), [`implementation-plan.md`](https://github.com/iskolar-web3/vocation-server/blob/main/docs/implementation-plan.md), open questions everywhere | everything | — |
| **Jem** (`jemslzr`) — Frontend | `vocation-web`: screens, routes, `apiFetch` | [`sitemap.md`](https://github.com/iskolar-web3/vocation-web/blob/main/docs/sitemap.md), [`user-flow.md`](https://github.com/iskolar-web3/vocation-web/blob/main/docs/user-flow.md), [`api-spec.md`](api-spec.md) | `prd.md` for `BR-###` |
| **Jimuelle** (`Jimuelle07`) — Backend | `vocation-server`: Go, Neon, migrations | [`api-spec.md`](api-spec.md), [`erd.md`](https://github.com/iskolar-web3/vocation-server/blob/main/docs/erd.md), [`system-design.md`](https://github.com/iskolar-web3/vocation-server/blob/main/docs/system-design.md) | `prd.md` for `BR-###` |
| **Emmanuel** — Security Engineer | `security-compliance` *(not yet written — yours to own)*, `erd.md` retention and classification | [`api-spec.md`](api-spec.md) auth, rate limits; `sitemap.md` §5 | `system-design.md` |
| **John Richie** — Penetration Tester | Threat findings against [`sitemap.md`](https://github.com/iskolar-web3/vocation-web/blob/main/docs/sitemap.md) §5 and [`api-spec.md`](api-spec.md) | `user-flow.md` `EV-###`, `erd.md` classification | `prd.md` |

Emmanuel and John Richie: two agents in [`sad.md`](sad.md) — `payments-auditor` and
`privacy-auditor` — exist to enforce your concerns continuously rather than in one review at the
end. They are read-only by design and report to you.

## Run it locally

The server is runnable today. Full steps live in
[`../README.md#run-it-locally`](../README.md#run-it-locally); in short: `cp .env.example .env`,
then `make db-up` (local Postgres 16), `make migrate-up`, `make seed` and `make run` (listens on
`:8080`). `.env` holds every local setting and the binaries load it themselves. The client is `vocation-web` (`pnpm install && pnpm dev`).

Before your first commit, install [golangci-lint](https://golangci-lint.run/) v2.15.0 and
[Lefthook](https://lefthook.dev/), then run `lefthook install` once in the clone. The hooks run
`gofmt`, `go vet` and golangci-lint before each commit, and the tests and migration-order check
before each push ([`../README.md#git-hooks`](../README.md#git-hooks)). Run
`golangci-lint run ./...` for the whole tree; CI's `lint` job must report 0 issues.

PayMongo's test keys (`sk_test_…`) are the sandbox — use them. **Never point a development
environment at live payment keys** (a live `sk_live_…` key is refused unless
`APP_ENV=production` — [ADR-0031](adr/ADR-0031-paymongo-gateway.md)).

## Where things live

```
vocation/
├── VOCATION.md          THE root input. Part A sizes the build, Part B is the brief
│                        (idea.md was folded in here — ADR-0015)
├── AGENTS.md            agent + contributor guide (start here for conventions)
├── CLAUDE.md            pointer to AGENTS.md
├── docs/
│   ├── index.md         §0 source-of-truth map — READ FIRST
│   ├── prd.md           F-### · BR-### · UJ-### · acceptance criteria
│   ├── system-design.md HLD: components, data flow, tech choices
│   ├── erd.md           entities, constraints, privacy classification
│   ├── sitemap.md       S-### screens, routes, access zones
│   ├── user-flow.md     UF-### journeys, EV-### breaks
│   ├── api-spec.md       API-### contracts — the seam between the two repos
│   ├── sad.md           the build-time agent roster
│   ├── onboarding.md    this file
│   ├── implementation-plan.md   schedule, Gantt, current sprint
│   └── adr/             decisions + ledger + change records
├── Vocation Project Charter.pdf    input
├── Vocation User Stories.xlsx      input (24 stories)
└── fmd/                 ⚠ owner-local factory. Gitignored. Do not commit or read
```

`fmd/` is the private document factory. It is in `.gitignore` and is not part of the shared
surface. You need `docs/` and `AGENTS.md`, nothing else.

## Conventions

- Branch per feature id: `feat/F-011-coach-booking`. Reference the id in the PR title.
- A PR states the `F-###` it serves, the `BR-###` it enforces, and its docs impact (`none` is a
  valid answer).
- Contract changes touch three places: [`api-spec.md`](api-spec.md), `openapi.yaml`, and the code.
  The docs change lands in the same PR.
- Made a real decision? Append an ADR in the same PR.
- Changing a **Locked** doc? Add a CR to `adr/README.md` §4.
- No direct commits to the shared branch.
- Verify framework APIs against the pinned version's docs, not memory. See
  [`../AGENTS.md`](../AGENTS.md) Stack currency.

## Scope: v1 is 17 features, not 25

The charter defines 25. Eight are **Deferred** — employer self-serve (F-030–F-033), coach and
company verification (F-043, F-051, F-052), and programs (F-012). See
[`adr/ADR-0010`](adr/ADR-0010-mvp-cut-to-17-features.md).

Deferred work is **marked in place** across the specs, never deleted, so a struck-through row means
"designed, not built yet". If you are about to build something struck through, stop and check with
the PM. Two consequences worth knowing:

- **Admin creates listings in v1** (F-050, repurposed). There is no employer signup.
- **No verification badges and no government IDs.** That removes the largest RA 10173 exposure from
  v1 entirely.

Three ADRs are **Proposed and block waves**: [ADR-0012](adr/ADR-0012-session-delivery-model.md)
(how a session is joined and cancelled — blocks Wave 3),
[ADR-0013](adr/ADR-0013-payout-ledger-and-payment-states.md) (the payout ledger — blocks Wave 4),
and [ADR-0014](adr/ADR-0014-cost-model-and-nfrs.md) (cost and performance targets).

## What is missing, and who owes it

Being explicit so nobody assumes these exist:

| Missing | Why it matters | Owner |
|---------|----------------|-------|
| **`security-compliance.md`** | Resumes and coach government IDs are sensitive personal information under RA 10173; NPC registration is mandatory past 1,000 data subjects | Emmanuel |
| **PayMongo merchant account** | Live activation needs a DTI/SEC-registered entity, a bank account, KYC, **and live Terms/Privacy/Refund/Contact pages** (S-014–S-017). Weeks of external lead time; **blocks Wave 4** | Alexandre |
| **`design-system.md`** | 30 screens across four role areas will drift. Charter M2 is a full Design milestone with **no named designer** | **Unassigned — PRD Q12** |


## References

- [`index.md`](index.md) — §0 owners
- [`adr/`](adr/) — decisions, ledger, change records; §6 is the live risk list
- [`../VOCATION.md`](https://github.com/iskolar-web3/vocation-server/blob/main/VOCATION.md) — context intake and charter mapping
