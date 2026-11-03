<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0035 — Transactional email through Resend

- **Date:** 2026-10-18
- **Status:** Accepted
- **Builds on:** [ADR-0036](ADR-0036-railway-vercel-deploy.md) (Resend is the email provider).
- **Owner:** Issue #69 (part A: the email foundation and the account flows; booking and payout emails follow).

## Context

Password reset generated a token that nothing delivered, and a signup could claim any address. The API needs
to send email, with no new dependency, and a mail outage must never break signup, sign-in or reset.

## Decision

1. **Provider and sender.** Resend, over `net/http` to `https://api.resend.com/emails` (Bearer
   `RESEND_API_KEY`, JSON `from/to/subject/html/text/reply_to`, 10-second timeout). Mail is sent from the
   subdomain `send.vocation.iskolar.io` (`EMAIL_FROM`, default `Vocation <no-reply@send.vocation.iskolar.io>`)
   with `Reply-To` `EMAIL_REPLY_TO` (default `support@iskolar.io`). SPF, DKIM and DMARC records for that
   subdomain are added in Cloudflare as listed in `ops.md` §5 *Resend DNS*; using a subdomain keeps the
   reputation of the root `iskolar.io` mail separate.
2. **Free-plan limits.** Reset sends retain the 5 / 15 minute IP-and-email limiter and add 20 / hour per IP
   and 3 / hour per account caps. Excess account sends are silently skipped while the endpoint still returns
   202. Verification resend remains limited to 3 per hour per account.
3. **Sender interface and log-only fallback.** `internal/email.Sender` has one method, `Send(ctx, Message)`.
   With `RESEND_API_KEY` empty the API uses a log-only sender that logs the recipient and subject, never
   the body, a token or a link, so local runs and the Docker smoke test need no email account.
4. **Async, failure never fails the request.** Handlers send only after the DB write that created the token
   has committed, in a bounded background goroutine (8 at a time; a full queue drops the message and
   reports it). A delivery failure goes to `observe.ReportError` (log and Sentry); the user's request has
   already succeeded. Sending in the background also keeps the reset-request response time independent of
   whether the address exists. Cost: a message can be lost if the process stops between commit and send;
   the user recovers with "resend verification" or "forgot password".
5. **Links.** `WEB_BASE_URL` (falling back to `WEB_ORIGIN`) plus `/reset-password?token=…` and
   `/verify-email?token=…`. Tokens are 32 random bytes, stored only as SHA-256 hashes, and never logged. A verification token also stores the address it was mailed to and verifies only while
   the account still has that address; a reset token is only created while the account's email still equals the
   address being mailed (both bound under the account row lock), so a concurrent email change cannot leave a
   live link for an old address.
6. **Email verification does not block sign-in.** Signup sends a verification email; the link (24 hours,
   single-use, table `email_verification_token`) sets the existing `account.email_verified_at`. `GET /me`
   returns `email_verified`. An unverified account can sign in and use the product; a later feature can
   gate specific actions on `email_verified` without a data change.
7. **Session hygiene.** A successful password reset revokes all of the account's sessions; the new
   `POST /auth/password/change` revokes all sessions except the caller's.

8. **Emails sent (part B).** Booking confirmed (student and coach; free bookings at creation, paid bookings when
   the verified PayMongo webhook confirms them, with the join link when set), payment receipt (student, on paid
   confirmation), booking cancelled (student and coach, with the refund status: "full refund started", "no
   refund (cancelled within 24 hours)", or none when nothing was paid), refund completed (student and coach,
   on the verified `refund.succeeded`), and payout details changed (coach, masked account). All are sent after
   the commit through the same background sender, so a mail failure never fails a booking or a webhook; the
   webhook reads the booking before applying an event so a replay, duplicate or rejected delivery sends nothing, and only the delivery whose transaction actually moved
   the booking sends (two different paid events racing for one booking send once).
   `PATCH /me/settings` with a password revokes the account's other sessions like `POST /auth/password/change`.
   Changing the email there also needs the current password (same shared limiter), resets `email_verified_at`,
   expires pending reset and verification links, sends a verification link to the new address and a notice to
   the old one, so a stolen session cannot redirect password resets to an attacker's mailbox unnoticed.

## Alternatives rejected

- **SMTP or SES.** More configuration and a dependency or a second cloud account for the same result.
- **Blocking sign-in until verified.** A mail outage or a spam-folder miss would lock real users out of a
  launch-week product; the verified flag still lets us restrict specific actions later.
- **Sending inside the request.** A Resend outage would add its 10-second timeout to signup and reset.

## Consequences

- New env vars `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`, `WEB_BASE_URL` (`ops.md` §2).
- Migration 000024 adds `email_verification_token` (`erd.md`).
- A reset or verification link is only as private as the recipient's mailbox; links are single-use and expire.
