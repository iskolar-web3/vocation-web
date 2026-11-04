<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0036 — Deploy on Railway (API) and Vercel (web); retire the AWS deploy path

- **Date:** 2026-10-18
- **Status:** Accepted
- **Status note (2026-10-20):** Railway is the interim host until the team's AWS credits arrive. The
  server is made Railway-ready (`railway/*.toml`) but not yet deployed; the decision below is
  unchanged.
- **Supersedes:** [ADR-0029](ADR-0029-deploy-pipeline-and-migrations.md) (Terraform + GitHub Actions OIDC
  deploy, ECS Fargate, CloudWatch alarm) and the hosting part of
  [ADR-0003](ADR-0003-aws-postgres-not-supabase.md). The database host was already moved to Neon by
  [ADR-0016](ADR-0016-neon-postgres-not-rds.md).

## Context

ADR-0029 coded an AWS environment (ECS Fargate behind an ALB, Secrets Manager, CloudWatch alarm,
deploy workflow assuming a role over GitHub OIDC). It was never provisioned. The team has no ops
role, and the hosting actually in use is Railway for the API, Vercel for the web app, Resend for
e-mail and Sentry for errors ([ADR-0032](ADR-0032-observability-sentry-request-logs.md)). Keeping
the Terraform and `deploy.yml` in the tree would document an environment that does not exist.

## Decision

1. **API on Railway, built from the `Dockerfile`.** One Railway service, Docker builder, the
   existing multi-stage image (distroless, non-root, listens on `$PORT`, which Railway injects).
   Railway builds and deploys on push to the deploy branch; there is no deploy workflow in GitHub
   Actions. `ci.yml` keeps gating changes, including `scripts/docker-smoke.sh`.
2. **Health check path `/healthz`** ([ADR-0032](ADR-0032-observability-sentry-request-logs.md)),
   configured on the Railway service. Railway only switches traffic to the new deployment once it
   answers `200`; a failing deployment leaves the previous one serving.
3. **Migrations run before the new release serves traffic**, from the commit being deployed, with
   the same image the CI smoke test already builds: `db/Dockerfile.migrate` (the `migrate/migrate`
   CLI plus `db/migrations`, entrypoint reads `MIGRATE_DATABASE_URL` and runs `migrate ... up`).
   On Railway this is either
   - a second service built from `db/Dockerfile.migrate` that is run as a one-off job (cron schedule
     unset; trigger a redeploy per release), or
   - the pre-deploy command of the API service running `migrate -path db/migrations -database
     "$MIGRATE_DATABASE_URL" up` (requires the `migrate` CLI in the build image, which the distroless
     API image does not have, so the one-off service is the default).

   `MIGRATE_DATABASE_URL` is the direct, non-pooled connection (golang-migrate needs a session-level
   advisory lock); the API receives only the pooled `DATABASE_URL`. Migration compatibility rules
   from ADR-0029 stand: expand first, contract in a later release, because the previous binary keeps
   serving during a deploy and after a rollback.
4. **Secrets live in Railway variables** (per service, per environment). Nothing secret is in the
   image, the repository or a workflow. Non-secret config is also set as Railway variables so one
   place describes the environment. `.env.example` stays the template.
5. **Web on Vercel**, deployed by Vercel's Git integration. The API's `WEB_ORIGIN` and
   `CHECKOUT_*_URL` point at its production domain.
6. **Uploads stay on S3** (private bucket, presigned URLs, static keys for the presigner IAM user,
   [ADR-0021](ADR-0021-student-feature-slice-decisions.md)). The bucket was defined only in the
   deleted Terraform, so its settings are recorded as a manual setup in `docs/ops.md`.
7. **E-mail through Resend**, sending domain `send.vocation.iskolar.io` with SPF, DKIM and DMARC
   records in Cloudflare DNS (`docs/ops.md`).
8. **Rollback** is redeploying the previous Railway deployment. Schema changes are not rolled back
   automatically; that is why migrations stay backward compatible.
9. **Logs** are Railway's deployment logs. `ALERT` lines remain the marker for something a human
   must act on; turning them into notifications is owned by the Sentry alerting work (#32), not
   CloudWatch.

## Consequences

- No Terraform state, IAM deploy role or cloud account to administer for the API. The cost is a
  smaller set of controls: no VPC, no private networking to the database (Neon is reached over TLS
  as before), and Railway's proxy replaces the ALB (`TRUST_PROXY=true` now means "behind the Railway
  proxy").
- The ALB target-health and CloudWatch `ALERT` metric filter from ADR-0029 are gone. Process death is
  covered by Railway restarting the service and the `/healthz` check.
- `infra/terraform/` and `.github/workflows/deploy.yml` are deleted; git history keeps them.
- Multiple API replicas are possible on Railway; whether background workers and rate limits are
  replica-safe is handled by their own decisions, not here.

## Alternatives considered

- **Keep AWS (ADR-0029).** Rejected: never provisioned, needs an ops owner the team does not have.
- **Fly.io / Render.** Equivalent to Railway; Railway was the team's existing choice.
- **Run migrations from the API process.** Rejected: ADR-0029's reasoning stands — a failed or
  concurrent migration must not be a side effect of starting a server.

## References

- [`../ops.md`](https://github.com/iskolar-web3/vocation-server/blob/14d7d2db2d250323067e18f056216b9686b3ba04/docs/ops.md) — operating the Railway deployment
- [ADR-0016](ADR-0016-neon-postgres-not-rds.md) · [ADR-0029](ADR-0029-deploy-pipeline-and-migrations.md) · [ADR-0032](ADR-0032-observability-sentry-request-logs.md)
