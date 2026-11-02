<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0003 — AWS with self-managed PostgreSQL, not Supabase or Azure

- **Date:** 2026-09-07
- **Status:** Accepted *(database host superseded by [ADR-0016](ADR-0016-neon-postgres-not-rds.md); hosting superseded by [ADR-0036](ADR-0036-railway-vercel-deploy.md))*

## Context

Charter §II specifies **PostgreSQL**, **AWS**, and **Docker**. An earlier artifact, `Vocation.pptx`,
described "Supabase (student profile database)" and "Microsoft Azure (session data & analytics
infrastructure)". The charter is newer (2026-09-05) and is the authoritative scope document, so the
deck's infrastructure is superseded.

The charter names the cloud and the database but **not the specific services**, and names no
authentication provider — while the workbook requires email/password *and* Google sign-in for three
separate roles.

## Options considered

1. **AWS managed services + own auth** — RDS PostgreSQL, S3, ECS Fargate, CloudFront, Secrets
   Manager; authentication implemented in the Go API. Pros: matches the charter; no vendor beyond
   AWS; the team has a Security Engineer who can own password and session handling. Cons: the team
   writes and maintains auth, and AWS has more operational surface than a PaaS.
2. **Supabase** — Postgres plus hosted Auth and Storage, which would remove the auth work
   entirely. Cons: contradicts charter §II; a second data plane; the deck's mention is superseded.
3. **AWS Cognito for auth, AWS for the rest** — removes password handling. Cons: Cognito's
   developer experience is poor for a three-role custom onboarding flow, and it adds cost.

## Decision

**Option 1.** AWS with RDS PostgreSQL, S3 for uploads, ECS Fargate for the API container,
CloudFront for the static client, and Secrets Manager for credentials. Authentication is
implemented in the Go API.

The specific AWS services are **`[assumption]`** — the charter says only "AWS" and "Docker". ECS
Fargate is chosen as the lowest-operations container runtime for a team with **no named ops role**.

## Consequences

- **Easier:** one cloud account, one bill, one IAM model. `pgx` talks directly to Postgres with no
  intermediate API layer.
- **Harder:** the team owns password hashing (Argon2id), session security, reset-token lifecycle,
  and Google's OAuth exchange. Defensible only because a Security Engineer is on staff — it would
  be a poor choice for a team without one.
- **Owed:** no `ops` doc is selected, so deploy procedure, secrets rotation, backup/restore, and
  incident response are unwritten for a system that will hold payment records. Confirm the service
  choices with whoever will actually operate them.
