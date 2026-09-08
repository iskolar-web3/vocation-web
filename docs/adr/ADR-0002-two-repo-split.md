<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0002 — Two repositories, with the API spec as the only seam

- **Date:** 2026-09-07
- **Status:** Accepted

## Context

Charter §I states the product "is built as two repositories: a client/web app and a server API".
The owner independently described the setup as polyrepo. So the split is given, not chosen.

What *is* open is how the two stay compatible. With one repo, a breaking change to a handler and
its caller land in one commit and CI catches the mismatch. With two, they cannot.

## Options considered

1. **Two repos, contract-first** — `openapi.yaml` in the docs home is the source of truth;
   generate Go server interfaces on one side and a typed TS client on the other. Pros: drift
   becomes a build error. Cons: a generation step, and a third place to change.
2. **Two repos, prose contract only** — `api-spec.md` and discipline. Pros: nothing to set up.
   Cons: drift is silent and found at runtime, by a user.
3. **Monorepo** — contradicts the charter; would allow shared types directly.

## Decision

Keep the two repositories per the charter (`vocation-web`, `vocation-server` — names are
`[assumption]`, see `README.md` §1), and adopt **option 1**: `docs/api-spec.md` governs intent,
a generated `openapi.yaml` governs types, and both repos build against the generated artifacts.

The server must tolerate **one release of client lag**, because the two repos cannot be assumed to
deploy together.

## Consequences

- **Easier:** independent deploy cadence; the client can ship a UI fix without a server release.
- **Harder:** every contract change touches three places. Additive-only changes become the default
  discipline (see `api-spec.md` Versioning).
- **Owed:** `openapi.yaml` does not exist yet (api-spec Q1). Until it does, this ADR is aspirational
  and the split carries option 2's silent-drift risk. Also unresolved: where the canonical `/docs`
  lives, given FMD emits to a single target. Recommendation is a third small docs repo so neither
  application repo owns the shared spec.
