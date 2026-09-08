<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0006 — Store no applications; apply by redirect

- **Date:** 2026-09-07
- **Status:** Accepted

## Context

The charter and the workbook both state this in unusually absolute terms:

- Charter §I: "Students apply on each company's own website; the platform hosts the postings and
  links out, **storing no applications**."
- Charter §II.1.c: "the platform only hosts the posting and stores no applications."
- Workbook Sheet 1 A-04: "The platform does **NOT** collect resumes, cover notes, or applications."
- Workbook Sheet 3 A-02: "There is **no** on-platform application tracking."
- Workbook Sheet 4 A-01: "There is **NO** applicant inbox or screening."

Stated five times across two documents, it is a deliberate product boundary rather than a scoping
shortcut. It deserves an ADR because it is the decision a future reader is most likely to try to
reverse — "why don't we just collect applications?" is the obvious feature request from every
direction.

## Options considered

1. **Redirect only, store nothing** — pros: employers keep their existing pipeline, so adoption
   needs no change on their side; the platform stays out of scope for holding application data
   under RA 10173; no ATS to build, which is a large product in itself; the value proposition stays
   focused on discovery plus coaching. Cons: Vocation can never observe an outcome — it cannot know
   whether a student was interviewed or hired, so the deepest funnel signal available is an
   outbound click.
2. **Collect applications on-platform (become an ATS)** — pros: full funnel visibility, an obvious
   employer-side monetisation, and outcome data that would make matching possible. Cons:
   contradicts the charter five times over; employers already have an ATS and resist a second one;
   holding resumes-as-applications for thousands of students materially expands RA 10173 exposure;
   and it is a far larger build for one developer.
3. **Hybrid: optional apply-through for employers without an ATS** — pros: captures outcomes where
   employers permit it. Cons: two application models to build and explain, and a partial funnel is
   hard to reason about.

## Decision

**Option 1**, as specified. Apply is an outbound redirect (`F-004`, `API-003`). The only artifact
retained is an `apply_click` row, whose `account_id` is **nullable** because BR-002 allows applying
without an account.

This is why the revenue model is coaching (`VOCATION.md` §B4): the listing is deliberately not
monetised, so the platform can aggregate internships that no job board finds worth aggregating.

## Consequences

- **Easier:** employer onboarding is just a posting form. No resume storage for applications, no
  screening UI, no employer-side ATS. RA 10173 exposure stays limited to profile resumes (which the
  student controls) and coach verification documents.
- **Harder:** no outcome data, ever. `apply_click_out` is the deepest event Vocation can measure
  (`user-flow.md` §6), so "did this student get the internship?" is permanently unanswerable from
  platform data. Any future matching or ranking feature has no ground-truth label to learn from.
  A dead `external_apply_url` also sends a student to someone else's 404 with no detection
  (EV-002).
- **Owed:** treat reversal as a business-model change, not a feature addition. Reversing it means
  reopening `VOCATION.md` §B4 and §6, the revenue model, and the RA 10173 assessment together.
