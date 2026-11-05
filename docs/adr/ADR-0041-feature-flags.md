<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0041 — Publish which optional integrations are on as four public booleans

- **Date:** 2026-11-05
- **Status:** Accepted
- **Owner:** The "coming soon" slice; Audit.md REG-08, REG-12, REG-16, REG-33, REG-34, REG-35 and
  the production facts of 2026-11-04.
- **Builds on:** [ADR-0018](ADR-0018-response-envelope.md) (response envelope),
  [ADR-0023](ADR-0023-cors-web-origin.md) (CORS for the web origin),
  [ADR-0035](ADR-0035-resend-email.md) (Resend email),
  [ADR-0031](ADR-0031-paymongo-gateway.md) (PayMongo checkout and webhook).

## Context

1. Production on 2026-11-04 runs with `RESEND_API_KEY`, the `S3_*`/`AWS_*` group and the
   `PAYMONGO_*` group unset. Email is logged, never delivered; `POST /uploads/presign` answers
   `503`; a paid checkout cannot complete. The web still renders the controls for all three, so a
   student meets a dead end with no explanation.
2. Some of those absences are expected for a while (no sender domain, no bucket, no live gateway),
   so the web must show "coming soon" rather than an error.
3. The web cannot read the server's environment, and the server must not expose any of it. Only the
   fact *that* a feature is on may cross the boundary, never a key, bucket, sender address or URL.
4. Configuration is read once at startup: a change already requires a restart, so a flag can never
   change while a process is serving.

## Decision

1. **One public route.** `GET /features` is registered in `cmd/api/main.go` next to `GET /healthz`,
   so it sits inside the same CORS, origin guard, maintenance mode and body cap. It requires no
   session and is the only public route added by this slice (REG-08, REG-12).
2. **Four booleans, computed once.** The response is
   `{ "message": "ok", "data": { "email", "uploads", "checkout", "google_signin" } }` via
   `httpx.WriteOK` and `config.API.Features()`. `email` is `RESEND_API_KEY` set; `uploads` is the
   whole S3 group set; `google_signin` is the whole Google group set; `checkout` needs
   `PAYMONGO_SECRET_KEY` **and** `PAYMONGO_WEBHOOK_SECRET`, because a paid booking cannot be
   confirmed without the verified webhook (BR-007). The value is captured at startup; nothing from
   the request is read (REG-16).
3. **Booleans only.** The handler's data type is exactly those four fields. No config value,
   secret, bucket, sender or URL is ever in the body or in a log line this slice adds (REG-33).
   `DisabledFeatures()` derives from the same `Features()` and now also names
   `email (RESEND_API_KEY)` in the existing startup log entry.
4. **Five-minute cache.** The response carries `Cache-Control: public, max-age=300`. A restart
   cannot be observed faster than that; every consumer must tolerate the lag.
5. **The web fails open.** `useFeatures()` returns all four `true` while the request is loading and
   after it fails. An outage of `/features` therefore leaves today's behaviour untouched and never
   hides a feature that works.
6. **Maintenance mode wins.** `MAINTENANCE_MODE=true` answers `/features` with the usual `503`.
   The web treats that as a failed request (fail open) and its own `MaintenanceScreen` is what the
   student sees.

## Consequences

- A production config change can take up to five minutes longer than the deploy to reach the web,
  on top of the restart it already needed.
- The endpoint is a capability oracle: it tells an anonymous caller which optional integrations
  are configured. That is deliberate and bounded to four booleans; it reveals no secret and is the
  minimum the web needs to avoid dead ends.
- New optional integrations must be added to `Features` and to the contract in the same PR,
  otherwise the web cannot gate them.
- `/features` is intentionally not rate-limited and not cached by the server beyond the response
  header; it does no work beyond encoding a fixed struct.
