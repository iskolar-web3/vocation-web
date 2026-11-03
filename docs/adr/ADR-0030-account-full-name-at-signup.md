<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0030 — Optional `account.full_name` captured at signup

- **Date:** 2026-10-07
- **Status:** Accepted

## Context

The web client signs up with `POST /auth/signup` (API-020) and its body includes `full_name`
alongside `email`, `password` and `role`. The handler decoded that body with a strict decoder that
rejects unknown fields (`decodeStrict`), and `signupRequest` had no `full_name` field, so **every**
web signup failed with `400 "That request could not be read."` — issue #58.

There was nowhere to put the name even if it had been accepted: the `account` table
(migration 0002) has `email`, `password_hash`, `google_sub`, `role` and timestamps, but no name
column. The student's real name lives in `student_profile.full_name`, but that row only exists after
onboarding (API-030), which happens *after* signup. So a name captured at signup has no home today,
and dropping the field would silently lose the name the web client already collects.

Student onboarding still requires `student_profile.full_name`; nothing here changes that. This ADR
only gives the pre-onboarding signup name a place to live.

## Options considered

1. **Reject and remove `full_name` from the web signup payload.** Smallest change. Cons: the client
   already collects and sends it, and the information is lost between signup and onboarding.
2. **Store the signup name in a new optional `account.full_name` (chosen).** One nullable column,
   captured once at signup, with bounded length and a blank-means-absent rule.
3. **Make `account.full_name` required.** Cons: Google sign-up and future password-only flows would
   have to invent a name, and API-020 has not required one before; a required name also conflicts
   with the account row being otherwise name-free.
4. **Write directly to `student_profile.full_name` at signup.** Cons: the profile row is created at
   onboarding with other required fields, and a partial profile row would blur the
   account/profile boundary and the onboarding-complete signal.

## Decision

**Add an optional, nullable `account.full_name`** (migration 0018). The value is trimmed; 1–120
characters is the only accepted shape (`char_length(btrim(full_name)) BETWEEN 1 AND 120`, checked in
both the handler and a database CHECK). A blank value is treated as absent and stored as `NULL`; the
field is optional on API-020, so callers that omit it are unaffected. `full_name` is accepted and
stored only — this decision does not change the signup/signin/`GET /me` account response.

`student_profile.full_name` remains the authoritative student name once the profile exists: student
onboarding (API-030) still requires it, and `GET /me` prefers the profile name over
`account.full_name` when both are present. The account value is only the pre-onboarding fallback.

## Consequences

- **Easier:** web signup succeeds again; the name the client already collects survives until
  onboarding, instead of being lost or forcing a client change. Google sign-up is unchanged — it
  passes no name.
- **Harder:** there are now two places a name can live, so read paths must prefer
  `student_profile.full_name` and treat `account.full_name` as a fallback. This ADR does not add the
  `GET /me` change that reads it; that is a separate task.
- **Personal data:** `account.full_name` is personal data under RA 10173. [ADR-0025](ADR-0025-account-deletion-anonymisation.md)
  already requires account erasure to remove names; when that erasure is implemented it **must null
  `account.full_name`** alongside `student_profile.full_name`. Migration 0018 is backward compatible
  and **needs no backfill**: existing accounts keep `NULL`.
