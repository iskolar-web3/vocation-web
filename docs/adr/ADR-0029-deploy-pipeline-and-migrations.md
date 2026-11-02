<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0029 — Deploy pipeline and migrations: Terraform + GitHub Actions OIDC, migrate as a one-off task, `ALERT` metric filter

- **Date:** 2026-10-01
- **Status:** Superseded by [ADR-0036](ADR-0036-railway-vercel-deploy.md)

## Context

Issues #27, #28 and #32 close the three gaps `docs/ops.md` §7 ranked as blocking real money: a
deployed environment behind public HTTPS, migrations applied before the binary that needs them, and
something that turns an `ALERT` log line into a notification. None of the three exists as code —
`docs/ops.md` said "NOT YET" for all of it, and the Deploy Spike has been outstanding since Sprint 1
(`docs/sprint-jim.md`). The topology itself was already decided: Route 53 → ALB → ECS Fargate ≥ 2
tasks, Neon over TLS, private S3 uploads bucket, Secrets Manager
([`system-design.md`](https://github.com/iskolar-web3/vocation-server/blob/main/docs/system-design.md) §Deployment topology; [ADR-0003](ADR-0003-aws-postgres-not-supabase.md)
for AWS-managed services, [ADR-0016](ADR-0016-neon-postgres-not-rds.md) for the database being
Neon, which puts it outside the VPC). This ADR decides *how* that topology is provisioned and
released. Constraints that shaped it: no ops role on the team (ADR-0003's own justification for
Fargate), a fixed-cost ceiling that a NAT gateway would consume a large share of
([ADR-0014](ADR-0014-cost-model-and-nfrs.md)), and `docs/ops.md` §3's rule that migrations run
before the new binary starts — with three migration files that carry caveats (`000009`'s
`ALTER TYPE ... ADD VALUE`, `000006`'s `review.booking_id NOT NULL`, `000007`'s append-only
triggers).

## Options considered

1. **Terraform + GitHub Actions deploy over OIDC (chosen).** Infrastructure is reviewable code in
   `infra/terraform/`; releases are a workflow triggered from `main`. Pros: no long-lived AWS keys
   in GitHub, one tool for the whole environment, plan-before-apply gives the team a review step.
   Cons: someone must hold Terraform state and credentials; the team learns two tools.
2. **AWS CodePipeline / CodeBuild / CodeDeploy.** Everything in one vendor, IAM-native. Cons: build
   specs live outside the repo's review surface as much as workflows do, more moving parts to
   author and debug for a team with no ops role, and the repo is on GitHub anyway.
3. **Console/manual deploys (the Deploy Spike done by hand, per release).** Nothing to build.
   Cons: it is what `docs/ops.md` already condemns — schema and binary *will* disagree the first
   time someone forgets the migration step, and nothing is reproducible.
4. **Migrations at API startup** (`cmd/api` runs them). Cons: explicitly ruled out by
   `docs/ops.md` §3 ("Nothing in `cmd/api` runs them"), and a rolling restart would run them from
   two tasks at once.
5. **Migration as an init container / same task as the API.** Cons: Fargate has no init containers,
   and a sidecar must fail the task on error — the same exit-code plumbing, with less visibility
   than a task of its own.
6. **Private subnets + NAT gateway for the tasks.** Cons: the NAT gateway is a large share of
   ADR-0014's ₱6–7.5k/month estimate and the database is *outside* the VPC anyway (ADR-0016) —
   tasks would pay NAT to reach the public internet no matter what.
7. **A third-party alerting stack (Datadog, Sentry) for `ALERT`.** Cons: another bill and another
   vendor for one signal. `docs/ops.md` §5 already names the cheapest fix: a log-based rule on the
   string `ALERT`.

## Decision

**Provision with Terraform (`infra/terraform/`), release with `.github/workflows/deploy.yml` over
GitHub OIDC, run `db/migrations` as a one-off Fargate task before every service update, and alarm on
the `ALERT` term via CloudWatch.** Concretely:

- **Provisioning.** Terraform ≥ 1.6, AWS provider ~> 5.x. ECR (`vocation/api`, `vocation/migrate`,
  scan-on-push, keep last 20), ECS cluster + Fargate service (desired count 2, port 8080, circuit
  breaker with rollback), internet-facing ALB with `GET /healthz` expecting `200` and HTTP:80 →
  HTTPS:443, Secrets Manager containers, private uploads bucket, IAM roles, CloudWatch alarm. No
  VPC is created; no secret **values** exist in Terraform at all.
- **Release.** GitHub Actions, `workflow_dispatch` + push to `main`, job gated on
  `DEPLOY_ENABLED == 'true'`, `environment: production`, concurrency group `deploy-production`
  without cancel-in-progress. Build and push both images tagged with the commit SHA → run the
  migration task (`aws ecs run-task`, `wait tasks-stopped`, fail unless the container exits 0) →
  render + deploy the API task definition with `wait-for-service-stability` → smoke test
  `https://<API_DOMAIN>/healthz` with retries. Every value comes from repository variables filled
  from Terraform outputs; no account id is hardcoded.
- **Migrations (#28).** `db/Dockerfile.migrate` is the pinned `migrate/migrate:v4.19.1` image plus
  `db/migrations` **from the deployed commit**. golang-migrate sends each file as written and adds
  no `BEGIN`/`COMMIT` of its own, so `000009`'s `ALTER TYPE ... ADD VALUE` runs outside an explicit
  transaction block and is safe as sent on the Postgres versions Neon runs. The `000006`/`000007`
  caveats remain — the pipeline orders the migrations, it does not make them reversible.
- **Networking and cost.** Tasks get `assign_public_ip = true` in subnets that route to an internet
  gateway, so **no NAT gateway** is needed to reach Neon over TLS or the AWS service endpoints
  (ADR-0014's cost note). ALB 443/80 open to the internet; task port 8080 open to the ALB security
  group only; egress all.
- **Secrets.** One Secrets Manager container per sensitive env var (`secret_env_names`), values set
  out of band; the ECS execution role may read exactly those. Because
  `internal/uploads/presign.go` signs with static keys (ADR-0021 rejected an AWS SDK dependency),
  Terraform also creates the `vocation-uploads-presigner` IAM user whose keys live in the
  `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` secrets — the ECS task role's least-privilege S3
  policy is separate and does not cover signing.
- **Alert (#32).** A CloudWatch Logs metric filter matching the term `ALERT` on the shared API/migrate
  log group → `AlertLines` metric → alarm at ≥ 1 in 5 minutes (`treat_missing_data = notBreaching`)
  → SNS topic `vocation-alerts`, optional email subscription.
- **OIDC trust.** The deploy role is assumable only through
  `token.actions.githubusercontent.com` for `${github_repository}`'s `production` environment
  subject claim (plus the immutable `OWNER@ID/REPO@ID` form GitHub issues to repositories created
  after 2026-07-15). IAM maps only `sub` and `aud` to condition keys for web identity, and GitHub
  sends the environment form and the `ref:refs/heads/main` form **mutually exclusively** — so the
  `main` pin lives in the `production` environment's deployment branch policy (documented in
  `infra/terraform/README.md`), not in a second claim. Permissions are scoped to ECR push, task
  definition registration, running the migration task, service update, and `iam:PassRole` on exactly
  the two task roles.

## Consequences

- **Easier:** a deploy is one workflow run from `main`; schema and binary cannot disagree, because
  a failed migration stops the roll; the environment is reviewable and reproducible; the `ALERT`
  strings `docs/ops.md` §5 documents now page someone instead of waiting to be read.
- **Harder:** Terraform state and AWS credentials now exist and must be held by someone; two more
  IAM principals (deploy role, presigner user) to keep honest; the bootstrap task definition points
  at an image tag that does not exist until the first workflow run — the service cannot start until
  then (documented in `infra/terraform/README.md`).
- **Cost:** kept to ALB + 2 × Fargate (256/512) + S3 + CloudWatch + SNS. No NAT gateway, no NAT
  data-processing charges (ADR-0014). Still unrecomputed against ADR-0014's stale estimate.
- **Owed:** set the `production` environment's deployment branch policy to `main` before the first
  deploy; confirm the SNS subscription; rotate secret values on a schedule that still does not
  exist (`docs/ops.md` §7 item 4).

## Implementation clarification — 2026-10-01

The following clarifies the implementation details above; the accepted decision and earlier text
remain in the record.

- **Migration connection.** golang-migrate holds a session-level advisory lock. The migration task
  therefore receives only `MIGRATE_DATABASE_URL`, a Neon direct, non-pooled connection string with
  `sslmode=require`. The API continues to receive the pooled `DATABASE_URL`. The ECS execution role
  can read both containers, but the API task definition does not expose the direct URL.
- **Compatibility across releases.** The earlier claim that schema and binary "cannot disagree" is
  too strong. Old API tasks continue serving while ECS rolls, and circuit-breaker rollback can run
  the previous binary against the newly migrated schema. Each migration must be backward compatible
  with the previous release: expand first and contract in a later release.
- **Revision ownership.** Terraform provisions the service and its bootstrap task definitions.
  The workflow registers SHA-tagged revisions and owns the service's live `task_definition`.
  Terraform ignores changes to that service field so a later apply cannot restore the bootstrap
  image. Changes to the Terraform task-definition template create a revision for a later workflow
  deploy to pick up.
- **OIDC control.** The deploy role's environment subject does not contain a branch claim.
  Before `DEPLOY_ENABLED=true`, the `production` GitHub environment must have a deployment branch
  policy restricted to `main`; required reviewers are optional.
- **HTTPS hostname.** `api_domain` is required even with an existing ACM certificate and external
  DNS. `api_url` and the smoke test use that hostname. When DNS is external, create a CNAME/ALIAS
  from it to the ALB DNS name and ensure the certificate covers it.
- **Gateway secrets.** The new secret containers are `XENDIT_SECRET_KEY` and
  `XENDIT_CALLBACK_TOKEN`, alongside the API and migration database URLs and other app secrets.
  The current binary still speaks PayMongo; its Xendit replacement must land before paid checkout
  is enabled. Removing a name from `secret_env_names` destroys its container, so retire names only
  after no running task definition references them.
