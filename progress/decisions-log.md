# Decisions log

The only way to change a locked doc in `docs/`. Add an entry, agree at the daily sync, then the doc owner updates the doc in a PR titled `Update docs: <topic>`.

## Template

```markdown
### D-NNN · <short title>
- **Date:** YYYY-MM-DD
- **Raised by:** Dev A or Dev B
- **Doc affected:** docs/NN-name.md (section)
- **Problem:** one or two lines
- **Decision:** one or two lines
- **Status:** Proposed, Agreed, Done
```

## Decisions

### D-000 · Kit baseline
- **Date:** Day 0
- **Raised by:** Both
- **Doc affected:** all
- **Problem:** need one locked reference before coding starts.
- **Decision:** docs 00 to 19, 99 and ADR 001 to 005 are the baseline. Stack, scope and rules as written.
- **Status:** Agreed

### D-001 · pnpm 11 instead of 10
- **Date:** 2026-09-23
- **Raised by:** Dev B
- **Doc affected:** docs/04-tech-stack.md (Runtime and tooling)
- **Problem:** docs said pnpm 10.x, but pnpm 11 is installed on the dev machine and is current.
- **Decision:** pin `pnpm@11.10.0` in the root `packageManager`. Install scripts are allowed only for prisma, @prisma/engines and @swc/core (`allowBuilds` in pnpm-workspace.yaml). pnpm 11 reads settings from pnpm-workspace.yaml, so `autoInstallPeers` lives there and there is no `.npmrc`.
- **Status:** Proposed, review at the Day 1 sync

### D-002 · Tooling packages missing from docs/04
- **Date:** 2026-09-23
- **Raised by:** Dev B
- **Doc affected:** docs/04-tech-stack.md
- **Problem:** the listed libraries need a few companions that docs/04 did not name.
- **Decision:** allowed as tooling or required peers: @nestjs/cli and @nestjs/testing (build, watch, tests), @swc/core (for unplugin-swc), @eslint/js and globals (ESLint flat config), reflect-metadata and rxjs (Nest peers), pino and pino-http (nestjs-pino peers), @types/* packages, eslint-config-next (Next.js lint rules including React hooks).
- **Status:** Proposed, review at the Day 1 sync

### D-003 · Stay on the documented majors
- **Date:** 2026-09-23
- **Raised by:** Dev B
- **Doc affected:** docs/04-tech-stack.md
- **Problem:** NestJS 12, TypeScript 7, ESLint 10, Vitest 5 and a Prisma 8 release candidate are out.
- **Decision:** keep NestJS 11, TypeScript 5.9, ESLint 9, Prisma 7 as documented. Vitest (not pinned in docs) is pinned to 4.1 for stability. Revisit after Day 20.
- **Status:** Proposed, review at the Day 1 sync

### D-004 · Prisma config without dotenv
- **Date:** 2026-09-23
- **Raised by:** Dev B
- **Doc affected:** docs/15-env-setup.md (Prisma with Neon)
- **Problem:** Prisma 7 does not load .env, and `env('DIRECT_URL')` fails in CI where no database secret exists.
- **Decision:** prisma.config.ts loads .env with the Node 22 built in `process.loadEnvFile` and reads `process.env.DIRECT_URL`, so `prisma generate` works without secrets. Generated client goes to `apps/api/src/generated/prisma` (git ignored, CommonJS).
- **Status:** Proposed, review at the Day 1 sync

### D-005 · packages/shared is compiled to CommonJS
- **Date:** 2026-09-23
- **Raised by:** Dev B
- **Doc affected:** docs/03-architecture.md (Monorepo layout)
- **Problem:** Nest runs as CommonJS, Next bundles anything. Shared TS source cannot be imported by Nest directly.
- **Decision:** `packages/shared` builds with tsc to `dist` (CommonJS plus types). Turbo builds it before dev, lint, typecheck and test. `packages/ui` stays source only (only Next uses it, via transpilePackages).
- **Status:** Proposed, review at the Day 1 sync

### D-006 · Health answers 503 when degraded
- **Date:** 2026-09-23
- **Raised by:** Dev B
- **Doc affected:** docs/06-api-contract.md (GET /health)
- **Problem:** docs/06 gives the body only. Render health checks and uptime monitors read the status code.
- **Decision:** same body, HTTP 200 when db and redis are ok, 503 when either is down. `Cache-Control: no-store`.
- **Status:** Proposed, review at the Day 1 sync

### D-007 · Next.js agent files turned off
- **Date:** 2026-09-23
- **Raised by:** Dev A
- **Doc affected:** AGENTS.md
- **Problem:** `next dev` writes its own AGENTS.md and CLAUDE.md into apps/web when it runs under an AI tool. They contain em dashes and would fail `pnpm check:dashes` for everyone.
- **Decision:** `agentRules: false` in apps/web/next.config.ts. Its one useful hint (read the Next.js docs bundled in node_modules) is now hard rule 12 in the root AGENTS.md.
- **Status:** Proposed, review at the Day 1 sync

### D-008 · Audit overrides for the Prisma CLI
- **Date:** 2026-09-23
- **Raised by:** Dev B
- **Doc affected:** docs/17-deployment.md (CI audit step)
- **Problem:** `pnpm audit --prod` reported 2 high and 1 moderate advisories in `mysql2` and `deepmerge-ts`, both pulled in by the Prisma CLI. CI fails on high.
- **Decision:** pnpm `overrides` pin `mysql2@3.24.4` and `deepmerge-ts@8.0.2`. Prisma generate, validate and migrate diff verified after the change. Remove the overrides once Prisma ships patched versions.
- **Status:** Proposed, review at the Day 1 sync

### D-009 · Render build command runs the db:deploy script
- **Date:** 2026-09-23
- **Raised by:** Dev B
- **Doc affected:** docs/17-deployment.md (Render)
- **Problem:** `pnpm --filter api prisma migrate deploy` fails: pnpm looks for a script named `prisma`, not the binary.
- **Decision:** the build command ends with `pnpm --filter api db:deploy` (script: `prisma migrate deploy`). Any other Prisma CLI call uses `pnpm --filter api exec prisma ...`. docs/17 updated.
- **Status:** Proposed, review at the Day 2 sync

### D-010 · Component test tooling for packages/ui
- **Date:** 2026-09-23
- **Raised by:** Dev A
- **Doc affected:** docs/04-tech-stack.md (Testing), docs/14-testing-qa.md (Component tests)
- **Problem:** docs/14 asks for component tests with Testing Library, but docs/04 does not list the packages they need.
- **Decision:** allowed as dev dependencies of `packages/ui` (and later `apps/web`): `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`. Vitest runs with `environment: "jsdom"` there.
- **Status:** Proposed, review at the Day 2 sync

## Parked (ideas outside the 20 day scope)

| Idea | Raised by | Plan sec |
| --- | --- | --- |
| | | |
