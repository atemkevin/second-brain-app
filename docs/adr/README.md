# Architecture Decision Records

Architecture Decision Records (ADRs) document significant technical decisions for Personal Life OS.

## Purpose

ADRs preserve the context, decision, consequences, and implementation constraints behind architecture choices. They prevent architectural drift and make later reviews auditable.

## Status values

- `Proposed` — under review and not yet binding.
- `Accepted` — approved and binding for implementation.
- `Superseded` — replaced by a newer ADR.
- `Deprecated` — retained for history but no longer recommended.
- `Rejected` — considered and intentionally not selected.

## Naming

Use four-digit sequential identifiers:

```text
ADR-0001-short-decision-title.md
ADR-0002-next-decision.md
```

Do not reuse identifiers. A superseding decision receives a new identifier and links to the earlier ADR.

## Required sections

Every ADR must contain:

1. Title
2. Status
3. Date
4. Decision owners
5. Related requirements or backlog tasks
6. Context
7. Decision drivers
8. Considered options
9. Decision
10. Consequences
11. Implementation constraints
12. Validation and review triggers
13. Supersession history

## Approval rules

An ADR is accepted when:

- its tradeoffs are explicit;
- affected specifications and backlog tasks are identified;
- security, data integrity, deployment, and operational impacts are addressed;
- the repository owner approves the pull request containing it.

Accepted ADRs are subordinate to the approved Personal Life OS specifications. When an ADR intentionally changes an approved requirement, the specification change must be approved and recorded at the same time.

## Change rules

Do not silently rewrite the substance of an accepted ADR. Correcting spelling or links is allowed. A material change requires a new ADR that supersedes the prior decision.

## Index

| ADR | Decision | Status |
|---|---|---|
| [ADR-0001](ADR-0001-application-runtime-and-deployment.md) | Use Next.js App Router with OpenNext on Cloudflare Workers | Accepted |
