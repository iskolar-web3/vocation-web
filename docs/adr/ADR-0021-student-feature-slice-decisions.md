<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0021 — Student feature slice: `skills`, `completeness_pct`, notification topics, upload caps, and no new AWS SDK dependency

- **Date:** 2026-09-18
- **Status:** Accepted

## Context

Implementing the student self-service surface (API-030/031 profile, API-033 dashboard, API-034–036
saved internships, API-038 settings, API-080 upload presigning) surfaced four gaps neither
`erd.md` nor `api-spec.md` settled on their own:

1. **`skills` is missing from the schema.** `api-spec.md` API-030/031 name `skills` as part of the
   onboarding/edit payload, but migration 0002's `student_profile` table — and `erd.md`'s
   description of it — never had a column for it. Implementing the endpoints literally as specced
   requires either adding the column or silently dropping a named field from a contract.
2. **`completeness_pct` has no equation.** `erd.md` Q2 flags this directly: it's a displayed,
   derived number with nothing pinning down how it's computed.
3. **`notification_preference`'s `topic_*` flags aren't named.** `erd.md` describes the shape
   generically ("`topic_*` flags") without saying which topics exist.
4. **Presigned uploads (API-080) need real size caps and a content-type allowlist**, and this
   codebase has no S3 client of any kind yet — no AWS SDK dependency exists in `go.mod`.

None of these block the slice — each has a reasonable default — but leaving them as inline code
comments buries a real decision where the next person touching this code won't find it.

## Options considered

**For `skills`:**
1. **Add `student_profile.skills text[]`.** Matches `coach_profile.languages`'s existing
   array-column shape for the same "small set of free-text tags" case. No story needs skill-based
   search or filtering yet, so a normalized `skill`/`student_skill` junction table would be
   speculative.
2. **Drop `skills` from the contract instead**, treating `api-spec.md`'s mention as stale prose.
   Rejected — the original task brief explicitly asked for skills capture at onboarding, and the
   feature has a clear, cheap implementation (option 1); there's no reason to defer it.

**For `completeness_pct`:** any monotonic function of which fields are filled in works; picked the
simplest one that gives onboarding itself real weight (a bare-minimum profile is not "0% complete").

**For upload caps and content types:** sized to typical resume PDFs and profile photos; no PRD or
charter number exists to defer to.

**For the S3 client:** evaluated adding `aws-sdk-go-v2`. Rejected for this slice — the only thing
needed is presigned-URL query-string signing (SigV4), which is a self-contained, well-specified
algorithm implementable in ~80 lines against stdlib `crypto/hmac`/`crypto/sha256`. Pulling in the
full SDK (multiple modules: `config`, `credentials`, `service/s3`, `feature/s3/manager`) for one
function is disproportionate, and AGENTS.md's stack-currency table already sets a general bar of
verifying against current docs before adding framework dependencies from memory.

## Decision

1. **`student_profile` gains `skills text[]`** (migration 0012), nullable, no default — same shape
   as `coach_profile.languages`. Wired through `CreateProfileParams`/`UpdateProfileParams` and the
   API-030/031 request/response bodies.
2. **`completeness_pct` = 40% once a profile exists (the four required onboarding fields), + 15%
   each for `bio`, `avatar_key`, `resume_key`, `skills`** (60% available across four optional
   fields, summing to 100%). Recomputed on every `CreateProfile`/`UpdateProfile` call, in the same
   statement — never a background job.
3. **`notification_preference` ships with two named topics: `topic_bookings`, `topic_internships`**,
   plus `channel_email`, all defaulting `true`. Picked as the two categories of notification the
   product currently has any content for (session lifecycle events; new/saved-internship signals) —
   more topics can be added as new notification-worthy events appear.
4. **Upload caps and allowlist:** `resume` ≤ 10 MB, `application/pdf` only; `avatar`/`company_logo`
   ≤ 5 MB, `image/jpeg`/`image/png`/`image/webp`. Enforced server-side against the request's
   declared `size_bytes`/`content_type` before signing.
5. **No AWS SDK dependency.** `internal/uploads/presign.go` hand-rolls SigV4 query-string signing
   against stdlib crypto. `content-type` is included in `X-Amz-SignedHeaders`, so the eventual `PUT`
   is cryptographically bound to the declared content type, not just advisory.

## Consequences

- **Easier:** the onboarding contract is now implemented exactly as `api-spec.md` describes it, with
  no silent field drop; `completeness_pct` and the notification topics stop being open questions;
  uploads work end-to-end without a new dependency to vet and pin.
- **Harder:** `size_bytes`/`content_type` caps are enforced only against what the client *declares*
  in the presign request — a presigned PUT with only `host`+`content-type` signed doesn't
  cryptographically cap the byte count the way an S3 POST policy with
  `content-length-range` would. A client could declare a small size and then stream more bytes on
  the actual PUT. Acceptable for v1 (no story requires hard server-side size enforcement at the
  storage edge yet); flagged here so it isn't mistaken for a guarantee.
- **Owed:**
  1. If skill-based search/filtering becomes a story, revisit `skills text[]` vs. a normalized
     table — the array shape doesn't support efficient "students with skill X" queries.
  2. `completeness_pct`'s equation still wants a home in a `methods.md` doc once one exists
     (`docs/index.md` §4's `methods.md` gap).
  3. If upload volume or abuse ever requires hard size enforcement, add an S3 POST policy with
     `content-length-range` conditions instead of a bare presigned PUT.
- **Propagation:** `erd.md`'s `student_profile` and `notification_preference` rows, and Q2, are
  updated to match. `api-spec.md` API-080 gains the per-purpose cap/content-type table.
