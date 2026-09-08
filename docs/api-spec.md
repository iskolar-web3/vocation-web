<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# API Specification

**Project:** iSkolar Vocation
**Maintained by:** Alexandre Nevero (PM) · contract owner: Project Lead
**Last updated:** 2026-09-08
**Status:** Draft
**FMD version:** 4.6.2

> **Purpose:** the contract between `vocation-web` and `vocation-server`. Because the charter splits
> the product into two repositories, **this document is the only coupling between them** — see
> [`adr/ADR-0002`](adr/ADR-0002-two-repo-split.md).
> Traces back to: [System Design](https://github.com/iskolar-web3/vocation-server/blob/main/docs/system-design.md), [ERD](https://github.com/iskolar-web3/vocation-server/blob/main/docs/erd.md).
>
> `API-###` ids are permanent. Every operation names the `F-###` it serves so a test can trace
> endpoint → feature → rule.
>
> **v1 is 17 features.** Operations serving the eight deferred features
> ([ADR-0010](adr/ADR-0010-mvp-cut-to-17-features.md)) are marked **Deferred** in place, not removed.
> A Deferred operation is not implemented and not in `openapi.yaml`.

## Overview

- **Base URL:** `https://api.vocation.iskolar.io/v1` `[assumption]` — no domain is named in the
  charter.
- **Transport:** HTTPS only. JSON request and response bodies, `application/json`.
- **Versioning:** major version in the path (`/v1`). See Versioning below.
- **Machine-readable spec:** an `openapi.yaml` **must** live beside this file in the docs home and
  be the generated artifact both repos build against — Go server interfaces on one side, a typed
  TypeScript client on the other. This prose document governs *intent*; the YAML governs *types*.
  It does not exist yet. See Q1.
- **Money:** all amounts are integer **centavos** in the wire format (`price_centavos`), never
  floats. PHP only. The database stores `numeric(12,2)`; the boundary converts.
- **Pagination:** `?page` (1-based) and `?per_page` (default 20, max 100). List responses carry
  `{ data: [], meta: { page, per_page, total } }`. F-002 requires a result count, so `total` is
  mandatory, not optional.
- **Timestamps:** RFC 3339 UTC.

## Authentication & authorization

Three distinct authentication schemes:

| Scheme | Used by | Mechanism |
|--------|---------|-----------|
| **Session cookie** | All browser calls | `HttpOnly`, `Secure`, `SameSite=Lax`, server-side session. `SameSite=Lax` rather than `Strict` so the PayMongo and Google OAuth returns keep the session |
| **None** | Public reads, and `API-003` | Genuinely unauthenticated. BR-002 permits applying without an account |
| **Webhook signature** | `API-045` only | PayMongo signature header, verified before any state change. **Never a session** |

Authorization is checked **server-side on every request**, per role and per record owner.
The client's route guards are UX only ([`sitemap.md`](sitemap.md) §5).

| Role scope | Meaning |
|---|---|
| `public` | No session required |
| `student` / `employer` / `coach` / `admin` | Session with that role |
| `owner` | Session **and** the record belongs to the caller. Failure returns **404, not 403**, so the API never confirms another party's record exists |

## Endpoints / operations

### Public reads

| ID | Method / path | Serves | Auth | Notes |
|----|---------------|--------|------|-------|
| API-001 | `GET /internships` | F-002 | public | Filters + sort + pagination. See detail below |
| API-002 | `GET /internships/:slug` | F-003 | public | Non-`open` → 404 (BR-003) |
| API-004 | `GET /companies` | F-006 | public | `?q`, pagination; includes `open_role_count` |
| API-005 | `GET /companies/:slug` | F-006 | public | Includes the company's `open` internships |
| API-006 | `GET /coaches` | F-010 | public | `?q`, `?expertise`, `?price=any\|free\|paid` |
| API-007 | `GET /coaches/:slug` | F-011 | public | Profile, session types, rating aggregate |
| API-008 | `GET /coaches/:slug/reviews` | F-013 | public | Reviewer **first name only** (BR-011) |
| ~~API-009~~ | ~~`GET /programs`~~ | F-012 | — | **Deferred** (ADR-0010) |
| ~~API-010~~ | ~~`GET /programs/:slug`~~ | F-012 | — | **Deferred** (ADR-0010) |
| API-011 | `GET /landing` | F-001 | public | Featured internships and coaches from **live data**, per F-001's acceptance criteria |
| API-040 | `GET /coaches/:slug/availability` | F-011 | public | `?from`, `?to`. Bookable slots only |

#### API-001 — `GET /internships` — search the directory

- **Serves:** F-002
- **Query:** `q` (role, company, field, location, requirements), `field`, `setup`
  (`remote|hybrid|onsite`), `pay` (`any|paid|unpaid`), `duration`, `sort`
  (`newest|deadline_soon|relevance`), `page`, `per_page`
- **Response 200:** `{ data: [InternshipCard], meta: { page, per_page, total } }` where
  `InternshipCard` carries `slug`, `title`, `company: {name, slug, logo_url}`, `location`,
  `duration_weeks`, `is_paid`, `field`, `deadline` — exactly the card fields F-002 requires
- **Auth:** none
- **Errors:** `422` on an unknown enum value; never `500` on an empty result — an empty page is
  `200` with `total: 0` so the client can render its empty state
- **Note:** `sort=relevance` is accepted but **undefined** (PRD Q5). Until defined it must not
  silently alias `newest` — return `422` rather than lie about ordering

#### API-003 — `POST /internships/:id/apply-click` — record the outbound click

- **Serves:** F-004
- **Auth:** **none** (BR-002)
- **Request:** `{ referrer_surface: "directory" | "detail" | "share" | "cross_sell" }`
- **Response 202:** empty
- **Errors:** `404` if the posting is not `open`
- **Note:** this endpoint records that a student *left*. It **must not** accept a resume, cover
  note, or any application payload — BR-001 and [`ADR-0006`](adr/ADR-0006-store-no-applications.md).
  Rate-limited by IP, since it is unauthenticated

### Authentication

| ID | Method / path | Serves | Auth | Notes |
|----|---------------|--------|------|-------|
| API-020 | `POST /auth/signup` | F-020, F-030, F-040 | public | `{ email, password, role }`. `role` ∈ student/employer/coach — **never** `admin` |
| API-021 | `POST /auth/signin` | same | public | Generic failure message; never reveal whether the email exists |
| API-022 | `POST /auth/google` | same | public | Authorization-code exchange. `{ code, role? }`; `role` only on first signup |
| API-023 | `POST /auth/signout` | — | session | Invalidates server-side |
| API-024 | `POST /auth/password-reset/request` | F-020 | public | **Always `202`**, whether or not the email exists |
| API-025 | `POST /auth/password-reset/confirm` | F-020 | public | Single-use, expiring token |
| API-026 | `GET /me` | F-021, F-031, F-041 | session | Role, onboarding-complete flag, profile stub. Drives the auth-aware navbar |

### Student

| ID | Method / path | Serves | Auth | Notes |
|----|---------------|--------|------|-------|
| API-030 | `POST /me/student-profile` | F-020 | student | Onboarding: school, course, year level, skills |
| API-031 | `PATCH /me/student-profile` | F-023 | owner | Name, school, course, year, skills, bio, avatar, resume keys |
| API-033 | `GET /me/dashboard` | F-021 | student | `{ saved_count, upcoming_sessions_count, completeness_pct }`. **Carries no application data** (BR-014) |
| API-034 | `GET /me/saved` | F-005 | student | |
| API-035 | `PUT /me/saved/:internshipId` | F-005 | student | Idempotent — a repeat save is `200`, not `409` |
| API-036 | `DELETE /me/saved/:internshipId` | F-005 | student | Idempotent |
| API-037 | `GET /me/bookings` | F-022 | student | `?when=upcoming\|past`. Confirmed rows carry `join_url`; `pending` paid rows carry `amount_due_centavos` |
| API-038 | `PATCH /me/settings` | F-023 | owner | Email, password, notification preferences |

### Bookings and payments — the operations where a bug costs money

#### API-041 — `POST /bookings` — create a booking

- **Serves:** F-011 · **Auth:** `student`
- **Request:** `{ coach_slug, session_type_id, slot_starts_at, notes? }`
- **Behaviour (BR-007):**
  - session type is free or an intro call → booking written `status=confirmed`,
    `payment_status=none`. **No PayMongo call.** Response has no `checkout_url`
  - paid → **the booking row is written first**, `status=pending`, `payment_status=pending`, with
    `price_centavos`, `take_rate`, `platform_fee_centavos` = `ROUND(price × take_rate)` and
    `coach_payout_centavos` = `price − platform_fee` stored (BR-008, ADR-0007). **Then** a PayMongo
    Payment Intent is created and its `checkout_url` returned (ADR-0008)
- **Response 201:** `{ booking_id, status, payment_status, price_centavos, platform_fee_centavos,
  coach_payout_centavos, checkout_url? }`
- **Errors:** `409` slot no longer available (EV-008) · `422` slot not in the coach's availability
  · `404` unknown coach or session type · `502` PayMongo unreachable — **the booking row remains,
  `pending`, with no intent.** The student resumes via API-042, and a sweeper resolves rows left
  `pending` with no live intent (ADR-0008)
- **Note on ordering (ADR-0008):** a Postgres transaction cannot span an HTTP call, so both-or-neither
  is not achievable. The booking is written first deliberately: a stuck `pending` booking is visible
  and retryable, whereas a charge with no booking row is not recoverable without manual
  reconciliation.
- **Note:** the fee split is returned so the client never computes money. `platform_fee +
  coach_payout = price` and `platform_fee = ROUND(price * take_rate, 2)` are both database CHECKs
  ([`erd.md`](https://github.com/iskolar-web3/vocation-server/blob/main/docs/erd.md)), so a wrong split cannot persist

#### API-042 — `POST /bookings/:id/checkout` — resume payment

- **Serves:** F-022 · **Auth:** `owner` (the booking's student)
- **Behaviour:** returns a fresh `checkout_url` for a `pending` paid booking. Reuses the existing
  intent when still valid; creates a new one when expired, and **replaces** `paymongo_intent_id`
  so at most one live intent exists per booking
- **Errors:** `409` if the booking is already `paid` — protects against a stale Complete-payment
  button after a webhook has landed

#### API-045 — `POST /webhooks/paymongo` — the only thing that confirms a payment

- **Serves:** F-042 · **Auth:** **PayMongo signature only.** No session
- **Request:** the PayMongo event body (`payment.paid`, `payment.failed`, refund events)
- **Behaviour, in order — the order is the contract:**
  1. Verify the signature. **On failure, `401` and write nothing**
  2. Insert into `payment_event` with the PayMongo event id. The `UNIQUE` constraint makes a
     duplicate delivery a no-op — this is what prevents EV-006 double-payout
  3. Resolve the booking by `paymongo_intent_id`
  4. Transition `payment_status` along `none → pending → paid → refunded` only (BR-009). Reject
     any other transition, leave the row untouched, **and write a dead-letter row plus raise an
     operational alert** (ADR-0009). A rejected transition means the database and PayMongo disagree;
     silence is the bug, not the status code
  5. On `paid`, set `status = confirmed` (BR-007)
  6. Stamp `applied_at`
- **Response 200:** empty, and **always `200` once the event is durably stored**, even if
  application is deferred — a non-2xx makes PayMongo retry, and retries are only safe because of
  step 2
- **Errors:** `401` bad signature. Never `500` for an unmatched intent: store the event with a
  null `booking_id`, **alert**, and return `200`, so the payload is not lost
- **Note:** delivery is at-least-once and may be out of order. A `payment.paid` arriving after a
  refund must not resurrect a refunded booking

| ID | Method / path | Serves | Auth | Notes |
|----|---------------|--------|------|-------|
| API-043 | `POST /bookings/:id/review` | F-013 | owner (student) | `{ rating: 1-5, body? }`. `409` if already reviewed or the booking is not `completed` (BR-010). Recomputes the coach aggregate **in the same transaction** (BR-011) |
| ~~API-044~~ | ~~`POST /programs/:id/enroll`~~ | F-012 | — | **Deferred** (ADR-0010). Payment behaviour was undefined anyway — ERD Q5 |

### Employer — **all Deferred (ADR-0010)**

No employer surface exists in v1. Listings are created by admin (API-071). Rows kept for revival.

| ID | Method / path | Serves | Auth | Notes |
|----|---------------|--------|------|-------|
| ~~API-050~~ | ~~`POST /me/company`~~ | — | — | **Deferred** (ADR-0010) |
| ~~API-051~~ | ~~`PATCH /me/company`~~ | — | — | **Deferred** (ADR-0010) |
| ~~API-052~~ | ~~`GET /me/internships`~~ | — | — | **Deferred** (ADR-0010) |
| ~~API-053~~ | ~~`POST /me/internships`~~ | — | — | **Deferred** (ADR-0010) |
| ~~API-054~~ | ~~`PATCH /me/internships/:id`~~ | — | — | **Deferred** (ADR-0010) |
| ~~API-055~~ | ~~`POST /me/internships/:id/withdraw`~~ | — | — | **Deferred** (ADR-0010) |

### Coach

| ID | Method / path | Serves | Auth | Notes |
|----|---------------|--------|------|-------|
| API-060 | `POST /me/coach-profile` | F-040 | coach | Onboarding: bio, expertise, session types, pricing |
| API-061 | `PATCH /me/coach-profile` | F-041 | owner | `verification_status` not writable |
| API-067 | `POST /me/session-types` · `PATCH /me/session-types/:id` | F-041 | owner | Free/paid and rate. A price change never affects existing bookings ([`erd.md`](https://github.com/iskolar-web3/vocation-server/blob/main/docs/erd.md)) |
| API-062 | `GET /me/availability` · `PUT /me/availability` | F-041 | owner | `422` on removing a slot that has a booking. Backed by an `ON DELETE RESTRICT` FK, so the database refuses it even if the handler is bypassed (ADR-0009) |
| API-063 | `GET /me/sessions` | F-041 | coach | `?when=upcoming\|past` |
| API-064 | `GET /me/earnings` | F-042 | coach | Per booking: `price`, `platform_fee`, `coach_payout`, `payment_status`. **How money reaches the coach is unspecified** — PRD Q10 |
| ~~API-065~~ | ~~`POST /me/verification`~~ | F-043 | — | **Deferred** (ADR-0010). Removes all government-ID intake from v1 |
| ~~API-066~~ | ~~`GET /me/verification`~~ | F-043 | — | **Deferred** (ADR-0010) |

### Admin

| ID | Method / path | Serves | Auth | Notes |
|----|---------------|--------|------|-------|
| API-070 | `GET /admin/internships` | F-050 | admin | `?status=`. All statuses, since admin owns the full lifecycle in v1 |
| API-071 | `POST /admin/internships` | F-050 | admin | **Create a listing.** Admin is trusted, so it is written `status=open` directly — no moderation step exists when admin is the author. Requires `external_apply_url` |
| API-075 | `PATCH /admin/internships/:id` | F-050 | admin | Edit any field. Does **not** reset to `pending` — BR-005 governed employer resubmission, which is deferred |
| API-076 | `POST /admin/internships/:id/withdraw` | F-050 | admin | `status=withdrawn`, immediately non-public (BR-006) |
| ~~API-072~~ | ~~`GET /admin/verifications`~~ | F-051 | — | **Deferred** (ADR-0010) |
| ~~API-073~~ | ~~`POST /admin/verifications/:id/decide`~~ | F-051 | — | **Deferred** (ADR-0010) |
| ~~API-074~~ | ~~`POST /admin/companies/:id/verify`~~ | F-052 | — | **Deferred** (ADR-0010). Never had a workbook story |

### Uploads

#### API-080 — `POST /uploads/presign`

- **Serves:** F-023, F-031, F-043 · **Auth:** session
- **Request:** `{ purpose: "resume"|"avatar"|"company_logo", content_type, size_bytes }`
  *(`verification_document` deferred with F-043 — ADR-0010)*
- **Response 201:** `{ upload_url, object_key, expires_at }`
- **Errors:** `413` over the per-purpose size cap · `415` disallowed content type
- **Note:** bytes go **straight to object storage**, never through the API. `resume` objects land in
  a private prefix, are never public-read, and carry the retention policy in [`erd.md`](https://github.com/iskolar-web3/vocation-server/blob/main/docs/erd.md) —
  they are sensitive personal information under RA 10173

## Error codes

Uniform body: `{ "error": { "code": "...", "message": "...", "details": {...}? } }`.
`message` is safe to display; `details` is field-level for form errors.

| HTTP | `code` | When |
|------|--------|------|
| 400 | `bad_request` | Malformed JSON or missing required field |
| 401 | `unauthenticated` | No or expired session; bad webhook signature |
| 403 | `forbidden` | Authenticated, wrong **role** (→ S-092) |
| 404 | `not_found` | Unknown record, **or** an owner-scoped record the caller does not own, **or** a non-`open` posting (BR-003) |
| 409 | `conflict` | Slot taken (EV-008), already reviewed (BR-010), verification pending (BR-013), booking already paid |
| 413 | `too_large` | Upload over cap |
| 415 | `unsupported_media_type` | Disallowed upload type |
| 422 | `unprocessable` | Valid JSON, invalid values — bad enum, slot outside availability, undefined `sort` |
| 429 | `rate_limited` | See Rate limits. Carries `Retry-After` |
| 502 | `upstream_failed` | PayMongo or Google unreachable |
| 503 | `unavailable` | Maintenance (→ S-094) |

**403 vs 404 is a deliberate rule:** wrong role gives 403; a record you simply do not own gives
404. The API never confirms the existence of another party's posting, booking or profile.

## Rate limits

| Scope | Limit `[assumption]` | Why |
|-------|---------------------|-----|
| `POST /auth/signin`, `/auth/password-reset/request` | 5 / 15 min per IP **and** per email | Credential stuffing and reset-flooding |
| `POST /auth/signup` | 3 / hour per IP | Fake account creation ahead of moderation |
| `API-003` apply-click | 30 / min per IP | Unauthenticated write; analytics poisoning |
| `API-001`, other public reads | 120 / min per IP | Scraping the directory |
| `API-041` create booking | 10 / hour per account | Slot squatting |
| `API-080` presign | 20 / hour per account | Storage abuse |
| `API-045` webhook | **Not rate-limited** | Throttling PayMongo would drop payment events. Protected by signature verification instead |

On breach: `429` with `Retry-After`. Limits are `[assumption]` — no figures exist in the charter,
and the Security Engineer owns the final numbers.

## Versioning

- Major version in the path. `/v1` is the only version.
- **Additive changes are not breaking** and ship without a version bump: new optional request
  field, new response field, new endpoint, new enum value *on a response*.
- **Breaking**, requiring `/v2`: removing or renaming a field, changing a type, making an optional
  request field required, removing an enum value, or changing an HTTP status for an existing case.
- A new enum value in a **request** is additive; in a **response** it can break a strict client, so
  the generated TypeScript client must treat response enums as open.
- Deprecation: announce in this document, serve both for one minor cycle, emit a
  `Deprecation` header, then remove. With two repos, the client cannot be assumed to deploy
  simultaneously with the server — **the server must tolerate one release of client lag**
  ([`ADR-0002`](adr/ADR-0002-two-repo-split.md)).

## Open questions

| # | Question | Blocks | Owner | Needed by |
|---|----------|--------|-------|-----------|
| Q1 | `openapi.yaml` does not exist. Without it the two repos share only prose, and drift is a matter of time | both repos | Project Lead | before M3 |
| Q2 | `sort=relevance` (API-001) is undefined. Returning `422` is the honest stopgap; what should it actually rank on? PRD Q5 | API-001 | PM | before F-002 |
| Q3 | ~~Does API-044 create a PayMongo intent for priced programs?~~ **Moot for v1** — F-012 deferred | API-044 | PM | if F-012 revives |
| Q4 | Which endpoint sets `completed`, and who may call it? Nothing in the charter or workbook says. PRD Q9 | API-043, API-064 | PM | before F-013 |
| Q5 | Is there a coach payout endpoint at all, or is disbursement manual and out-of-band? PRD Q10 | API-064 | PM | before coach onboarding |
| Q6 | Session cookies vs bearer tokens: cookies assume the client is same-site or on a configured CORS origin. Confirm the deployed domain topology | all authed endpoints | Project Lead | before M3 |
| Q7 | Refund initiation: an admin endpoint, PayMongo dashboard only, or both? PRD Q7 | API-045 | PM + Security Engineer | before payments launch |
| Q8 | **No endpoint produces `booking.join_url`, and none sets `cancelled`.** A confirmed booking currently cannot be attended or cancelled. [ADR-0012](adr/ADR-0012-session-delivery-model.md) | API-041, API-037 | PM + Project Lead | **blocks Wave 3** |
| Q9 | **No payout or ledger endpoints exist.** `GET /me/earnings` sums bookings rather than reading a balance, and there is no batch payout operation. [ADR-0013](adr/ADR-0013-payout-ledger-and-payment-states.md) | API-064 | Emmanuel + PM | **blocks Wave 4** |
