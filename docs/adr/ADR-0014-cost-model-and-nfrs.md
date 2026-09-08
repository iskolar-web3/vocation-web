<!-- MIRRORED from iskolar-web3/vocation-server. Do not edit here.
     Edit upstream, then run scripts/sync-docs.sh. -->

# ADR-0014 — Fixed-cost model and non-functional requirements

- **Date:** 2026-09-08
- **Status:** **Proposed**

## Context

Two gaps that turn out to be the same gap: nobody has attached a number to the infrastructure.

**Fixed cost was never computed.** [ADR-0003](ADR-0003-aws-postgres-not-supabase.md) chose Multi-AZ
RDS, two Fargate tasks, an ALB, CloudFront, and Secrets Manager, optimising for charter compliance
and low operational surface. It never costed the result. A rough figure is **₱6,000–7,500 per month
before any traffic** (private subnets also imply a NAT gateway, which is a meaningful share of it).

Net margin is ₱12.50 on a ₱500 e-wallet booking and ₱25 on a ₱1,000 one. So break-even on hosting
alone is roughly **300–600 paid sessions per month** — 10 to 20 per day — ignoring labour,
moderation, domains and payout fees, for a platform with no users and no supply yet. `VOCATION.md`
§B9 lists AWS cost per booking as a kill criterion, and then the arithmetic was never done.

**No non-functional requirements exist anywhere.** Across 19 documents there is no latency target, no
concurrency target and no availability target. Charter §III M4 nonetheless mandates **JMeter**. Load
testing against no threshold produces a number nobody can act on.

## Options considered

1. **Cost it, then set NFRs from the cost.** Price the topology properly, derive a break-even session
   count, and set latency/concurrency/availability targets that the cheapest adequate topology can
   meet. Pros: the JMeter milestone becomes meaningful, and ADR-0005's take-rate question gets the
   fixed-cost half of its answer. Cons: real pricing work, and it may force reopening ADR-0003.
2. **Right-size the topology first.** Drop to single-AZ RDS and one Fargate task for launch, or move
   to a PaaS. Note that `academy-web` already deploys to **Netlify**, contradicting charter §II's AWS
   — so the org is not uniformly on AWS anyway. Pros: could cut fixed cost by more than half. Cons:
   contradicts charter §II and reduces availability, which nothing currently quantifies.
3. **Accept the cost, set NFRs later.** Pros: no work now. Cons: leaves a kill criterion unevaluated
   and a mandated testing milestone with nothing to test against.

## Decision

**Not yet made.** This ADR is `Proposed`.

Working recommendation is **option 1 followed by option 2 if the numbers demand it**: compute the
figure first, because right-sizing without a target is guesswork, and because the break-even count is
an input ADR-0005 needs regardless of which take-rate option is eventually chosen.

## Consequences

- **Easier, if adopted:** ADR-0005 gains its missing half. JMeter gets a threshold. The kill
  criterion in `VOCATION.md` §B9 becomes evaluable rather than rhetorical.
- **Harder:** an honest number may show that the chosen topology cannot be justified at launch
  volume, which reopens ADR-0003.
- **Owed:** a monthly fixed-cost figure and a break-even session count recorded in ADR-0005; latency,
  concurrency and availability targets recorded in `system-design.md`; and a decision on the
  Netlify-versus-AWS inconsistency the org already carries.
