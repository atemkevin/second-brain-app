# ADR-0001: Application runtime and deployment architecture

- **Status:** Accepted
- **Date:** 2026-07-21
- **Decision owners:** Repository owner; Personal Life OS implementation team
- **Related requirements:** Master PRD; Database Specification; API & Server Action Specification; Codex Build Book; Implementation Playbook; Atomic Backlog PL-002 and subsequent foundation tasks
- **Supersedes:** The implicit Vinext starter architecture currently present in the repository
- **Superseded by:** None

## Context

The repository currently contains a Cloudflare-oriented Vinext prototype. Its scripts, runtime assumptions, authentication helpers, database examples, and deployment documentation are tied to Vinext, Vite, optional Cloudflare D1, and a starter-specific build lifecycle.

The approved Personal Life OS specifications define a different production architecture:

- Next.js App Router and TypeScript;
- React Server Components and Server Actions;
- Tailwind CSS and shadcn/ui;
- Supabase Authentication, PostgreSQL, Row Level Security, and Storage;
- Cloudflare Workers deployment through OpenNext;
- feature-first application structure;
- explicit DTO, validation, caching, security, testing, and observability boundaries.

Allowing both architectures to remain valid would create incompatible implementation patterns, duplicate authentication models, conflicting persistence layers, and ambiguous deployment behavior.

## Decision drivers

- Conformance with the approved product, database, API, UI, and implementation specifications.
- First-class use of Next.js App Router, Server Components, Route Handlers, and Server Actions.
- Supabase as the sole application backend and authorization boundary.
- Cloudflare Workers deployment without coupling product architecture to a prototype framework.
- A stable ecosystem, maintainable project structure, and predictable Codex implementation patterns.
- Elimination of D1 and starter-specific abstractions that conflict with the approved data model.

## Considered options

### Option A: Keep Vinext as the production runtime

Benefits:

- Preserves the current prototype with minimal immediate restructuring.
- Retains its existing Cloudflare-oriented build tooling.

Costs and risks:

- Diverges from the approved architecture and documentation.
- Requires translating or replacing documented Next.js and OpenNext patterns.
- Keeps starter-specific D1, Vite, and dispatch-auth assumptions that are not part of Personal Life OS.
- Increases compatibility risk for Server Actions, middleware, caching, and third-party Next.js integrations.

### Option B: Maintain parallel Vinext and Next.js/OpenNext implementations

Benefits:

- Preserves the prototype while building the approved application separately.

Costs and risks:

- Duplicates code, tests, deployment paths, and maintenance.
- Creates ambiguity over which implementation is authoritative.
- Makes database, authentication, and UI evolution significantly harder.

### Option C: Migrate the repository to Next.js App Router and OpenNext

Benefits:

- Directly matches all approved specifications.
- Establishes one application runtime, backend, and deployment path.
- Supports the documented Server Action, DTO, caching, validation, and testing patterns.
- Removes prototype-specific architecture before feature development compounds the migration cost.

Costs and risks:

- Requires replacing the current Vinext starter configuration.
- Existing prototype UI must be selectively preserved or reimplemented.
- Cloudflare compatibility must be continuously validated during migration.

## Decision

Personal Life OS will use **Next.js App Router with TypeScript**, deployed to **Cloudflare Workers through OpenNext**.

**Supabase** is the sole production backend for authentication, PostgreSQL data, Row Level Security, and object storage.

The current Vinext application is classified as a prototype. It is not an approved production runtime and must not receive new domain features. Useful visual work may be preserved as reference or migrated deliberately, but Vinext, Vite RSC, Cloudflare D1, Drizzle-for-D1, starter dispatch authentication, and starter-specific lifecycle scripts must be removed from the production path.

## Consequences

### Positive

- Repository implementation aligns with the completed documentation set.
- The application has one authoritative runtime and deployment architecture.
- Codex tasks can use stable, repeatable Next.js and Supabase patterns.
- Authentication and authorization remain grounded in Supabase and RLS.
- Cloudflare deployment remains supported through an explicit adapter rather than a framework fork.

### Negative or costly

- The repository requires a controlled foundation migration before domain work continues.
- The existing 1,000-line-plus prototype page cannot be treated as production-ready architecture.
- Build, test, deployment, and environment scripts must be rewritten.

### Risks and mitigations

- **Risk:** A full rewrite could accidentally discard useful UI work.  
  **Mitigation:** Inventory reusable visual assets and behavior before deleting prototype files; preserve screenshots or reference copies where useful.

- **Risk:** Some Next.js features may not be supported identically on Cloudflare Workers.  
  **Mitigation:** Add an early OpenNext deployment canary and enforce Cloudflare compatibility checks in CI.

- **Risk:** Migration and feature work could become mixed in one large change.  
  **Mitigation:** Execute the migration as small foundation tasks with explicit acceptance criteria and draft pull requests.

## Implementation constraints

- Do not add new production features to Vinext-specific files.
- Do not introduce Cloudflare D1 or a second application database.
- Do not use a Supabase service-role key in browser-accessible code or public environment variables.
- Use Next.js App Router conventions under `app/`.
- Use OpenNext-compatible Node and Web APIs only.
- Keep Supabase RLS enabled for user-owned data.
- Validate the Cloudflare build and preview path before starting large feature slices.
- Remove obsolete runtime dependencies only after replacement configuration is present and verified.

## Validation

The decision is implemented when:

1. `package.json` no longer relies on Vinext or Vite RSC for the production lifecycle.
2. Next.js App Router builds successfully with the approved OpenNext adapter.
3. A minimal application deploys successfully to a non-production Cloudflare Worker.
4. Supabase browser and server clients are configured without exposing privileged credentials.
5. D1, Drizzle-for-D1, dispatch-owned ChatGPT authentication, and Vinext starter paths are absent from the production architecture.
6. CI validates type checking, linting, tests, Next.js build, and the Cloudflare artifact.

## Review triggers

Revisit this ADR only when one of the following materially changes:

- Cloudflare or OpenNext no longer supports required Next.js capabilities;
- the approved product specifications change runtime or hosting strategy;
- a documented production-blocking incompatibility cannot be mitigated;
- Supabase is replaced through an approved specification change.

## Supersession history

None.
