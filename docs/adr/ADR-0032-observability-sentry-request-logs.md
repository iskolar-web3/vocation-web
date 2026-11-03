<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0032 — Observability: Sentry for errors, one log line per request, DB-aware health check

- **Date:** 2026-10-15
- **Status:** Accepted

## Context

Issue #71. About 70 handler paths answered `500`/`502` with the safe ADR-0018 message and dropped
the underlying error, so a failure left no trace anywhere. Nothing logged requests, a handler panic
fell through to `net/http`'s default (the stack goes to stderr and the client gets an empty
response), the auto-complete worker would have died silently on a panic, and `GET /healthz` reported
healthy even when the database was gone. The server also had no read, write or idle timeouts and no
cap on request bodies. Hosting moved to Railway, so the CloudWatch alarm from ADR-0029 no longer
covers us; #32 builds the `ALERT` alerting on top of this ADR.

## Decision

1. **Sentry Go SDK** (`github.com/getsentry/sentry-go`), configured by `SENTRY_DSN` and switched off
   when it is unset. `SendDefaultPII` is off, and a `BeforeSend` scrubber
   (`observe.Scrub`) also removes the user block, cookies, bodies, query strings, the gateway
   webhook headers, and any e-mail address or long digit run in messages, exceptions and
   breadcrumbs.
2. **Every 5xx reports its cause.** Handlers call `httpx.WriteInternalError(w, r, err)` (or
   `WriteServerError` for 502/503). That writes a log line `ERROR request_id=<id> <cause>` and sends
   a Sentry event; the response body is unchanged. Expected states (Google sign-in not
   configured) are not reported.
3. **`observe.Middleware` is the outermost layer.** It takes a valid inbound `X-Request-ID`, or
   generates one, and echoes it on the response. It gives each request its own Sentry hub tagged
   with that ID, turns a panic into a reported `500 internal_error`, and writes
   `request id=… method=… path=… status=… latency_ms=…`. The query string is left out because it
   can carry personal data.
4. **Background goroutines recover per iteration** (`defer observe.Recover(ctx, "<where>")`), so a
   panic is reported and the next tick still runs.
5. **`GET /healthz` pings the database** with a 2-second timeout: a bare `200 {"message":"ok"}`, or
   `503 unavailable`. A failing ping is logged but not sent to Sentry, so a probe during an outage
   doesn't flood it.
6. **Server limits:** `ReadHeaderTimeout` 5s, `ReadTimeout` 15s, `WriteTimeout` 30s (above the
   gateway client's 15s), `IdleTimeout` 120s, and every request body capped at 1 MiB (files go to
   storage through presigned URLs, never through the API).

## Consequences

- A user can quote the `X-Request-ID` from a failed response, and it finds the request line, the
  `ERROR` line and the Sentry event.
- The health check now fails when the database is unreachable, so the platform restarts or stops
  routing to an instance that cannot serve. A database outage therefore marks every instance
  unhealthy at once, which is what we want for a single-database monolith.
- Liveness and readiness are no longer separate. If we ever need both, add a `/livez` that does not
  touch the database.
- One more dependency (sentry-go v0.29.1, chosen because it supports Go 1.23, which CI uses).
