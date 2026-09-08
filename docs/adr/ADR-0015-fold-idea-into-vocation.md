<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0015 — `VOCATION.md` folded into `VOCATION.md`

- **Date:** 2026-09-08
- **Status:** Accepted

## Context

The project root carried two documents with adjacent jobs:

- `VOCATION.md` — the FMD context block. Owns how big the build is: team, mode, build type, time
  budget, and the flags that select the document set.
- `VOCATION.md` — the FMD seed brief. Owns the problem, the segment, the value proposition, and the
  `F-###` feature spine that every other document cites.

Both are **inputs**, not generated documents. Both are read at the same moment, by the same reader,
answering one question: what is this and how big is it. `index.md` §0 listed them as two separate
canonical owners, which meant a reader had to know which of two root files held which half of the
brief.

FMD's input contract names `VOCATION.md` specifically. That contract matters while the factory is
generating; it has generated, and the emitted suite is now the artifact the team works from.

## Options considered

1. **Fold `VOCATION.md` into `VOCATION.md` as Part B.** Pros: one root document, one place a newcomer
   starts; the context flags and the problem they size sit together. Cons: 16 cross-references across
   9 files have to be rewritten, and re-running the FMD factory would need `VOCATION.md` reconstituted.
2. **Keep both.** Pros: matches FMD's input contract exactly; no reference churn. Cons: two root
   inputs with no obvious boundary between them, and `index.md` §0 carries two rows for what a reader
   experiences as one document.
3. **Fold the other way — `VOCATION.md` into `VOCATION.md`.** Pros: same consolidation. Cons: the file
   would be named for the brief while mostly holding intake configuration, and `VOCATION.md` is the
   name the owner chose for the root document.

## Decision

**Option 1.** `VOCATION.md` becomes the single root input, structured in two parts:

- **Part A — Context intake.** The frontmatter block, why each field is set as it is, the selected
  document set, and the charter mapping.
- **Part B — Seed brief.** Problem, segment, evidence, root cause, market, value proposition, the
  `F-###` feature set, success metrics, constraints and kill criteria, out of scope.

`VOCATION.md` is deleted. Section references change from `idea.md §N` to `VOCATION.md §BN` — so
`idea.md §7` (the feature set) becomes **§B7**, and `idea.md §9` (kill criteria) becomes **§B9**.

## Consequences

- **Easier:** one root document. A newcomer reads `VOCATION.md` then `docs/index.md` §0, rather than
  choosing between two root files.
- **Harder:** re-running the FMD factory would require reconstituting `VOCATION.md` from Part B, since the
  input contract names that filename. Acceptable — the factory has already run and `fmd/` is
  owner-local.
- **Owed:** all 16 `VOCATION.md` references updated across `AGENTS.md`, `docs/index.md`, `docs/prd.md`,
  `docs/onboarding.md`, `docs/user-flow.md`, `docs/adr/README.md`, `ADR-0005` and `ADR-0006`;
  `index.md` §0 collapses two rows into one.
