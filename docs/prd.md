<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# PRD — Product Requirements Document

**Project:** iSkolar Vocation
**Maintained by:** Alexandre Nevero (Project Manager)
**Last updated:** 2026-09-08
**Status:** Draft
**FMD version:** 4.6.2

> **Purpose:** the WHAT, for the team. Primary build reference.
> Traces back to: [`VOCATION.md`](https://github.com/iskolar-web3/vocation-server/blob/main/VOCATION.md), `Vocation Project Charter.pdf`,
> `Vocation User Stories.xlsx`. Traces forward to: [System Design](https://github.com/iskolar-web3/vocation-server/blob/main/docs/system-design.md),
> [Sitemap](sitemap.md), [User Flow](user-flow.md), [ERD](https://github.com/iskolar-web3/vocation-server/blob/main/docs/erd.md), [API Spec](api-spec.md).
>
> **This doc owns the `F-###`, `UJ-###`, and `BR-###` spine.** Nothing else defines them.
> The workbook is the raw input; from here on this PRD is the home. When they disagree, this wins
> and the divergence gets a CR in [`adr/`](adr/).

## Overview & goals

Vocation puts internship discovery and interview preparation under one student account. It hosts
internship and OJT postings and links students out to each company's own application page; it
never collects an application. Revenue comes from the adjacent transaction the student will pay
for: a coaching session, collected through PayMongo at a stored platform take rate (`0.0500` today).

Outcomes it must achieve:

1. A student finds relevant internship and OJT roles in one filtered place instead of one company
   career page at a time.
2. A student can find, book, and pay a coach for preparation before they apply.
3. A coach can run a bookable business on the platform and be paid correctly, every time.
4. Employers get reach without changing how they receive applications — in v1 via admin-entered
   listings, since employer self-serve is deferred (ADR-0010).

## Personas & use cases

| Persona | Who | Primary situation | Frequency |
|---------|-----|-------------------|-----------|
| **Visitor** | Unauthenticated arrival | Landed from search or a shared link; needs to understand the product in seconds | Once |
| **Student** | Filipino tertiary student (school, course, year level) | Looking for a placement this term; preparing for an interview | Weeks of discovery, days of prep |
| **Coach** | Practitioner selling mock interviews, resume reviews, OJT-readiness | Wants bookings on terms they control, and to be paid | Ongoing |
| ~~**Employer**~~ | Philippine company with intern/OJT slots | **No surface in v1** — F-030–F-033 deferred (ADR-0010). Listings are entered by admin | — |
| **Platform Admin** | iSkolar operations | **Creates and manages listings** (F-050), the v1 replacement for employer self-serve | Daily |

Note: `Apply` requires no account (BR-002), so a Visitor can reach the product's core discovery
value without ever registering. Registration is driven by saving (F-005) and booking (F-011).

## User stories

The canonical raw input is `Vocation User Stories.xlsx` (4 sheets, 24 stories, each with a
precondition, postcondition, and numbered acceptance criteria, plus a Passed/Failed/Total/Rate
tracker). Rather than restate all 24 here, the mapping below is authoritative and the acceptance
criteria are carried in the Acceptance criteria section.

| Workbook | Story | `F-###` |
|---|---|---|
| Sheet 1 "Internships Module" | A-01 Landing · A-02 Internship Directory · A-03 Internship Detail · A-04 Apply (Redirect) · A-05 Save Internship · A-06 Companies | F-001 · F-002 · F-003 · F-004 · F-005 · F-006 |
| Sheet 2 "Coaching Module" | A-01 Coach Discovery · A-02 Booking (PayMongo) · A-03 Programs · A-04 Post-Session Review | F-010 · F-011 · F-012 · F-013 |
| Sheet 3 "Student Account Module" | A-01 Auth & Onboarding · A-02 Dashboard Overview · A-03 Bookings · A-04 Profile & Settings | F-020 · F-021 · F-022 · F-023 |
| Sheet 4 "Employer Module" | A-05(Employer) · A-06 Employer Profile · A-01 Employer Posting · A-07 Edit & Resubmit · A-05(Coach) · A-03 Coach Account · A-04 Coach Payout · A-08 Coach Verification Request · A-02 Admin Moderation · A-09 Coach Verification Review | F-030 · F-031 · F-032 · F-033 · F-040 · F-041 · F-042 · F-043 · F-050 · F-051 |

The workbook's `A-##` numbering repeats per sheet and collides across sheets; `F-###` is the
global spine. `F-052` has no workbook story. **Eight of the 25 are `Deferred`** — see the feature
list and [ADR-0010](adr/ADR-0010-mvp-cut-to-17-features.md).

## User journeys

- **UJ-001** — *Visitor orients and browses*: lands, understands the two pillars, enters either the
  internship directory or the coach directory. No account.
- **UJ-002** — *Student discovers and applies out*: filters the directory, opens a role, saves it or
  applies on the company's site. Account needed only to save.
- **UJ-003** — *Student books a coach*: finds a coach by expertise and price, books a slot; free
  confirms instantly, paid routes to PayMongo and confirms on payment success.
- **UJ-004** — *Student reviews after a session*: a completed session prompts a rating; the review
  updates the coach's public profile.
- **UJ-005** — ~~*Employer publishes a posting*~~ **Deferred** with F-030–F-033 (ADR-0010). In v1,
  **admin publishes and manages listings** (F-050) — realised by UF-011.
- **UJ-006** — *Coach earns*: signs up, builds a profile with pricing and availability, receives
  bookings, and is paid `price − platform_fee` after collection. Verification steps deferred with
  F-043.
- **UJ-007** — *Admin runs the supply side*: creates, edits and withdraws listings (F-050). The
  verification queues are deferred with F-051/F-052.

## Feature list (with priorities)

**v1 is 17 features.** The charter defines 25; eight are **Deferred** per
[ADR-0010](adr/ADR-0010-mvp-cut-to-17-features.md) — one developer against 47 endpoints and 30
screens, and none of the deferred blocks tests the riskiest assumption in
[`../VOCATION.md`](https://github.com/iskolar-web3/vocation-server/blob/main/VOCATION.md) §B9. Deferred rows stay in place, marked, so reviving one is a
status flip rather than a re-spec.

| F-ID | Feature | Priority | Module | Notes |
|------|---------|----------|--------|-------|
| F-001 | Landing page, two pillars | MVP | Internships | Featured items from live data |
| F-002 | Internship directory: search, filters, sort | MVP | Internships | "Relevance" sort undefined — Q5 |
| F-003 | Internship detail | MVP | Internships | Cross-sells coaching |
| F-004 | Apply by redirect | MVP | Internships | **BR-001, BR-002.** No account, no stored application |
| F-005 | Save internship | MVP | Internships | Requires account |
| F-006 | Companies directory + profile | MVP | Internships | Verification badge (BR-012) |
| F-010 | Coaching hub + coach directory | MVP | Coaching | Filters: expertise, price |
| F-011 | Coach profile + booking | MVP | Coaching | **Revenue mechanism.** BR-007 |
| F-012 | ~~Programs (cohorts)~~ | **Deferred** | Coaching | ADR-0010 — a second product |
| F-013 | Post-session review | MVP | Coaching | BR-010, BR-011 |
| F-020 | Student auth + onboarding | MVP | Student Account | Email/password + Google |
| F-021 | Student dashboard | MVP | Student Account | **BR-014.** No application tracking |
| F-022 | Bookings management | MVP | Student Account | Join link; complete-payment |
| F-023 | Profile + settings | MVP | Student Account | Notification delivery undefined — Q6 |
| F-030 | ~~Employer account access~~ | **Deferred** | Employer | ADR-0010 — admin enters listings at launch |
| F-031 | ~~Employer profile~~ | **Deferred** | Employer | ADR-0010 |
| F-032 | ~~Internship posting~~ | **Deferred** | Employer | ADR-0010. Replaced for v1 by F-050 admin listing CRUD |
| F-033 | ~~Edit + resubmit postings~~ | **Deferred** | Employer | ADR-0010 |
| F-040 | Coach account access | MVP | Coach | Email/password + Google |
| F-041 | Coach account management | MVP | Coach | Pricing, availability, sessions |
| F-042 | Coach payout | MVP | Coach | **BR-008, BR-009.** Fee derived by subtraction (ADR-0007). Refund flow undefined — Q7. **No ledger exists** — ADR-0013 blocks Wave 4 |
| F-043 | ~~Coach verification request~~ | **Deferred** | Coach | ADR-0010 — removes all government-ID handling from v1 |
| F-050 | **Admin listing CRUD** | MVP | Admin | **Repurposed (ADR-0010).** Was employer-submission moderation; with F-032 deferred, admin creates and manages listings directly. Without it nothing can create a posting, and F-001 needs live data. **BR-003** still applies |
| F-051 | ~~Admin coach verification review~~ | **Deferred** | Admin | ADR-0010, with F-043 |
| F-052 | ~~Admin company verification~~ | **Deferred** | Admin | ADR-0010, with the employer module. Never had a workbook story |

## Business rules

All rules below are sourced from workbook acceptance criteria or the charter. None is invented.

Three govern **deferred** features and are dormant in v1, kept for revival: **BR-004**, **BR-005**,
**BR-013** ([ADR-0010](adr/ADR-0010-mvp-cut-to-17-features.md)). Two others — **BR-012** and
**BR-015** — hold trivially because the features they constrain do not exist in v1.

**Product-model rules — these define what Vocation is not**

- **BR-001** — The platform stores no applications, resumes-as-applications, or cover notes. Apply
  is an outbound redirect to the posting's external apply URL, opened in a new tab, with the
  departure signalled in the UI. *(Sheet 1 A-04; charter §I, §II.1.c)*
- **BR-002** — Apply requires no account. Outbound apply-clicks may be tracked for analytics.
  *(Sheet 1 A-04)*
- **BR-014** — There is no on-platform application tracking. *(Sheet 3 A-02)*
- **BR-015** — Employers get no applicant inbox and no screening tools. Holds trivially in v1 —
  there is no employer surface at all — and binds permanently under
  [ADR-0006](adr/ADR-0006-store-no-applications.md). *(Sheet 4 A-01)*

**Moderation and trust**

- **BR-003** — Only internships with status `open` are publicly visible. Enforced by the server
  API, not the client. *(Sheet 4 A-02)*
- **BR-004** — ~~A new posting enters `pending` and is not public until an admin approves it.~~
  **Dormant in v1** — moderation existed to review *employer* submissions (F-032, deferred). Admin
  creates listings directly at `status=open` (API-071); there is nothing to moderate when admin is
  the author. *(Sheet 4 A-01)*
- **BR-005** — ~~Saving an edit to an `open` posting sets it back to `pending`…~~ **Dormant in v1**
  with F-033. Admin edits (API-075) do not reset status. *(Sheet 4 A-07)*
- **BR-006** — A posting may be withdrawn at any time, immediately removing it from public view
  regardless of status. **In v1 the actor is admin** (API-076), not an employer. *(Sheet 4 A-07)*
- **BR-012** — A verification badge is displayed only after a Platform Admin verifies. Unverified
  companies and coaches show no badge. Applies to both. **In v1 this holds trivially**: F-043, F-051
  and F-052 are deferred, so no verification path exists and **no badge is ever shown**. The rule
  still binds any code that renders one. *(Sheet 4 A-06, A-08, A-09)*
- **BR-013** — ~~While a coach verification request is `Pending`, re-submission is disabled.~~
  **Dormant in v1** with F-043. *(Sheet 4 A-08)*

**Money — the rules where a bug is not recoverable**

- **BR-007** — Free sessions (a free coach, or an intro call) confirm directly as `confirmed`. Paid
  sessions create a `pending` booking and route to PayMongo checkout; the booking becomes
  `confirmed` only once payment succeeds. *(Sheet 2 A-02)*
- **BR-008** — The platform retains a commission at the rate stored on the booking (`take_rate`,
  `0.0500` today). `platform_fee = ROUND(price × take_rate, 2)` and
  **`coach_payout = price − platform_fee`** — the payout is derived by subtraction, never computed
  independently as 95%, so the two always sum to `price`. Both are recorded per booking.
  *(Sheet 2 A-02; Sheet 4 A-04; charter §I; derivation per [ADR-0007](adr/ADR-0007-money-split-derived-by-subtraction.md))*
- **BR-009** — `payment_status` progresses `none → pending → paid → refunded`. Refunds and
  chargebacks are reconciled through PayMongo. A transition outside this sequence is rejected **and
  alerted**, never silently dropped ([ADR-0009](adr/ADR-0009-webhook-alert-slot-fk-coach-deletion.md)).
  *(Sheet 4 A-04)*
  > **Known gap:** this sequence cannot express a failed or expired payment, so a failed booking
  > stays `pending` indefinitely. [ADR-0013](adr/ADR-0013-payout-ledger-and-payment-states.md)
  > proposes adding `failed` and `expired`, and blocks Wave 4.

**Reviews**

- **BR-010** — A student may submit exactly one review per completed booking, and only for bookings
  marked `completed`. Reviewing is optional and dismissible. *(Sheet 2 A-04)*
- **BR-011** — A coach's average rating and review count update immediately on submission. The
  review shows on the public profile with the reviewer's first name only. *(Sheet 2 A-04)*

## User flows

Step-by-step flows live in [`user-flow.md`](user-flow.md) (`UF-###`), traversing the screens in
[`sitemap.md`](sitemap.md) (`S-###`). Not restated here — see [`index.md`](index.md) §0.

| Journey | Realised by |
|---------|-------------|
| UJ-001 | UF-001 |
| UJ-002 | UF-002, UF-003 |
| UJ-003 | UF-004, UF-005 |
| UJ-004 | UF-006 |
| UJ-005 | UF-007, UF-008 |
| UJ-006 | UF-009, UF-010 |
| UJ-007 | UF-011 |

## Acceptance criteria

Condensed from the workbook's numbered criteria. The workbook's per-story `Total` is its criteria
count, tracked as Passed/Failed/Rate — that tracker is the seed of the QA plan.

- **F-001:** the landing page presents both pillars with direct links; featured internships and
  coaches come from live data, not fixtures; a primary Get Started CTA leads to signup alongside a
  how-it-works explainer; the value proposition is above the fold and the page is fully responsive.
- **F-002:** keyword search covers role, company, field, location and requirements; filters for
  field, work setup (remote/hybrid/onsite), compensation (any/paid/unpaid) and duration; sort by
  newest, deadline-soon, relevance; cards show logo, title, company, location, duration, paid
  badge, field and a deadline countdown; result count, loading skeletons and an empty state with
  "clear filters" all render; filters are a sidebar on desktop and a bottom drawer on mobile.
- **F-003:** shows title, linked company, location, work setup, paid badge, duration and deadline;
  description, requirements/qualifications and perks; Apply, Save toggle and Share (copy link);
  relevant coaches cross-sold; related internships in the same field.
- **F-004:** Apply opens the posting's external apply URL in a new tab; the UI clearly signals the
  student is leaving; **no resume, cover note, or application is collected**; no account is
  required; the outbound click is recorded for analytics.
- **F-005:** a save toggle is present on both cards and detail; saving from a card does not
  navigate away from the directory; saved internships appear under Dashboard → Saved.
- **F-006:** the company directory lists logo, industry, location and open-role count, and is
  searchable; a company profile shows logo, name, verified badge, industry, size, location,
  website, about, and its open internships.
- **F-010:** the hub explains how coaching works and surfaces top-rated coaches; the directory
  supports keyword search and filters by expertise and price (any/free/paid); cards show avatar,
  name, headline, rating with review count, expertise, price or "Free coaching", and a Book CTA.
- **F-011:** the profile shows bio, expertise, experience, languages, session types, rating and
  reviews; the booking dialog takes session type, day, time slot and optional notes; a free session
  confirms directly; a paid session creates a `pending` booking and routes to PayMongo checkout
  (card / GCash / Maya / GrabPay), confirming on payment success; the student can save a coach.
- **F-012:** the programs list shows price or Free, duration and schedule; the detail shows
  description, week-by-week curriculum, assigned coaches and an auth-gated Enroll CTA.
- **F-013:** a "Rate this session" prompt appears on Bookings for `completed`, unreviewed sessions;
  the student picks 1–5 stars and may add text; the prompt is dismissible and reviewable later;
  once submitted the review appears on the coach's public profile with the reviewer's first name;
  the coach's average and count update immediately; one review per completed session only.
- **F-020:** signup supports email + password and Google; signup routes to onboarding capturing
  school, course, year level and skills; password reset and persistent sessions work; auth state
  drives the navbar.
- **F-021:** the overview shows saved-item and upcoming-session counts and a profile-completeness
  meter; **no application tracking appears anywhere**.
- **F-022:** bookings split upcoming vs past; confirmed sessions show a join link; pending paid
  sessions show a Complete-payment action with the amount due.
- **F-023:** the profile edits name, school, course, year, skills, bio, avatar and resume; settings
  manage email, password, notification preferences and logout.
- **F-030 / F-040:** signup supports email + password and Google; first signup routes to
  role-appropriate onboarding (company: name, industry, location — coach: bio, expertise, session
  types, pricing); returning users land on their own dashboard; password reset and persistent
  sessions work.
- **F-031:** the form covers company name, logo, industry, size, location, website and
  about/description; edits validate and save immediately and are reflected in the public directory
  and profile; the verification badge appears only once verified; the employer sees their own
  postings across `open`, `pending` and `rejected`.
- **F-032:** an employer can create/edit a company profile and post internships via a form
  including the external apply URL; new posts enter `pending` and are not public; the employer sees
  their own listings; **no applicant inbox or screening exists**.
- **F-033:** an employer can edit any of their own postings in any status; saving an edit to an
  `open` posting sets it to `pending` and removes it from public view; a clear notice explains
  re-moderation; the queue shows it as a resubmission; withdraw removes it from public view
  immediately regardless of status.
- **F-041:** a coach can edit their profile, set free/paid and a rate, and manage availability, and
  can see and manage upcoming and past sessions.
- **F-042:** paid bookings collect via PayMongo and confirm on success with `payment_status = paid`;
  the platform retains 5% and records `coach_payout` at 95% of price; `payment_status` progresses
  `none → pending → paid → refunded`, with refunds and chargebacks reconciled through PayMongo.
- **F-043:** the coach profile offers Apply for verification with document upload (ID, certificates
  or proof of experience) and a short statement; submitting sets status `Pending` and disables
  re-submission until resolved; the coach sees their current status among Not Verified, Pending,
  Verified, Rejected.
- **F-050:** admins see a queue of `pending` internships and approve (`open`) or reject
  (`rejected`); only `open` internships are publicly visible, **enforced by the server API**.
- **F-051:** admins see a queue of `Pending` coach verification requests with the submitted
  documents and statement; approving sets `Verified` and the badge appears immediately; rejecting
  sets `Rejected` and notifies the coach, who may resubmit with updated documents.
- **F-052:** `[assumption]` — undefined. F-031 requires an admin-granted company verification badge
  but no story specifies the queue, the evidence required, or the notification. See Q1.

## Non-goals

- Scholarships and grants, despite the iSkolar name. *(charter §I)*
- Full-time jobs. Internships and OJT only. *(charter §I)*
- Applicant collection, screening, or tracking of any kind. No ATS. *(BR-001, BR-014, BR-015)*
- CHED SIPP compliance workflow: MOA management, endorsement, OJT hour logging, certificates of
  completion, CHED annual reporting. Vocation lists OJT roles and sells OJT-readiness coaching; it
  is not in the HEI's regulatory path.
- Stipend or allowance disbursement. Money moves only student → platform → coach.
- Employer analytics, and any HEI or university-facing surface. No such role exists.

Full reasoning: [`VOCATION.md`](https://github.com/iskolar-web3/vocation-server/blob/main/VOCATION.md) §B10.

## Dependencies

| Dependency | Used for | Failure mode |
|------------|----------|--------------|
| PostgreSQL | System of record | Outage → platform down |
| **PayMongo** | Paid booking collection, refunds, chargebacks (F-011, F-042) | Outage → paid bookings stall in `pending`; free bookings unaffected. Webhook loss → payment state diverges from reality. **The highest-consequence dependency** |
| Google OAuth | Sign-in for all three roles (F-020, F-030, F-040) | Outage → Google sign-in fails; email/password unaffected |
| AWS | Hosting, per charter §II | Region outage → platform down |
| Employer external apply URLs | F-004 | Dead or changed URL → student hits a 404 on someone else's site. Needs link health checking, unspecified |
| Object storage for uploads | Resumes (F-023), verification documents (F-043), logos and avatars | Outage → uploads and document review fail |

## Open questions

| # | Question | Blocks | Owner | Needed by |
|---|----------|--------|-------|-----------|
| Q1 | ~~F-052 company verification is implied but unspecified.~~ **Moot for v1** — F-031 and F-052 both deferred (ADR-0010). Reopen with the employer module | F-031, F-052 | PM | if employer module revives |
| Q2 | **Charter contradicts itself on the backend:** §I prose says Bun + Hono + TypeScript, §II tools list says Go. Owner stated Go. | `system-design`, `api-spec` | Project Lead + PM | before server code |
| Q3 | **Milestone dates run backwards:** M4 Testing July 09–10 2026 and M5 Deployment July 14 2026 precede the Sept 05 2026 charter and today's date. All others TBD. | scheduling | PM | immediately |
| Q4 | "Blockchain components" appears in the Full Stack Developer's responsibilities and nowhere else in the charter or the 24 stories. Real or copy-paste? | scope | Project Lead | before build |
| Q5 | "Sort: relevance" (F-002) is undefined. Relevance against what — the student's onboarding skills, their saved roles, keyword match strength? | F-002, `methods` | PM | before F-002 |
| Q6 | Notification preferences exist (F-023) but no story defines what is sent, on what trigger, or by what channel. | F-023 | PM | before F-023 |
| Q7 | **Refund and chargeback flow undefined.** `payment_status` includes `refunded`; who initiates, on what policy, and what do the student and coach see? A chargeback after a coach payout means the platform is out of pocket. | F-042 | PM + Security Engineer | before payments go live |
| Q8 | **Is the 5% take rate viable?** 5% of a peso-denominated session against a fixed PayMongo per-transaction fee may be negative on small bookings. | revenue model | PM | before build |
| Q9 | When is a booking marked `completed`? BR-010 gates reviews on it and F-042 gates payout on collection, but no story says who or what sets `completed`. | F-013, F-042 | PM | before F-013 |
| Q10 | Coach payout **mechanism** is unspecified. BR-008 records `coach_payout`, but nothing says how a coach actually receives money — PayMongo disbursement, manual bank transfer, or held balance? | F-042, `ops` | PM | before coach onboarding |
| Q11 | RA 10173: resumes (F-023) and coach government IDs (F-043) are sensitive personal information. NPC registration is mandatory at 1,000+ affected data subjects. Is Vocation registered, and is a DPO named? | `security-compliance` | Security Engineer | before public launch |
| Q12 | **One developer, four modules, two repos**, two security roles, no named designer or QA — against a full Design milestone and a JMeter/Vitest/Manual Testing milestone. | delivery feasibility, `sad` | PM | before M2 |
