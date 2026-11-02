<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0023 — CORS for the web origin: env-configured origin, credentials-enabled cookie auth, same-site topology

- **Date:** 2026-09-22
- **Status:** Accepted

## Context

`api-spec.md` Q6 asked whether session cookies vs bearer tokens was settled, on the grounds that
cookie auth requires a same-site browser client as well as a configured CORS origin — and the
deployed domain topology was never pinned down. Two facts are already decided and were not reopened
here:

1. **The auth scheme is a session cookie.** `api-spec.md` §Authentication records, for all browser
   calls, an `HttpOnly`, `Secure`, `SameSite=Lax` session cookie. This is a decided fact, not an
   open question.
2. **The two repos are separate origins.** `vocation-web` and `vocation-server` deploy independently
   ([ADR-0002](./ADR-0002-two-repo-split.md)), so the browser will treat them as cross-origin and
   block credentialed responses until the API sends CORS headers.

With no CORS middleware in `cmd/api/main.go`, every browser call from `vocation-web` was blocked
before it reached any handler. Q6 needed the CORS mechanics and the deployed domain topology fixed.

## Options considered

1. **Wildcard `Access-Control-Allow-Origin: *`.** Pro: zero configuration. Cons: illegal with
   `Access-Control-Allow-Credentials: true` — the browser rejects the combination, so it cannot
   serve cookie auth at all. Rejected outright.
2. **One origin per deployment, read from an env var (`WEB_ORIGIN`).** Pro: matches how every other
   deployment-specific value (`DATABASE_URL`, `S3_BUCKET`, `GOOGLE_CLIENT_ID`, …) is already
   configured; a single allowed origin is the whole CORS surface the product needs (one web client,
   one API). Cons: a new environment would need the var set. Chosen.
3. **A hardcoded origin list in code.** Pro: no env config. Cons: a redeploy per domain change, and
   secrets/stage separation argues against baking the domain into the binary.

## Decision

**Option 2.** `cmd/api/main.go` reads `WEB_ORIGIN` and passes it to a `corsMiddleware` that sits
outermost in the handler chain (before `OptionalSession` and the mux):

- A request whose `Origin` equals `WEB_ORIGIN` gets `Access-Control-Allow-Origin` (the exact origin,
  never `*`) and `Access-Control-Allow-Credentials: true`, because cookie auth requires credentials.
- Preflight `OPTIONS` is answered by the middleware (204 with `Allow-Methods`, `Allow-Headers`,
  `Max-Age`) before any route matching, so it never hits the method-patterned mux.
- An empty or non-matching origin gets no CORS headers, so the browser blocks the response — the
  middleware is permissive by default off (`WEB_ORIGIN` unset ⇒ CORS disabled).

**Credentials-enabled cookie auth is confirmed as final.** No bearer-token alternative is being
reopened; Q6 was only ever about the CORS mechanics and topology that the cookie choice implies.

**Deployed domain topology is decided:** the web app and API MUST use HTTPS origins under the same
registrable domain, such as `https://app.<domain>` and `https://api.<domain>`. Their origins differ,
so browser requests need the exact `WEB_ORIGIN` CORS match and credentials enabled; their site is
the same, so the API's host-only, `Secure`, `SameSite=Lax` session cookie is sent to the API on
credentialed fetches. Locally, `http://localhost:5173` to `http://localhost:8080` is also same-site
because the port does not change the site. The actual registered domain is selected per deployment;
its name is not part of this topology decision.

Serving the web app and API from different registrable domains is rejected. Cross-site fetches
would require `SameSite=None` for the session cookie, increasing CSRF exposure.

## Consequences

- **Easier:** the browser client can now make credentialed calls from its own origin; the allowed
  origin is a per-deployment knob, not a redeploy-per-domain.
- **Harder:** every deployment (preview, staging, production) must set `WEB_ORIGIN`; leaving it
  empty silently disables CORS, which reads as "requests blocked" rather than failing loudly.
- **Owed:** choose the actual registered domain and set each deployment's API URL and `WEB_ORIGIN`
  accordingly, while preserving the same-site topology.
