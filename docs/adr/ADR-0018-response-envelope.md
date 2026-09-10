<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0018 — Response envelope: `{ message, data, meta }`

- **Date:** 2026-09-10
- **Status:** Accepted
- **Supersedes:** the list-response shape in `api-spec.md` §Overview and the error body in
  `api-spec.md` §Error codes

## Context

Two live documents specified **different response envelopes**, and both developers were about to
build against them on the same day.

| Source | Success shape |
|---|---|
| `api-spec.md` §Overview | `{ data: [], meta: { page, per_page, total } }` |
| `AGENTS.md` + the `academy-web` pattern | `{ message, data }` |

The conflict is not cosmetic. Under [ADR-0002](ADR-0002-two-repo-split.md) the API spec is the only
coupling between `vocation-server` and `vocation-web`, and under
[ADR-0011](ADR-0011-spec-sync-per-repo-ownership.md) the two repos have no shared build step. Jem
writes a Zod schema from the spec while Jimuelle writes the handler to the same row — so a
disagreement about the wrapper surfaces as a failed boundary parse at integration, not at review.

A **second, quieter conflict** sat underneath it. `api-spec.md` nests the human-readable string
inside the error object:

```json
{ "error": { "code": "conflict", "message": "...", "details": {} } }
```

while `academy-web`'s `apiFetch` throws `body.message` — top level. Fixing only the success shape
would have left every error path silently broken, which is worse than the original conflict because
error paths are exercised late.

## Options considered

1. **`{ message, data, meta }` with `message` top-level on errors too.** Pros: one wrapper for every
   response, success and error; `academy-web`'s existing `apiFetch` works unchanged, including its
   `body.message` throw; `meta` slots in without disturbing anything. Cons: `message` is mildly
   redundant on a successful response.
2. **Adopt `api-spec.md`'s `{ data, meta }` and drop `message`.** Pros: no redundant field. Cons:
   requires rewriting `apiFetch` away from the house pattern that `academy-web` already runs in
   production, and leaves errors with no agreed top-level display string.
3. **Adopt `{ message, data }` and put pagination inside `data`.** Pros: smallest change to the
   client. Cons: `data` stops being purely the payload — a list response becomes
   `data: { items, page, total }`, so every list schema nests one level deeper for no benefit.

## Decision

**Option 1.** Every response carries the same wrapper.

**Success, single resource**

```json
{ "message": "ok", "data": { "slug": "backend-intern", "title": "Backend Intern" } }
```

**Success, list** — `meta` is present on list responses only

```json
{
  "message": "ok",
  "data": [ { "slug": "backend-intern" } ],
  "meta": { "page": 1, "per_page": 20, "total": 137 }
}
```

**Error** — `data` is `null`, `message` is the safe display string, `error.code` is the machine key

```json
{
  "message": "That slot is no longer available.",
  "error": { "code": "conflict", "details": { "slot_starts_at": "2026-09-20T09:00:00Z" } }
}
```

Rules:

- `message` is **always present** and **always safe to display to a user**. Never leak internals.
- `data` is the payload, or `null` on error.
- `meta` appears **only** on list responses. F-002 requires a result count, so `total` is mandatory
  there, not optional.
- `error` appears **only** on non-2xx. `error.code` is the stable machine value from
  `api-spec.md` §Error codes; `error.details` is field-level for form errors.
- An empty list is `200` with `data: []` and `meta.total: 0` — never `404`, never `500`.

## Consequences

- **Easier:** `academy-web`'s `apiFetch` is reusable as-is, including the `body.message` throw on
  non-ok, so Jem ports rather than rewrites. One Zod wrapper schema covers every endpoint, with the
  per-endpoint schema slotting into `data`.
- **Harder:** `message` on a successful response is a field nobody reads. Accepted as the price of a
  single uniform shape.
- **Owed:** `api-spec.md` §Overview and §Error codes both updated. `vocation-web/AGENTS.md`
  restated. Any endpoint example added later must carry the wrapper.
- **Contract test:** Jem's Zod boundary parse is what enforces this. A handler that returns a bare
  array fails loudly in dev rather than silently at demo.
