<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0033 — Postgres rate limits and replica-safe background jobs

- **Date:** 2026-10-18
- **Status:** Accepted

## Context

Issue #73. The API runs on Railway and can run as more than one replica. Rate limits lived in
process memory (`internal/platform/ratelimit`), so two replicas doubled every limit and a restart
reset them. Two background workers (auto-complete, checkout expiry) run inside every API process.
The API should hold no state that matters across requests.

## Decision

1. **Counters live in Postgres.** Migration `000020_rate_limit_counters` adds `rate_limit(key_hash
   PK, count, window_ends)`. `ratelimit.PGStore.Hit` is one atomic
   `INSERT … ON CONFLICT (key_hash) DO UPDATE … RETURNING count, window_ends − now()`. It uses the
   database clock only, so replicas with skewed clocks agree on the window. The window is fixed:
   once `window_ends` has passed the next hit resets the count to 1.
2. **Same limiter, injectable store.** `ratelimit.Limiter` keeps its `Allow`/`Middleware` shape
   and its in-memory buckets as the default (unit tests, fakes). `Limiter.WithStore(name, store)`
   switches it to a shared `Store`. Handler constructors are unchanged; `cmd/api/main.go` calls
   `WithRateLimitStore(store)` on the iam, internships and booking handlers. Limit values and the
   limited routes are unchanged. Retry-After comes from the `window_ends − now()` the database
   returns. Rejected requests also increment the counter (harmless in a fixed window).
3. **Privacy.** Only `sha256(bucket|key)` in hex is stored, so raw IPs and the `ip|email` signin
   and reset keys never reach the table. Classification and retention are in `docs/erd.md`.
4. **Cleanup.** `DELETE FROM rate_limit WHERE window_ends < now()` runs every 10 minutes from
   `runRateLimitSweeper` in each replica, with the same `observe.Recover` / `observe.ReportError`
   guard as the other workers. It is idempotent, so concurrent replicas are harmless.
5. **Fails open.** If the store errors (database down, timeout) the limiter allows the request and
   calls `observe.ReportError`. A database blip must not lock every user out of signin; every
   such request would also need the database to do anything useful, so the exposure is short.
   Brute-force protection is reduced for the length of the outage.
6. **Proxy header.** `TRUST_PROXY` and `ratelimit.ClientIP` assumed an ALB. They now refer to the
   platform proxy (Railway). **External evidence still needed:** Railway's `X-Forwarded-For`
   semantics (which entry is the real client) must be confirmed on the deployed environment before
   relying on the *last*-entry rule.

## Replica safety of the workers

- **Auto-complete** (`AutoCompleteStaleBookings`) is a single
  `UPDATE booking … WHERE status='confirmed' AND …` plus `INSERT … ON CONFLICT DO NOTHING` in one
  transaction. A second replica blocks on the row locks, re-evaluates `WHERE` after the first
  commits, and no longer matches. Each booking completes once and its earning is credited once.
  `TestAutoCompleteTwoReplicasProcessEachBookingOnce` proves it. While writing the test the query
  was found to fail on every run (`timestamp with time zone <= interval`, because `$2` was
  inferred as an interval); `$2` is now cast with `::timestamptz`.
- **Checkout expiry** (`ExpireStaleCheckouts`) lists candidates without a lock, then processes each
  inside `WithLockedBooking` (`SELECT … FOR UPDATE`) and re-checks `status`/`payment_status`/
  `updated_at` on the locked row. The second replica waits, then sees the booking already expired
  and skips it, so the gateway `Expire` call also happens once.
  `TestExpireStaleCheckoutsTwoReplicasProcessEachBookingOnce` proves it. Residual duplicate: if
  replica A's gateway call succeeds but its commit fails, the next run calls `Expire` again. The
  gateway call is documented as idempotent ("nil if expired now or already expired"), so this is
  harmless.

## Statelessness audit

| Finding | State | Verdict |
|---|---|---|
| Rate limiters | In-memory | Moved to Postgres (this ADR) |
| Sessions, password-reset tokens | Postgres | Fine |
| Landing page cache | In-memory, 60 s TTL, read-only | Fine; per-replica staleness is bounded by the TTL |
| Uploads | Presigned locally; the browser PUTs straight to S3; nothing is written to local disk | Fine |
| Workers | Goroutines in each API process | Replica-safe (above) |
| Local files | None read or written at request time | Fine |

**S3 outage.** `uploads.Signer.PresignPUT` is pure local HMAC and makes no network call, and
startup does not touch S3. A missing or broken S3 config therefore cannot affect any other route;
`TestMissingS3ConfigOnlyAffectsUploadRoutes` covers it. Known gap: with an empty config the signer
still returns a URL (with an empty host and credentials) instead of an error, so the failure shows
up when the browser PUTs. Not changed here.

## Consequences

- Every rate-limited request now costs one small Postgres write. Limits are per window per key and
  apply across all replicas, and survive restarts.
- A new table with a short-lived, hashed key set; the sweeper keeps it small.
- The in-memory limiter stays in the code for tests only.
