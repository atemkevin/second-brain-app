# Personal Life OS Specification Baseline

**Status:** Approved  
**Baseline version:** 1.0  
**Backlog item:** PL-001 — Confirm specification baseline

## Purpose

This document defines the authoritative product and engineering specifications for Personal Life OS. Implementation work must cite the relevant source document and must not introduce requirements that conflict with this baseline.

## Authoritative documents

The following documents are approved at version 1.0:

1. **Personal Life OS Master PRD v1.0**  
   Defines product goals, scope, domains, functional requirements, non-functional requirements, and product acceptance criteria.

2. **Personal Life OS UI/UX Specification v1.0**  
   Defines information architecture, screen behavior, interaction rules, responsive behavior, accessibility expectations, and user-facing states.

3. **Personal Life OS Database Specification v1.0**  
   Defines the Supabase/PostgreSQL data model, enums, relationships, constraints, indexes, Row Level Security, Storage policies, migrations, functions, triggers, and data-integrity requirements.

4. **Personal Life OS API & Server Action Specification v1.0**  
   Defines query and mutation contracts, DTOs, validation, transactions, error semantics, caching, idempotency, file flows, and authorization boundaries.

5. **Personal Life OS Design System & Component Library v1.0**  
   Defines design tokens, component contracts, visual states, responsive transformations, accessibility rules, and frontend implementation standards.

6. **Personal Life OS Codex Build Book v1.0**  
   Defines repository conventions, coding patterns, testing standards, security rules, development prompts, and implementation evidence requirements.

7. **Personal Life OS Atomic Implementation Backlog v1.0**  
   Defines the dependency-ordered implementation plan from PL-001 through PL-153.

8. **Personal Life OS Implementation Playbook v1.0**  
   Defines daily execution, pull-request workflow, release gates, staging and production procedures, rollback, incident response, and operational runbooks.

## Conflict-resolution order

When two approved documents appear to conflict, resolve the conflict in this order:

1. Security, privacy, financial integrity, and data-loss prevention requirements
2. Master PRD
3. Database Specification for persistence, ownership, RLS, and transaction integrity
4. API & Server Action Specification for application contracts and execution boundaries
5. UI/UX Specification for screen and interaction behavior
6. Design System & Component Library for visual and component behavior
7. Codex Build Book for engineering conventions
8. Implementation Playbook for delivery procedure
9. Atomic Implementation Backlog for task sequencing

A lower-ranked document may clarify a higher-ranked document but may not override it silently.

## Architecture baseline

The approved target platform is:

- Next.js with App Router
- TypeScript with strict mode
- Tailwind CSS
- shadcn/ui-compatible component primitives
- Supabase Authentication, PostgreSQL, Row Level Security, and Storage
- Cloudflare Workers deployment through the approved OpenNext adapter path
- Feature-first source organization
- Server-side data access and Server Actions as specified by the API contract

## Current-repository note

The repository currently contains a Cloudflare/Vinext prototype and a large client-side application surface. That code is implementation input, not an authority over the approved specifications.

Before foundation work proceeds, the team must decide through an Architecture Decision Record whether to:

- migrate the prototype to the approved Next.js/OpenNext architecture, or
- formally amend the approved architecture.

Until that ADR is accepted, new platform-specific dependencies or persistence mechanisms must not be introduced.

## Requirement traceability

Every implementation pull request must include:

- backlog task ID;
- source specification section or contract;
- changed files;
- commands and tests executed;
- screenshots for visible UI changes;
- migration and rollback notes when applicable;
- security, privacy, and financial-integrity impact;
- unresolved risks or deviations.

## Change-control rule

A requirement discovered during implementation must be handled by one of these paths:

1. It already exists in an approved source document: cite and implement it.
2. It clarifies an approved requirement without changing behavior: record the clarification in the relevant document or ADR.
3. It changes product behavior, data ownership, security, finance logic, or architecture: stop the affected work and obtain an approved specification revision or ADR before implementation.

## Secrets and credentials

Documentation must never contain:

- Supabase service-role keys;
- private API keys;
- Cloudflare API tokens;
- database passwords;
- signing secrets;
- production user data.

Browser-publishable configuration may be documented only as variable names or redacted examples.

## PL-001 acceptance evidence

- Eight approved source documents are named and versioned.
- Conflict-resolution order is documented.
- Approved target architecture is recorded.
- Existing prototype status is explicitly separated from the specification baseline.
- Requirement traceability and change-control rules are defined.
- No secrets or credentials are included.
