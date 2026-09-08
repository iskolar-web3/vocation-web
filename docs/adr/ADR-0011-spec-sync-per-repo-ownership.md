<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0011 — Spec sync: separate specs per repo, single ownership per document

- **Date:** 2026-09-08
- **Status:** Accepted
- **Amends:** [ADR-0002](ADR-0002-two-repo-split.md)

## Context

The product is built as two repositories (charter §I): `iskolar-web3/vocation-server` and
`iskolar-web3/vocation-web`. Both were empty at the time of this decision.

The stated requirement is narrow and specific: **Claude Code agents working inside each repo must be
able to read the specs with no human copy step.** Humans reading on GitHub and build-time code
generation were both explicitly ruled out as drivers. That means specs must be real files in each
working tree, not merely reachable.

The org already runs this pattern in `iskolar-web3/academy-web`, and it has already failed there:
`academy-web`'s `CLAUDE.md` references a sibling repo as `D:/GithubRepo/iskolar-main/web/`, a
machine-specific absolute path, and notes that the live route map "is not tracked here."

## Options considered

1. **A third `vocation-docs` repo, mirrored into both by CI.** Pros: one canonical home; agents get
   real files on a plain clone; always fresh. Cons: an Action and a token; a bot commit per docs
   change in two repos.
2. **A monorepo.** Pros: eliminates the problem class entirely; no sync machinery ever. Free while
   both repos were empty. Cons: contradicts charter §I.
3. **Git submodule of a docs repo.** Pros: truest single source, version-pinned. Cons: a plain
   `git clone` leaves `docs/` **empty**, so an agent silently works with no specs — the worst
   possible outcome when agents are the only consumer.
4. **Separate specs per repo.** Pros: no machinery at all. Cons: the shared documents are the ones
   that drift, which is exactly `academy-web`'s failure.

## Decision

**Option 4, with single ownership per document rather than duplication.** Chosen by the owner over
option 1 (recommended) and option 2.

Naive option 4 copies every document into both repos, leaving six free to drift. Instead each
document has exactly one owning repo, and a repo carries a document it does not own only where an
agent cannot work without it:

| Document | Owner | `vocation-server` | `vocation-web` |
|---|---|---|---|
| `api-spec.md`, `openapi.yaml` | server | canonical | mirror (read-only) |
| `prd.md`, `adr/`, `index.md` | server | canonical | mirror (read-only) |
| `erd.md`, `system-design.md`, `implementation-plan.md` | server | canonical | — |
| `sitemap.md`, `user-flow.md` | **web** | — | canonical |
| `onboarding.md`, `sad.md` | server | canonical | mirror |
| `VOCATION.md` | server root | canonical | — |

**The mirror set is four things**, one of them generated. Down from every document.

Two guards make this version defensible:

- **Drift guard.** CI in `vocation-web` re-runs `scripts/sync-docs.sh` and fails if the tree differs
  or `docs/.synced-from` is behind `vocation-server/main`. Without it, this degrades into
  `academy-web`'s state.
- **Anti-fork guard.** Every mirrored file carries a `MIRRORED … do not edit here` banner, and
  `vocation-web/AGENTS.md` forbids editing any file bearing it. With the files sitting in the tree,
  an agent will otherwise edit the copy.

## Consequences

- **Easier:** no third repo, no submodules, no bot tokens. Each repo owns the documents describing
  the surface it builds.
- **Harder:** four artifacts are duplicated, and the drift guard is now load-bearing rather than
  nice-to-have. If the guard is skipped, this decision reproduces a known production failure in this
  org. That risk was accepted knowingly.
- **Owed:** repo name `vocation-server` → `vocation-server` throughout; `index.md` §0 gains an owning-repo
  column; `sync-docs.sh`, the banners and the drift-guard CI become explicit tasks.
