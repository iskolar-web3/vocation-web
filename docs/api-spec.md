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
> Traces back to: [System Design](https://github.com/iskolar-web3/vocation-server/blob/14d7d2db2d250323067e18f056216b9686b3ba04/docs/system-design.md), [ERD](https://github.com/iskolar-web3/vocation-server/blob/14d7d2db2d250323067e18f056216b9686b3ba04/docs/erd.md).
>
> `API-###` ids are permanent. Every operation names the `F-###` it serves so a test can trace
> endpoint → feature → rule.
>
> **v1 is 17 features.** Operations serving the eight deferred features
> ([ADR-0010](adr/ADR-0010-mvp-cut-to-17-features.md)) are marked **Deferred** in place, not removed.
> A Deferred operation is not implemented and not in `openapi.yaml`.

## Overview

- **Base URL:** `https://api.vocation.iskolar.io` `[assumption]` — the actual hostname is not
  chosen yet; the same-site web/API topology is fixed by [ADR-0023](adr/ADR-0023-cors-web-origin.md).
  Routes are served at the **root** today: the mux registers `/internships`, `/me`, … with **no
  `/v1` prefix** (`cmd/api/main.go`), and `openapi.yaml` mirrors that.
- **Transport:** HTTPS only. JSON request and response bodies, `application/json`.
- **Versioning:** no path prefix is served today; the versioning policy is recorded for when it is
  needed. See Versioning below.
- **Machine-readable spec:** [`openapi.yaml`](openapi.yaml) lives beside this file and is the
  artifact both repos build against — Go server interfaces on one side, a typed TypeScript client
  on the other. This prose document governs *intent*; the YAML governs *types*. See
  [Contract](#contract) and Q1.
- **Money:** all amounts are integer **centavos** in the wire format (`price_centavos`), never
  floats. PHP only. The database stores `numeric(12,2)`; the boundary converts.
- **Response envelope:** every response carries `{ message, data }`; list responses add `meta`.
  Fixed by [ADR-0018](adr/ADR-0018-response-envelope.md).

  ```json
  { "message": "ok", "data": { } }
  { "message": "ok", "data": [ ], "meta": { "page": 1, "per_page": 20, "total": 137 } }
  ```

  `message` is always present and always safe to display. `data` is the payload, or `null` on
  error. `meta` appears on list responses only.
- **Pagination:** `?page` (1-based) and `?per_page` (default 20, max 100). F-002 requires a result
  count, so `meta.total` is mandatory on list responses, not optional. An empty result is `200`
  with `data: []` and `meta.total: 0` — never `404`, never `500`.
- **Timestamps:** RFC 3339 UTC.

## Contract

[`openapi.yaml`](openapi.yaml) is the **machine-readable contract**. This prose document remains the
narrative: it owns the *intent*, the `F-###`/`BR-###` traceability, the auth rationale and the
versioning policy. The YAML owns the *types* — paths exactly as the mux registers them,
`operationId` = the `API-###` id, request/response fields, enums, formats and the error statuses
each handler writes — and is validated in CI by
[`internal/platform/apicontract/openapi_test.go`](../internal/platform/apicontract/openapi_test.go).

- **Which is authoritative?** Neither over the other: they are one contract in two forms. If they
  disagree, **the code is the truth** and **both files are corrected in the same PR** — the YAML to
  the code's behaviour, the prose to match. A disagreement must never survive a merge.
- **Drift:** every server PR that adds, removes or changes a route updates `openapi.yaml` in the
  same PR. `vocation-web` (Jem) — which does not hand-write types — generates its TypeScript types
  from this file (see `adr/README.md` §4, CR-004).

## Authentication & authorization

Three distinct authentication schemes:

| Scheme | Used by | Mechanism |
|--------|---------|-----------|
| **Session cookie** | All browser calls | `HttpOnly`, `Secure`, `SameSite=Lax`, server-side session. `SameSite=Lax` rather than `Strict` so the gateway checkout and Google OAuth returns keep the session |
| **None** | Public reads, and `API-003` | Genuinely unauthenticated. BR-002 permits applying without an account |
| **Webhook signature** | `API-045` only | Required `Paymongo-Signature`, verified against the exact raw body before parsing. **Never a session** |

Authorization is checked **server-side on every request**, per role and per record owner.
The client's route guards are UX only ([`sitemap.md`](https://github.com/iskolar-web3/vocation-web/blob/main/docs/sitemap.md) §5).

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
| API-082 | `GET /features` | — | public | Which optional integrations are on: `email`, `uploads`, `checkout`, `google_signin`. Booleans only, computed at startup; `Cache-Control: public, max-age=300` |

#### API-001 — `GET /internships` — search the directory

- **Serves:** F-002
- **Query:** `q` (role, company, field, location, requirements), `field`, `setup`
  (`remote|hybrid|onsite`), `pay` (`any|paid|unpaid`), `duration`, `sort`
  (`newest|deadline_soon|relevance`), `page`, `per_page`
- **Response 200:** `{ message, data: [InternshipCard], meta: { page, per_page, total } }` where
  `InternshipCard` carries `id`, `slug`, `title`, `company: {name, slug, logo_url}`, `location`,
  `duration_weeks`, `is_paid`, `pay_not_stated`, `work_setup`, `field`, `deadline` — the card fields
  F-002 requires, plus `work_setup` for the setup badge. `pay_not_stated` is true only when an
  unpaid listing's `compensation_details` is exactly the importer's "pay not stated" note, so the
  client can show "Pay not stated" rather than "Unpaid / For Credit". It is always present.
- **Auth:** none
- **Errors:** `422` on an unknown enum value; never `500` on an empty result — an empty page is
  `200` with `total: 0` so the client can render its empty state
- **Note:** `sort=relevance` (PRD Q5, closed) ranks on `ts_rank` against `q`. With no `q`, there is
  nothing to rank against, so the server falls back to `newest` rather than `422` — a client that
  always sends `sort=relevance` shouldn't have to special-case an empty search box

#### API-003 — `POST /internships/:id/apply-click` — record the outbound click

- **Serves:** F-004
- **Auth:** **none** (BR-002)
- **Request:** `{ referrer_surface: "directory" | "detail" | "share" | "cross_sell" }`
- **Response 202:** empty
- **Errors:** `404` if the posting is not `open`
- **Note:** this endpoint records that a student *left*. It **must not** accept a resume, cover
  note, or any application payload — BR-001 and [`ADR-0006`](adr/ADR-0006-store-no-applications.md).
  Rate-limited by IP, since it is unauthenticated

#### API-082 — `GET /features` — which optional integrations are on

- **Serves:** operational — tells the web which optional integrations production has configured
- **Auth:** **none**
- **Response 200:** `{ message, data: { email, uploads, checkout, google_signin } }` — four booleans
  computed once at startup from config ([ADR-0041](adr/ADR-0041-feature-flags.md))
- **Flags:** `email` is on when `RESEND_API_KEY` is set · `uploads` when the `S3_BUCKET`/`AWS_*`
  group is complete · `checkout` when `PAYMONGO_SECRET_KEY` **and** `PAYMONGO_WEBHOOK_SECRET` are
  set (without the webhook no paid booking could be confirmed) · `google_signin` when the
  `GOOGLE_*` group is complete
- **Note:** booleans only — never a key, bucket, sender or URL (REG-33). The response carries
  `Cache-Control: public, max-age=300`, so a flag can lag a config change (which needs a restart)
  by up to five minutes. Maintenance mode answers `503`; the web fails open and shows its
  maintenance screen

### Authentication

| ID | Method / path | Serves | Auth | Notes |
|----|---------------|--------|------|-------|
| API-020 | `POST /auth/signup` | F-020, F-030, F-040 | public | `{ email, password, role, full_name? }`. `role` ∈ student/employer/coach — **never** `admin`. `full_name` is optional, 1–120 chars trimmed (ADR-0030) |
| API-021 | `POST /auth/signin` | same | public | Generic failure message; never reveal whether the email exists |
| API-022 | `POST /auth/google` | same | public | Authorization-code exchange. `{ code, role? }`; `role` only on first signup |
| API-023 | `POST /auth/signout` | — | session | Invalidates server-side |
| API-024 | `POST /auth/password-reset/request` | F-020 | public | **Always `202`**, whether or not the email exists. IP and IP+email limits return `429`; excess per-account sends are silently skipped. When the account exists, a reset link `WEB_BASE_URL/reset-password?token=…` is emailed (ADR-0035) |
| API-025 | `POST /auth/password-reset/confirm` | F-020 | public | Single-use, expiring token. A successful reset **revokes every session** of the account |
| API-026 | `GET /me` | F-021, F-031, F-041 | session | Returns `{ id, email, role, full_name, avatar_url, is_onboarded, email_verified }` — role, onboarding-complete flag, profile stub, whether the email is verified. Drives the auth-aware navbar |
| API-027 | `POST /auth/verify-email` | F-020 | public | `{ token }` from the signup email link `WEB_BASE_URL/verify-email?token=…` (valid 24 h, single-use). `200` sets `email_verified`; an already-verified account, including one submitting a previously used token, also gets `200`. Unknown or expired token, or a used token for an unverified account: `422`. Sign-in is never blocked by an unverified email (ADR-0035) |
| API-028 | `POST /auth/verify-email/resend` | F-020 | session | Emails a fresh verification link; `202`, or `200` when the email is already verified. 3 / hour per account (`429`) |
| API-029 | `POST /auth/password/change` | F-020 | session | `{ current_password, new_password }` (8+ chars). Wrong current password: `403`; limited to 5 / 15 min per account (`429`). Success revokes every **other** session; the calling session stays signed in |

### Student

| ID | Method / path | Serves | Auth | Notes |
|----|---------------|--------|------|-------|
| API-030 | `POST /me/student-profile` | F-020 | student | Onboarding: school, course, year level, skills; optional `target_ojt_hours` / `completed_ojt_hours` (whole hours, 0–10000, else `422`) |
| API-031 | `PATCH /me/student-profile` | F-023 | owner | Name, school, course, year, skills, bio, avatar, resume keys, `target_ojt_hours`, `completed_ojt_hours` |
| API-032 | `GET /me/student-profile` | F-023 | student | The caller's own profile (same shape as API-030/031's response); `404` until onboarding |
| API-033 | `GET /me/dashboard` | F-021 | student | `{ saved_count, upcoming_sessions_count, completeness_pct }`. **Carries no application data** (BR-014) |
| API-034 | `GET /me/saved` | F-005 | student | Items carry the public card fields plus `saved_at`, including `pay_not_stated` |
| API-035 | `PUT /me/saved/:internshipId` | F-005 | student | Idempotent — a repeat save is `200`, not `409` |
| API-036 | `DELETE /me/saved/:internshipId` | F-005 | student | Idempotent |
| API-037 | `GET /me/bookings` | F-022 | student | `?when=upcoming\|past`. Confirmed rows carry `join_url`; `pending` paid rows carry `amount_due_centavos` |
| API-038 | `PATCH /me/settings` | F-023 | owner | Email and notification preferences are independently optional. Setting `password`, or changing `email` to a different address, requires `current_password`; missing or wrong current password: `403`. Every field is validated first (`422`: password under 8 characters, blank or malformed email), so a `4xx` never leaves a partial change and a `422` does not spend the rate limit. Those changes share the 5 / 15 min per-account budget with `POST /auth/password/change` (`429` with `Retry-After`). A password change revokes every other session while keeping the calling session. An email change resets `email_verified_at`, expires pending reset and verification links, emails a verification link to the new address and a notice to the old one (ADR-0035). Accounts without a password (Google-only) always get `403` here: they set one through `POST /auth/password-reset/request`, which works for them |

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
    Checkout Session is created and its `checkout_url` returned (ADR-0008)
- **Response 201:** `{ booking_id, status, payment_status, price_centavos, platform_fee_centavos,
  coach_payout_centavos, checkout_url? }`
- **Errors:** `409` slot no longer available (EV-008) · `409` the student already holds 3 unpaid
  bookings (`booking: too_many_unpaid`) · `409` the student let an unpaid booking for the same slot
  end within the last 30 minutes (`booking: slot_cooldown`); both 409s apply to paid
  sessions only, never free ones (ADR-0039) · `422` slot not in the coach's availability
  · `404` unknown coach or session type · `502` PayMongo unreachable — **the booking row remains,
  `pending`, with no stored Checkout Session. A session whose create response was lost may exist, but
  its URL was never returned, so it cannot be paid. The student resumes via API-042; the 30 min
  checkout-expiry sweeper cancels stale pending bookings (ADR-0031)**
- **Note on ordering (ADR-0008):** a Postgres transaction cannot span an HTTP call, so both-or-neither
  is not achievable. The booking is written first deliberately: a stuck `pending` booking is visible
  and retryable, whereas a charge with no booking row is not recoverable without manual
  reconciliation.
- **Note:** the fee split is returned so the client never computes money. `platform_fee +
  coach_payout = price` and `platform_fee = ROUND(price * take_rate, 2)` are both database CHECKs
  ([`erd.md`](https://github.com/iskolar-web3/vocation-server/blob/14d7d2db2d250323067e18f056216b9686b3ba04/docs/erd.md)), so a wrong split cannot persist

#### API-042 — `POST /bookings/:id/checkout` — resume payment

- **Serves:** F-022 · **Auth:** `owner` (the booking's student)
- **Behaviour:** returns a fresh `checkout_url` for a booking with `status=pending` and
  `payment_status=pending`. Under the booking row lock, it expires the stored Checkout Session
  before creating and storing its replacement. PayMongo has no endpoint to list or search sessions.
  A payment already pending or processing returns `409 payment in progress`.

- **Errors:** `409` if the booking is no longer pending payment, including when a webhook pays it
  between the initial read and the replacement — protects against a stale Complete-payment button
  after a webhook has landed · `409 payment in progress` if PayMongo reports pending or processing
  payment · `409` if the booking is more than 2 hours old (`CheckoutMaxHold`): the stored session is
  expired and the booking released on the spot, so the slot frees immediately (ADR-0039) · `429` over
  10 checkouts per hour per account, with `Retry-After` · `502 upstream_failed` if session creation
  fails · `500 internal_error` if the session reference could not be stored (ADR-0031)

#### API-045 — `POST /webhooks/paymongo` — the only thing that confirms a payment

- **Serves:** F-042 · **Auth:** required `Paymongo-Signature`; no session
- **Request:** PayMongo event envelope with `data.id`, `data.attributes.type`, `data.attributes.livemode`, and `data.attributes.data` resource.
- **Behaviour, in order — the order is the contract:**
  1. Read the exact raw body, then verify `Paymongo-Signature` (`t=<ts>,te=<hex>,li=<hex>`) using HMAC-SHA256 over `<t>.<raw body>` and `PAYMONGO_WEBHOOK_SECRET`, comparing in constant time. Verify before parsing. Invalid signature is `401` and writes nothing.
  2. Parse the event and insert it idempotently by `data.id` in `payment_event`.
  3. Resolve the booking and payment references, then apply only a valid forward transition (BR-009). `checkout_session.payment.paid` gets the paid `pay_…` entry from `payments[]`; `payment.failed` refers to its resource id; `refund.succeeded` maps its `payment_id`; `dispute.created` records the dispute.
  4. A paid event confirms the booking (BR-007). A dispute blocks refund initiation. Unmatched or rejected signed events are stored and alerted; a database failure returns `500`.
- **Status mapping:** `checkout_session.payment.paid` → `paid`; `payment.failed` is recorded without moving booking payment state; `refund.succeeded` → `refunded`; `dispute.created` records dispute time.
- **Response 200:** once the verified event is durably stored. Duplicate delivery is a no-op.
- **Errors:** `400` unreadable body · `401` missing/invalid signature · `500` storage failure.
- **Note:** only the verified webhook confirms payment; browser return never confirms it (BR-007).
| ID | Method / path | Serves | Auth | Notes |
|----|---------------|--------|------|-------|
| API-043 | `POST /bookings/:id/review` | F-013 | owner (student) | `{ rating: 1-5, body? }`. `409` if already reviewed or the booking is not `completed` (BR-010). Recomputes the coach aggregate **in the same transaction** (BR-011) |
| API-046 | `POST /bookings/:id/cancel` | F-022 | owner (student/coach) | Cancels the session. Trigger full refund if cancelled by coach, or by student > 24h prior (ADR-0012). Refunds are **asynchronous**: `SUCCEEDED` marks `payment_status=refunded`; `PENDING` cancels the booking but leaves `payment_status=paid` (refund in flight, completed by the `refund.succeeded` callback); `FAILED`/non-2xx is `502` and changes nothing. Cancel also expires the booking's stored live Checkout Session. `409` if the payment has an open dispute or the session has started; refunds are blocked while disputed |
| API-047 | `POST /bookings/:id/complete` | F-022 | owner (student/coach) | Marks the session `completed`. Auto-completes 24h post-session if not called (ADR-0012) |
| API-048 | `PATCH /bookings/:id` | F-022 | owner (coach) | Allows the coach to provide a `join_url` if not using their default |
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
| API-061 | `PATCH /me/coach-profile` | F-041 | owner | Partial update: `display_name`, `headline`, `bio`, `experience`, `languages`, `skills`, `default_join_url` — any field omitted is left unchanged. `slug`, `price_type` and `verification_status` are not writable here (`slug` and `price_type` are set once at onboarding via API-060; `verification_status` is never writable, F-043 deferred). **Payout destination:** `payout_channel_code` (e.g. `PH_GCASH`, `PH_BDO`), `payout_account_number` (6–32 digits) and `payout_account_holder_name` must be supplied **together**; responses return the account number **masked to its last four digits**, never in full (ADR-0028). Changing any payout field also requires `current_password` (missing, wrong, or a Google-only account: `403`) and a `payout_account_holder_name` equal to the account's `full_name` ignoring case and spacing (`422`) (ADR-0034). Over the shared current-password budget (5 per 15 minutes per account) a request that sends a payout field is `429` with `Retry-After` (ADR-0039) |
| API-067 | `GET /me/session-types` · `POST /me/session-types` · `PATCH /me/session-types/:id` | F-041 | owner | Free/paid and rate. A price change never affects existing bookings ([`erd.md`](https://github.com/iskolar-web3/vocation-server/blob/14d7d2db2d250323067e18f056216b9686b3ba04/docs/erd.md)). GET lists the coach's own types, retired ones included (`is_active`) |
| API-062 | `GET /me/availability` · `PUT /me/availability` | F-041 | owner | `422` on removing a slot that has a booking. Backed by an `ON DELETE RESTRICT` FK, so the database refuses it even if the handler is bypassed (ADR-0009) |
| API-063 | `GET /me/sessions` | F-041 | coach | `?when=upcoming\|past` |
| API-064 | `GET /me/earnings` · `GET /me/earnings/ledger` | F-042 | coach | `GET /me/earnings`: `data` is the per-booking array (`price`, `platform_fee`, `coach_payout`, `payment_status`) exactly as before; `meta.balance = { available_centavos, in_transit_centavos, paid_out_centavos, pending_centavos }` (ADR-0018 meta). `GET /me/earnings/ledger`: paginated (`?page`, `?per_page`) ledger entries, newest first. The balance is read from the append-only gateway-neutral ledger and payout batches; coach disbursements are manual until PayMongo Transfers is implemented. See `methods.md` §7, ADR-0028 |
| ~~API-065~~ | ~~`POST /me/verification`~~ | F-043 | — | **Deferred** (ADR-0010). Removes all government-ID intake from v1 |
| ~~API-066~~ | ~~`GET /me/verification`~~ | F-043 | — | **Deferred** (ADR-0010) |

### Admin

| ID | Method / path | Serves | Auth | Notes |
|----|---------------|--------|------|-------|
| API-077 | `POST /admin/companies` | F-050 | admin | **Create a company.** Prerequisite for API-071 — v1 has no employer signup, so admin must be able to create the `company` row an internship's `company_id` points at. `owner_account_id` is always left null (ADR-0019, ADR-0010) |
| API-070 | `GET /admin/internships` | F-050 | admin | `?status=`. All statuses, since admin owns the full lifecycle in v1. Rows carry the card's display fields (company, location, field, `work_setup`, `is_paid`, `duration_weeks`) |
| API-071 | `POST /admin/internships` | F-050 | admin | **Create a listing.** Admin is trusted, so it is written `status=open` directly — no moderation step exists when admin is the author. Requires `external_apply_url` |
| API-075 | `PATCH /admin/internships/:id` | F-050 | admin | Edit any field. Does **not** reset to `pending` — BR-005 governed employer resubmission, which is deferred |
| API-076 | `POST /admin/internships/:id/withdraw` | F-050 | admin | `status=withdrawn`, immediately non-public (BR-006) |
| API-078 | `GET /admin/payouts` | F-042 | admin | **Weekly payout list.** Coaches owed money now: ledger credits of sessions finished 7+ days ago with no dispute, minus clawbacks and payouts. Per coach: `coach_account_id`, `coach_name`, `verified_name` (`account.full_name`), `payout_channel_code`, `payout_account_masked`, `payout_account_holder_name`, `amount_centavos`, `booking_ids` (ADR-0034) |
| API-079 | `POST /admin/payouts` | F-042 | admin | **Record a manual payout.** `{ coach_account_id, reference, amount_centavos }`. `amount_centavos` must equal the owed amount the server computes at that moment (`409` with `details.owed_centavos` otherwise, or when nothing is owed). `201` on create; repeating the same `(coach, reference)` and amount is `200` with `replayed: true`; the same reference with another amount is `409`. Writes a negative ledger entry (ADR-0034) |
| API-081 | `POST /admin/bookings/:id/clawback` | F-042 | admin | **Claw back a booking from its coach** when a refund or lost chargeback was the coach's fault. `{ reason }` required (`422` if blank, `404` if no booking). Debits what is still credited for the booking; repeating it is a `200` no-op (ADR-0034) |
| ~~API-072~~ | ~~`GET /admin/verifications`~~ | F-051 | — | **Deferred** (ADR-0010) |
| ~~API-073~~ | ~~`POST /admin/verifications/:id/decide`~~ | F-051 | — | **Deferred** (ADR-0010) |
| ~~API-074~~ | ~~`POST /admin/companies/:id/verify`~~ | F-052 | — | **Deferred** (ADR-0010). Never had a workbook story |

### Uploads

#### API-080 — `POST /uploads/presign`

- **Serves:** F-023, F-031, F-043 · **Auth:** session
- **Request:** `{ purpose: "resume"|"avatar"|"company_logo", content_type, size_bytes }`
  *(`verification_document` deferred with F-043 — ADR-0010)*
- **Response 201:** `{ url, fields, object_key, expires_at }` — an S3 **POST policy**. Upload with a
  `multipart/form-data` POST to `url`: send every `fields` entry as a form field, then the file as the
  last part named `file`. The policy pins the exact `key` and `Content-Type` and a
  `content-length-range` of 1 byte..the per-purpose cap, so S3 rejects an empty, oversized or retyped
  upload itself
- **Per-purpose caps and allowed content types** ([ADR-0021](adr/ADR-0021-student-feature-slice-decisions.md)):

  | Purpose | Size cap | Content types |
  |---|---|---|
  | `resume` | 10 MB | `application/pdf` |
  | `avatar` | 5 MB | `image/jpeg`, `image/png`, `image/webp` |
  | `company_logo` | 5 MB | `image/jpeg`, `image/png`, `image/webp` |

- **Errors:** `413` over the per-purpose size cap · `415` disallowed content type · `503 unavailable`
  when object storage is not configured
- **Keys come back owned:** `avatar_key` / `resume_key` on `PATCH /me/student-profile` are accepted only
  if they are a key this endpoint issued to the caller for that purpose (`<prefix>/<account id>/<file>`);
  anything else is `422 unprocessable`
- **Note:** bytes go **straight to object storage**, never through the API. `resume` objects land in
  a private prefix, are never public-read, and carry the retention policy in [`erd.md`](https://github.com/iskolar-web3/vocation-server/blob/14d7d2db2d250323067e18f056216b9686b3ba04/docs/erd.md) —
  they are sensitive personal information under RA 10173

## Error codes

Same envelope as success, with `data: null` and an `error` object
([ADR-0018](adr/ADR-0018-response-envelope.md)):

```json
{
  "message": "That slot is no longer available.",
  "error": { "code": "conflict", "details": { "slot_starts_at": "2026-09-20T09:00:00Z" } }
}
```

**`message` is top-level, not nested inside `error`** — the client throws `body.message` directly.
It is always safe to display. `error.code` is the stable machine value below; `error.details` is
field-level for form errors.

| HTTP | `code` | When |
|------|--------|------|
| 400 | `bad_request` | Malformed JSON or missing required field |
| 401 | `unauthenticated` | No or expired session; bad webhook signature |
| 403 | `forbidden` | Authenticated, wrong **role** (→ S-092) |
| 403 | `forbidden_origin` | A write request has an `Origin` other than `WEB_ORIGIN`, or has no `Origin` and a `Sec-Fetch-Site` other than `same-origin`, `same-site`, or `none`. Safe methods and `POST /webhooks/paymongo` are exempt ([ADR-0037](adr/ADR-0037-origin-check-csrf.md)) |
| 404 | `not_found` | Unknown record, **or** an owner-scoped record the caller does not own, **or** a non-`open` posting (BR-003) |
| 409 | `conflict` | Slot taken (EV-008), already reviewed (BR-010), verification pending (BR-013), booking already paid |
| 413 | `too_large` | Upload over cap |
| 415 | `unsupported_media_type` | Disallowed upload type; or a `POST`/`PUT`/`PATCH` with a body whose `Content-Type` is not `application/json` (the PayMongo webhook is exempt) |
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
| `POST /auth/password-reset/request` | 20 / hour per IP (`429`); 3 / hour per account, excess sends silently skipped (`202`) | Protects the Resend quota |
| `POST /auth/password/change`, password or email changes via `PATCH /me/settings` | 5 / 15 min per account, shared budget | Bounds current-password guesses |
| `POST /auth/signup` | 3 / hour per IP | Fake account creation ahead of moderation |
| `API-028` resend verification | 3 / hour per account | Each call is a real email against the Resend free plan |
| `API-003` apply-click | 30 / min per IP | Unauthenticated write; analytics poisoning |
| `API-001`, other public reads | 120 / min per IP | Scraping the directory |
| `API-041` create booking | 10 / hour per account; at most 3 unpaid bookings at once; 30 min same-slot rebook cooldown | Slot squatting (ADR-0039) |
| `API-042` resume checkout | 10 / hour per account | Re-issuing checkout resets the 30-minute idle window; paired with the 2-hour absolute hold cap (ADR-0039) |
| `API-061` payout-detail change | 5 / 15 min per account, **shared** with `POST /auth/password/change` and `PATCH /me/settings` | Current-password guessing from a stolen coach session; spent only when a payout field is sent (ADR-0039) |
| `API-080` presign | 20 / hour per account | Storage abuse |
| `API-045` webhook | **Not rate-limited** | Throttling PayMongo would drop payment events. Protected by signature verification instead |

On breach: `429` with `Retry-After`. Limits are `[assumption]` — no figures exist in the charter,
and the Security Engineer owns the final numbers.

## Versioning

- **No version prefix is served today.** The mux registers routes at the root (`/internships`,
  `/me`, …) and `openapi.yaml` documents no prefix; the `[assumption]` base URL in the Overview
  likewise carries no `/v1`. Introducing a version prefix is a **future decision**: record the
  scheme here first, then change the mux and `openapi.yaml` together — the code is the truth and a
  disagreement must never survive a merge (see [Contract](#contract)).
- **When versioning is adopted:** major version in the path (`/v1`).
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
| Q1 | ~~`openapi.yaml` does not exist. Without it the two repos share only prose, and drift is a matter of time~~ **Answered:** [`openapi.yaml`](openapi.yaml) is the machine-readable contract, validated in CI; the prose remains the narrative and both are fixed together when they disagree. [`vocation-web`](https://github.com/iskolar-web3/vocation-web) generates its types from it (`adr/README.md` CR-004) | both repos | — | closed 2026-10-01 |
| Q2 | ~~`sort=relevance` (API-001) is undefined. Returning `422` is the honest stopgap; what should it actually rank on?~~ **Answered:** `ts_rank(search_tsv, plainto_tsquery(q))`; falls back to `newest` with no `q`. PRD Q5 | API-001 | — | closed 2026-09-18 |
| Q3 | ~~Does API-044 create a gateway Checkout Session for priced programs?~~ **Moot for v1** — F-012 deferred | API-044 | PM | if F-012 revives |
| Q4 | Which endpoint sets `completed`, and who may call it? Nothing in the charter or workbook says. PRD Q9 | API-043, API-064 | PM | before F-013 |
| Q5 | ~~Is there a coach payout endpoint at all, or is disbursement manual and out-of-band?~~ **Answered:** there is no public payout endpoint. API-064 reads the gateway-neutral ledger; coach payouts are manual until PayMongo Transfers is implemented. | API-064 | — | closed 2026-10-14 |
| Q6 | ~~Session cookies vs bearer tokens; confirm the deployed domain topology~~ **Answered: [ADR-0023](adr/ADR-0023-cors-web-origin.md).** Cookie auth is final. The web app and API MUST use the same registrable domain (e.g. `app.<domain>` and `api.<domain>`) so the host-only, `Secure`, `SameSite=Lax` API cookie is sent on credentialed fetches. `WEB_ORIGIN` enables exact-origin CORS. `localhost:5173` to `localhost:8080` is same-site in dev. Different registrable domains are rejected because they require `SameSite=None`, increasing CSRF exposure | all authed endpoints | Project Lead | closed 2026-09-22 |
| Q7 | Refund initiation: an admin endpoint, the PayMongo dashboard only, or both? PRD Q7 | API-045 | PM + Security Engineer | before payments launch |
| Q8 | ~~**No endpoint produces `booking.join_url`, and none sets `cancelled`.**~~ **Answered: ADR-0012** (Coach provides link, cancellation paths added) | API-041, API-037 | — | closed 2026-09-11 |
| Q9 | ~~**No payout or ledger endpoints exist.**~~ **Answered:** the ledger is written on completion/refund and API-064 reads a real balance. Coach payouts are manual until PayMongo Transfers is implemented; there is no HTTP payout endpoint. | API-064 | — | closed 2026-10-14 |
