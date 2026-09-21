<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0017 — Jia ingestion: pull-and-store, not live proxy

- **Date:** 2026-09-13
- **Status:** Accepted

## Context

Jia is a partner listings feed named in `implementation-plan.md`'s Sprint 2 outcome and the
Sprint 0 PM task list ("Draft ADR-0017: Jia ingestion: pull-and-store, not live proxy"), but the
decision itself was never written down — `docs/index.md` §3 and `adr/README.md` §0 have never
listed an ADR-0017, even though five other docs cite it by number. This closes that gap at the
point the ingestion code (`internal/internships/jia.go`, `cmd/jiasync`) is actually implemented.

`implementation-plan.md`'s existing "Jia: ingest, do not proxy" section already states the working
model this ADR formalizes:

- API arrives late → seeded/manually-authored rows still carry the demo
- API arrives → real listings appear with no code change on the Directory side
- Jia has an outage → the demo does not care, because nothing at request time depends on Jia being
  reachable

Jia API access itself remains an external dependency the team does not control
(`implementation-plan.md` Open Items: "Jia API access (requested)... degrades safely").

## Options considered

1. **Ingest, do not proxy.** A sync job pulls Jia's feed on a schedule and upserts each listing
   into our own `internship` table with `source='jia'`. `GET /internships` (API-001) always queries
   this table, never Jia, regardless of a row's origin. Pros: the Directory's availability and
   latency never depend on Jia's; an admin-authored row and a Jia row are indistinguishable to every
   read path; ingestion access can arrive at any point without a code change. Cons: a sync delay
   means Jia's listing edits are not instant — bounded by how often the job runs, not real-time.
2. **Live proxy.** `GET /internships` calls Jia directly (or merges a live call with our own rows)
   at request time. Pros: no staleness window. Cons: makes Jia's uptime and latency load-bearing for
   our own Directory, in front of a partner audience, for a demo date we do not control the risk on;
   couples our response shape to whatever Jia returns instead of our own contract.

## Decision

**Option 1.** `internal/internships/jia.go` defines `JiaListing`, a `JiaClient` interface
(`FetchListings`), and `Ingest`, which upserts each listing via `IngestRepository.UpsertJiaListing`
— keyed by a partial unique index on `(source, external_id)` (migration 0008) so re-running the
job is idempotent. `cmd/jiasync` is a one-shot binary meant to be invoked by an external scheduler;
there is no in-process cron in this modular monolith, matching `onboarding.md`'s note that no ops
role exists to run one. One listing's ingestion failure does not abort the run — Jia's feed is
large and heterogeneous, and a single malformed row must not withhold every other row from the
Directory.

With `JIA_API_BASE_URL` unset, `HTTPJiaClient.FetchListings` returns an empty feed rather than an
error, so `cmd/jiasync` is safe to schedule before real API access ever arrives (the same
"degrades safely" property `implementation-plan.md` already committed to).

Jia's actual API contract has not been provided to this codebase as of this ADR — `jiaListingDTO`
in `jia_client.go` is a best-effort guess at field names, isolated behind the `JiaClient`
interface so `Ingest`'s upsert/dedupe logic is fully tested against a fake client and needs no
changes once the real contract is confirmed; only `jia_client.go`'s DTO mapping is expected to
change.

## Consequences

- **Easier:** the Directory's read path (`internal/internships/repository.go`) needed no change at
  all — `source`, `external_id`, `source_url`, and `last_synced_at` are additive columns a
  `GET /internships` row simply carries.
- **Harder:** a Jia listing's edit upstream is only as fresh as the last successful sync; there is
  no live-diff or webhook path from Jia's side today.
- **Owed:** `jia_client.go`'s DTO shape needs a real pass once Jia's actual API contract is
  available; a real external scheduler (cron, EventBridge, etc.) needs to invoke `cmd/jiasync` —
  none exists yet, tracked with the rest of the `ops.md` gap (`onboarding.md`).
