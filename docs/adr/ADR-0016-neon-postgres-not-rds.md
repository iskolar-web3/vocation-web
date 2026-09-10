<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0016 — Managed Postgres on Neon, not self-managed AWS RDS

- **Date:** 2026-09-10
- **Status:** Accepted
- **Supersedes:** the database-host portion of [ADR-0003](ADR-0003-aws-postgres-not-supabase.md). The rest of ADR-0003 (S3 for uploads, ECS Fargate for the API, CloudFront for the static client, Secrets Manager, own auth in Go) still stands.

## Context

[ADR-0003](ADR-0003-aws-postgres-not-supabase.md) put the database on **RDS PostgreSQL, Multi-AZ**,
as one item in an all-AWS topology. The specific AWS services were recorded as `[assumption]` — the
charter names only "AWS" and "Docker", not RDS.

Two things have moved since:

- **Cost.** [ADR-0014](ADR-0014-cost-model-and-nfrs.md) put the chosen topology at roughly
  **₱6,000–7,500/month before any traffic**, with Multi-AZ RDS and the NAT gateway its private
  subnets require as a large share of that. Break-even is 300–600 paid sessions a month for a
  platform with no users and no supply yet. ADR-0014's own recommendation was "right-size the
  topology, or move to a PaaS", and it noted the org is already not uniformly on AWS
  (`academy-web` deploys to Netlify).
- **Dev velocity.** There is **no named ops role** (`adr/README.md` §6 item 16). Nobody owns RDS
  patching, failover testing, backup/restore drills, or connection tuning. The team also has one
  Full Stack Developer against 17 features and two repos, so per-branch throwaway databases for
  preview environments have real value.

Neon is managed, Postgres-wire-compatible PostgreSQL with usage-based pricing that scales to near
zero when idle, built-in point-in-time restore, and database branching. It does not change the
wire protocol, so `pgx` / `pgxpool` and hand-written SQL are unaffected.

## Options considered

1. **Keep Multi-AZ RDS.** Pros: one cloud account, one bill, charter-literal. Cons: the fixed cost
   ADR-0014 flagged as a kill criterion; an unowned operational surface (patching, failover,
   backups) for a system that will hold payment records.
2. **Single-AZ RDS.** Pros: cheaper than option 1; still one bill. Cons: still self-managed and
   unowned; still pays for an always-on instance and the NAT gateway at zero traffic; loses the
   Multi-AZ availability nothing currently quantifies but which a payments system wants.
3. **Managed Postgres on Neon (chosen).** Pros: usage-based cost with scale-to-zero suits a
   pre-launch platform; managed backups and PITR with no ops role; database branching per preview
   environment; no protocol change. Cons: a second vendor and a second bill outside AWS; the
   database now sits outside the AWS VPC, so the API reaches it over TLS on the public internet
   rather than a private subnet; serverless cold-start latency on an idle branch; egress between
   Fargate and Neon to watch.
4. **Supabase / Aurora Serverless v2 / Fly Postgres.** Supabase was already rejected in ADR-0003
   (second data plane, hosted Auth we don't want). Aurora Serverless v2 does not scale to zero and
   keeps the RDS operational model. Fly Postgres is not managed (it is a VM with Postgres on it).

## Decision

**Option 3.** PostgreSQL is hosted on **Neon**. Everything else in the deployment topology is
unchanged: the API runs on ECS Fargate behind an ALB, uploads go to a private S3 bucket via
presigned URLs, the static client is served from CloudFront, and secrets (now including the Neon
connection string) live in Secrets Manager.

- The API connects to Neon over TLS. Use the **pooled** connection endpoint; keep `pgxpool`, and
  size it against Neon's connection limits rather than an instance's.
- `staging` and `production` are separate Neon projects (or branches of one project) with their
  own credentials. Local dev is unchanged — Postgres in Docker Compose, per `onboarding.md`.
- Preview/PR environments may use a Neon branch created from `staging` and dropped on teardown.
- Point-in-time restore is Neon's; the `ops` doc (still unwritten) owns the restore runbook and
  the RPO/RTO target.

Charter §II says "AWS". This moves one component off it, the way `academy-web`'s Netlify deploy
already does. The charter prose is not authoritative on service choice (ADR-0003 established that)
— but the AWS-vs-not inconsistency the org carries (`VOCATION.md` Q9, `adr/README.md` §6 item 17)
now also covers the database, and should be resolved with whoever operates production.

## Consequences

- **Easier:** no RDS instance, no Multi-AZ failover to test, no NAT gateway needed *for the
  database path*, managed backups/PITR out of the box, and cheap per-branch databases for previews.
  The fixed-cost figure in ADR-0014 drops and must be recomputed.
- **Harder:** two vendors and two bills. The database is no longer inside the VPC — connection
  security is now TLS + credential hygiene + (optionally) Neon IP allow-listing, not a private
  subnet. Cold starts add latency on idle branches. A new failure mode: Neon provider outage takes
  the platform down independently of an AWS region outage.
- **Owed:**
  - `ops.md` (unwritten) gains: Neon project/branch layout, the restore runbook, RPO/RTO, and
    connection-pool sizing against Neon's limits.
  - [ADR-0014](ADR-0014-cost-model-and-nfrs.md) is `Proposed`; its cost inputs are now stale.
    Recompute the monthly figure and the break-even session count with Neon in place, and record
    the result there and in [ADR-0005](ADR-0005-paymongo-and-take-rate.md).
  - `erd.md` §Retention / RA 10173: confirm Neon's data region (student education records and
    government IDs are sensitive personal information under RA 10173) and that PITR retention
    matches the stated windows.
  - The first server commit pins the Neon driver path: `pgx` v5 + `pgxpool` against the pooled
    endpoint.
