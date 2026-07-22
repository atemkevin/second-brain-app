# Contributing to Personal Life OS

## Source of truth

Before changing behavior, review:

1. `docs/specification-baseline.md`
2. Applicable ADRs in `docs/adr/`
3. The approved product, UI/UX, database, API, design-system, backlog, and implementation documents

When sources conflict, follow the precedence in `docs/specification-baseline.md`.

## Branches

Use one atomic backlog item per branch whenever practical.

Format:

```text
agent/<task-id>-<short-description>
```

Example:

```text
agent/pl-003-repository-baseline
```

## Commits

Use concise, imperative commit messages. Prefix backlog work with its task ID.

```text
PL-003: add repository CI baseline
```

Do not mix unrelated refactors, formatting, generated files, or feature work into one commit.

## Required checks

Before a pull request is ready for review, run:

```bash
npm ci
npm run lint
npm run build
npm test
```

When database work is introduced, also run the applicable Supabase migration, type-generation, RLS, and integration checks defined by the implementation playbook.

## Pull requests

Every pull request must include:

- backlog task ID and objective;
- requirement or ADR references;
- files and behavior changed;
- validation evidence;
- security and data-integrity impact;
- migration and rollback notes when applicable;
- explicit remaining work.

Draft pull requests are the default while implementation or validation is incomplete.

## Architecture boundaries

The approved production architecture is Next.js App Router, TypeScript, Supabase, and Cloudflare Workers through OpenNext.

Do not add new production dependencies on Vinext, Vite RSC, Cloudflare D1, Drizzle for D1, or dispatch-owned ChatGPT authentication. Existing prototype code may only be changed to support controlled migration or removal.

## Security

Never commit:

- Supabase service-role keys;
- private API keys or access tokens;
- production secrets;
- personal data exports;
- unredacted payment evidence;
- local environment files.

Only browser-safe publishable values may use a `NEXT_PUBLIC_` prefix. Authorization must be enforced server-side and through Supabase RLS.

## Definition of done

A task is done only when its acceptance criteria are met, tests pass, documentation is updated, accessibility and responsive behavior are verified where relevant, and the pull request contains reproducible evidence.
