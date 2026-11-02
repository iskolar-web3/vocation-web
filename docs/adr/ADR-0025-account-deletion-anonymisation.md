<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0025 — Account deletion and retained-record anonymisation

- **Date:** 2026-10-01
- **Status:** Accepted

## Context

`erd.md` Q7 asks how an account can be erased without destroying payment history. RA 10173
recognises a right to erasure (Sec. 16(e)) and requires personal data to be kept only as long as
necessary for its purpose or as required by law (Sec. 11(e)); the right is not a reason to erase
records that must be retained. The project security assessment also says an account-deletion
mechanism and internal process are still missing.

The ERD already specifies that profiles and resumes are held for the life of the account, booking
money fields are retained for 10 years `[assumption]`, payment events for 10 years `[assumption]`,
reviews indefinitely, apply-clicks for 24 months `[assumption]`, and audit logs for 10 years
`[assumption]`. These periods are not confirmed statutory periods; the ERD says every retention
period is an assumption pending the Security Engineer's compliance review. The ERD gives no
retention period for `ledger_entry`, `payout_batch`, or `moderation_action`.

The migrations use ordinary restrictive foreign keys for account-owned records; they do not
provide an account-delete cascade. `payment_event` has database triggers rejecting UPDATE and
DELETE (migration 000007). `ledger_entry` is designated append-only by ADR-0022, although its
current `coach_account_id` is non-null and references `coach_profile`. ADR-0007 and BR-008 require
the captured booking split to remain internally consistent. ADR-0009 already requires blocking
coach deletion while confirmed future bookings exist. ADR-0012 provides explicit cancellation and
refund behaviour; deletion must not silently substitute for that flow.

## Options considered

1. **Cascade-delete an account and its records.** Simple to explain, but destroys booking and
   payment evidence, conflicts with append-only constraints, and breaks the financial record
   needed for reconciliation.
2. **Keep the whole account as a soft-deleted record.** Preserves foreign keys, but continues to
   retain login identifiers, credentials and profile data after an erasure request.
3. **Erase account/profile data and unlink retained records.** Delete the identity and profile
   rows, remove references to the account where records must survive, and retain only the minimum
   financial/audit history with its existing money values. This needs explicit schema support for
   nullable references and a coordinated deletion operation.

## Decision

**Choose option 3.** A completed deletion request removes account identity and profile data. Where
a record must remain for the stated financial or audit purpose, remove its direct account link and
keep the minimum record. Do not change booking money, payment events, or append-only audit history.
This gives effect to RA 10173 erasure for profile and authentication data while retaining records
only for the documented purpose and stated period; the ten-year periods remain `[assumption]` and
must be validated by the Security Engineer/counsel before launch. This ADR does not assert a
specific statutory record-keeping period.

Deletion processing is ordered and transactional where possible:

1. Re-authenticate the requester, revoke every active session, clear the session cookie, and
   invalidate outstanding password-reset tokens.
2. For a coach, reject the request while any booking is `confirmed` with `slot_ends_at > now()`.
   Do not cancel bookings or trigger refunds as a side effect. ADR-0012 has explicit participant
   cancellation rules and refund consequences; deletion cannot decide for the parties or imply
   session cancellation. Once no such confirmed future booking exists, continue with erasure.
3. Delete the account's resume and avatar S3 objects (and any other personal profile upload), then
   clear the corresponding object keys. Failed object deletion is retried and the request is not
   reported complete until the personal objects are removed. Verification documents are deferred
   with F-043 in v1; if introduced, their existing purge rule is decision + 90 days `[assumption]`
   and the objects must also be purged on an erasure request unless a documented retention need
   applies.
4. Anonymise retained rows as below, hard-delete account-owned transient/profile rows, and finally
   hard-delete `account`. There is no soft-deleted login account.

### Per-table disposition

| Table / data | Deletion disposition |
|---|---|
| `account` | Hard-delete after dependent data is handled. Do not retain email, `google_sub`, password hash, verification timestamp, or a tombstone login. |
| `student_profile` | Hard-delete the row. Delete `resume_key` and `avatar_key` objects from S3 first. This removes name, school, course, year, bio and skills. |
| `coach_profile` | Hard-delete the row after the future-confirmed-booking block is clear. Delete its avatar object; remove display name, headline, bio, experience, languages, slug, default join URL and other profile data. Retain no public profile stub. |
| `session` | Revoke then hard-delete all rows for the account immediately. Session rows have no longer-term retention purpose. |
| `password_reset_token` | Hard-delete all rows immediately, including expired or used tokens. The normal token expiry is one hour; deletion does not wait for expiry. |
| `saved_internship`, `notification_preference` | Hard-delete account-owned rows. They are not needed after the account is erased. |
| `company.owner_account_id` | Set the nullable owner reference to `NULL` and retain the public company/listing rows. Admin owns listings in v1; do not delete a company because a former owner account is erased. |
| `coach_expertise` | Hard-delete the coach's profile-to-skill associations. The shared `skill` vocabulary is not account data and remains. |
| `session_type` | Delete unbooked coach session types. Retain any type referenced by a retained booking, but remove its coach association and identifying name/details; a migration must make that reference nullable before coach erasure. |
| `availability_slot` | Delete unbooked slots. For slots referenced by retained bookings, retain the booked time needed to explain the booking but remove the coach association; a migration must make that reference nullable. Preserve the existing `ON DELETE RESTRICT` protection against deleting a booking while a slot points to it. |
| `booking` | Retain for 10 years `[assumption]`. Set the deleted student's `student_account_id` and/or deleted coach's `coach_account_id` to `NULL`; null `notes` and `join_url`. Keep booking id/status/times, `session_type_id` where available, `paymongo_intent_id`, and **all** `price`, `take_rate`, `platform_fee`, `coach_payout`, and `payment_status` values unchanged. The two BR-008 checks remain true; payout remains derived by subtraction as captured. |
| `payment_event` | Retain untouched for 10 years `[assumption]` as the append-only, idempotent payment audit/reconciliation trail. Never UPDATE or DELETE it. Its payload must not be used as a second profile store; payer PII is to be minimised/redacted before persistence as the ERD's retention row requires. API-045 currently describes storing the raw verified body, so reconciling that contract with this minimisation rule is a follow-up before implementation. |
| `ledger_entry` | Retain untouched as append-only money history. It has no retention window in the ERD; do not invent one here. Before Wave 4 writes entries, change the current `coach_account_id` FK shape so an erased coach's reference can no longer identify or constrain a deleted profile, without updating existing ledger rows. Resolve the retention period before ledger use. |
| `payout_batch` | Retain untouched as batch-level financial history. The ERD gives it no retention window; resolve that period with the ledger before Wave 4. It contains no account reference. |
| `review` | Retain the rating and booking relation indefinitely, but set `body = NULL` and the deleted reviewer's `student_account_id = NULL`. On coach deletion, set `coach_account_id = NULL`; do not leave a deleted person's public name or profile link. Update the aggregate for a deleted coach as part of removing the profile. |
| `apply_click` | Keep the event but set nullable `account_id = NULL` immediately for the erased account. Retain only to 24 months `[assumption]`, then aggregate and drop rows as the ERD specifies. Do not add application data (ADR-0006 / BR-001). |
| `audit_log` | Retain append-only for 10 years `[assumption]`; do not revise historical entries. Remove direct identity by deleting the account mapping; do not put profile PII in `metadata`. The retention window and any metadata minimisation need review before implementation. |
| `moderation_action` | Retain append-only and unchanged as the decision record. Its retention period is unspecified in the ERD and must be set before this table stores personal data at scale. Remove the account-to-actor mapping when an admin account is erased; do not put direct PII in `note`. A migration must remove the current restrictive `admin_account_id` FK before admin account erasure can complete without rewriting the append-only row. |
| `company`, `internship` | Retain public listing records under the existing indefinite window; account deletion does not delete platform-owned listings. Employer self-serve is deferred in v1. |
| `verification_request` / `verification_document` | Verification is deferred for v1 (ADR-0010). If revived, remove identifying request data on erasure and hard-delete S3 documents; the existing decision + 90 days `[assumption]` is an upper purge schedule, not a reason to deny a valid erasure request absent a documented retention need. |

These transformations require a forward migration before the deletion handler ships: nullable
account references where a retained row is currently `NOT NULL` (including both booking sides,
review account references, `session_type`, retained `availability_slot`, and the ledger's coach
reference strategy), plus a foreign-key policy that permits account removal only after deliberate
anonymisation. Remove the restrictive admin-actor FK from append-only `moderation_action` before
admin erasure is supported. No cascade may delete booking, payment, ledger, review, or audit
history. Migrations 000006 and 000013 currently use non-null account references in booking and
ledger; a handler alone cannot satisfy this decision against the current schema.

Deletion is not currently an API operation: `api-spec.md` has `POST /auth/signout` and profile
updates, but no account-delete endpoint. The endpoint contract is out of scope for this ADR. A
follow-up API-spec change should define authenticated self-service `DELETE /me`; the `iam` module
should implement it with the ordered cleanup, retryable S3 deletion, audit trail, and coach-booking
precondition above. Admin-run deletion is not a substitute for the data subject request mechanism.

## Consequences

- **Easier:** a data subject can have credentials, contact identity, profile fields and uploads
  removed without deleting the money history or violating BR-008. Coaches cannot abandon confirmed
  future sessions through account deletion.
- **Harder:** the current schema cannot implement this policy unchanged. A migration and one
  transactional erasure workflow must precede the endpoint; S3 cleanup needs retry state. The
  API-045 raw-payload contract and the retention periods for ledger/batches/moderation still need
  privacy/compliance decisions.
- **Owed:** Security Engineer/counsel validates every `[assumption]` retention window and the
  permitted scope of financial/audit retention; the API slice adds `DELETE /me` and documents
  request handling and completion semantics.
