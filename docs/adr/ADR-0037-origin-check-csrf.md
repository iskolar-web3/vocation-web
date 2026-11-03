<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0037 — Check browser origin on write requests

- **Date:** 2026-10-20
- **Status:** Accepted
- **Builds on:** [ADR-0023](ADR-0023-cors-web-origin.md) (cookie auth, same-site web/API topology and `WEB_ORIGIN`).

## Context

Session cookies use `SameSite=Lax`, and CORS restricts browser access to responses. These controls do
not themselves reject a state-changing request sent from another origin. The API needs a request-side
CSRF check while preserving non-browser clients and PayMongo webhook delivery.

## Options considered

1. **Check `Origin`, with `Sec-Fetch-Site` when `Origin` is absent.** Uses browser-supplied request
   context and the existing `WEB_ORIGIN` setting. Chosen.
2. **Require an `Origin` on every write.** Rejected because server jobs and command-line clients may
   send neither browser header.

## Decision

An outer middleware checks methods other than `GET`, `HEAD`, and `OPTIONS` before session or route
handling. When `Origin` is present, it must exactly equal non-empty `WEB_ORIGIN`; `null`, empty,
multiple, or foreign origins receive `403 forbidden_origin`. When `Origin` is absent,
`Sec-Fetch-Site` may be absent or exactly `same-origin`, `same-site`, or `none`; other values receive
the same error. `Origin` takes precedence when both headers are present.

`POST /webhooks/paymongo` is exempt because PayMongo sends server-to-server requests authenticated
by a signature over the raw body. Only that method and exact path are exempt. CORS remains outside
this check, so it answers preflights and attaches its allowed-origin headers to errors.

## Consequences

- Browser writes from another origin fail before a handler can change state.
- Non-browser clients without either header continue to work. `WEB_ORIGIN` must be set for browser
  writes, including local development.
- The webhook still relies on its existing signature verification, not browser headers.
