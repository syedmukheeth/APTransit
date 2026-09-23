# Day 01 · Foundation: repo, tooling, tokens

**Phase:** Foundation · **Goal:** both devs run `pnpm dev` and see the web token page on :3000 and a green `/api/v1/health` on :4000, with CI green on GitHub.

**Read first (both):** `AGENTS.md`, `docs/00-index.md`, `docs/02-mvp-scope.md`, `docs/03-architecture.md`, `docs/04-tech-stack.md`, `docs/15-env-setup.md`, `docs/16-git-workflow.md`

**Order today:** Dev A creates the accounts in the first hour while Dev B scaffolds the root. Dev B pushes the skeleton by midday. Dev A then adds `apps/web` and `packages/ui` on top.

---

## Dev A (frontend)

**Read first:** `docs/09-design-system.md` (Tokens, Typography, Breakpoints), `docs/15-env-setup.md` (Accounts), `docs/adr/005-i18n.md`

```text
Day 01, Dev A (frontend). Goal: accounts ready, apps/web and packages/ui scaffolded, design tokens v0 live on a token check page.

Part 1: accounts (no code). Walk me through each step and give me a checklist to tick:
1. GitHub repo already exists: https://github.com/syedmukheeth/APTransit. Add Dev B as a collaborator with admin rights.
2. Neon project "aptransit" in the Singapore region. Branches: main, dev-a, dev-b, test. Collect the pooled and direct connection strings for each.
3. Upstash Redis: databases aptransit-dev-a, aptransit-dev-b, aptransit-staging (TLS on, region Mumbai or Singapore). Collect the rediss:// URLs.
4. Razorpay: test mode only, generate test Key Id and Key Secret.
5. Resend: create an API key.
Remind me to store every value in our shared password manager, never in chat or git.

Part 2: after Dev B has pushed the root skeleton, pull main and build:
1. apps/web: Next.js 16 App Router, TypeScript strict, Tailwind CSS 4 via @tailwindcss/postcss, ESLint flat config extending packages/config plus eslint-plugin-jsx-a11y. Package name "web". Port 3000.
2. apps/web/next.config.ts: rewrite /api/v1/:path* to process.env.API_URL + /api/v1/:path*. poweredByHeader false.
3. apps/web/.env.example with the keys in docs/15-env-setup.md (web section). Real values go in .env.local (git ignored).
4. Fonts with next/font/google: Inter (latin) and Noto Sans Telugu (telugu), display swap, exposed as CSS variables and used in the font stack from docs/09.
5. packages/ui: package name "@aptransit/ui". src/tokens.css with every token from docs/09 exactly (light values on :root, dark values on [data-theme="dark"] and on prefers-color-scheme dark when no data-theme="light"), status tone tokens (text, soft bg, solid), colour of the day tokens, type scale, spacing, radius, shadow, z index, motion tokens. Map them to Tailwind with @theme inline so classes like bg-surface, text-muted, border-strong, text-status-warning work.
6. Base layer in tokens.css: body uses --bg and --text, font smoothing, tabular-nums utility, a global :focus-visible ring (2 px primary, 2 px offset), prefers-reduced-motion rule that reduces transitions to opacity, html lang handled later by i18n.
7. packages/ui/src/cn.ts helper (clsx + tailwind-merge).
8. A temporary token check page at apps/web/app/page.tsx that shows: all colour tokens as swatches with name and hex, the six status tones as soft and solid chips with their label text, the type scale in English and Telugu sample text (use a hardcoded sample only on this temporary page and mark it with a TODO to delete on Day 3), spacing and radius samples, and a theme toggle that sets data-theme on html.
9. Root turbo pipeline already exists from Dev B: make sure "pnpm dev" starts web and "pnpm lint", "pnpm typecheck", "pnpm build" include web and ui.

Rules: tokens only, no raw hex in components (hex only inside tokens.css). No em dash or en dash. No extra libraries beyond docs/04.

Verify: pnpm dev shows the token page at 360, 768 and 1280 px without horizontal scroll, dark toggle works, Telugu sample renders in Noto Sans Telugu, pnpm lint, typecheck, build and check:dashes pass.
```

## Dev B (backend)

**Read first:** `docs/03-architecture.md` (Monorepo layout), `docs/04-tech-stack.md`, `docs/05-data-model.md` (Enums), `docs/09-design-system.md` (Status labels), `docs/12-security.md` (A05, Secrets), `docs/17-deployment.md` (CI)

```text
Day 01, Dev B (backend). Goal: monorepo skeleton on GitHub with CI green, packages/shared seeded with enums, errors and status map, apps/api running with a real health check against Neon and Upstash.

Build in this order and push the root skeleton first (Dev A is waiting on it):
1. Clone https://github.com/syedmukheeth/APTransit (it already holds docs/, prompts/, progress/, keep them). Create branch b/skeleton. Add .gitignore (node_modules, .env*, !.env.example, .next, dist, coverage, playwright-report, .turbo), .gitattributes (* text=auto eol=lf), .editorconfig, .nvmrc with 22, .npmrc (auto-install-peers=true).
2. Root package.json (private, packageManager pnpm latest 10.x via corepack), pnpm-workspace.yaml (apps/*, packages/*), turbo.json with tasks dev, build, lint, typecheck, test. Root scripts: dev, build, lint (turbo lint + check:dashes), typecheck, test, check:dashes, db:migrate, db:seed, db:reset (the db ones call the api package).
3. packages/config: tsconfig.base.json (strict, noUncheckedIndexedAccess), eslint flat base config with typescript-eslint, prettier config.
4. scripts/check-dashes.mjs: scans every file from "git ls-files" plus untracked non ignored files, skips pnpm-lock.yaml and binary files, finds U+2014 and U+2013, prints file:line:column for each, exits 1 if any. Add a tiny test for it.
5. packages/shared (name "@aptransit/shared", zod only): src/enums.ts with every enum from docs/05 as zod enums plus exported TS types; src/errors.ts with every error code listed in docs/06 as a const object and an ErrorCode type; src/status.ts with the status map from docs/09 (key, tone, icon name, i18nKey) and deriveTripDisplayStatus with unit tests for the priority order; src/money.ts (paise helpers); src/index.ts exports.
6. Push b/skeleton, open a PR, and merge it to main right away (branch protection is set up at the end of today). Tell Dev A it is ready.
7. apps/api: NestJS 11 with platform-express, package name "api", port 4000, global prefix /api/v1. main.ts: helmet, CORS allowing only WEB_ORIGIN with credentials, body limit 100kb, shutdown hooks. worker.ts entry that boots the same app module in worker mode (no HTTP) when WORKER=1 (empty for now).
8. Config: @nestjs/config with a zod schema for every env var in docs/15 (api section). The app must refuse to boot if a required var is missing, and must refuse any Razorpay key that does not start with rzp_test_.
9. Logging: nestjs-pino with a request id per request, redact authorization, cookie, otp, code, token and signature fields.
10. PrismaService using Prisma 7 with @prisma/adapter-pg (pooled DATABASE_URL), prisma.config.ts using DIRECT_URL for the CLI, schema.prisma with the datasource (no url) and only the Setting model from docs/05 for now. First migration named "init".
11. RedisService using ioredis with the rediss:// URL, lazy connect, sensible retry.
12. HealthController GET /api/v1/health (public) returning { status, db, redis, version, time } with db via SELECT 1 and redis via PING, each with a 1 s timeout.
13. Global exception filter that returns the error shape from docs/06 with requestId, never a stack trace outside development.
14. Vitest with unplugin-swc for Nest. One unit test (status priority) and one integration test (health returns 200 with db ok) using the Neon test branch via TEST_DATABASE_URL.
15. apps/api/.env.example with every key and fake values. Generate the QR signing key and QR secret with the commands in docs/15 and put real values only in your local .env.
16. .github/workflows/ci.yml as described in docs/17 (steps 1 to 5, 7 and 8 today; i18n check and e2e come later) and .github/pull_request_template.md from docs/16.
17. Fill the "Version record" table at the bottom of docs/04-tech-stack.md with the exact installed versions. This is the only doc edit allowed today.

Rules: no em dash or en dash anywhere, no dependency outside docs/04, no AI attribution in commits.

Verify: pnpm install from a clean clone works, pnpm dev serves GET http://localhost:4000/api/v1/health with db ok and redis ok, pnpm lint, typecheck, test and check:dashes pass, CI is green on GitHub. Then help me protect main (PR required, 1 approval, CI required).
```

## Sync point (end of day, 15 min)

- Dev A clones fresh, fills both `.env` files, runs `pnpm install && pnpm dev`: token page and health both work.
- Agree names: package scopes `@aptransit/shared`, `@aptransit/ui`, `@aptransit/config`.
- Dev B shows `status.ts` and `errors.ts`. Dev A confirms the status keys match `docs/09`.
- Merge order: Dev B skeleton (already on main), then Dev A `a/web-scaffold`.

## Done when

- [ ] All accounts exist and every secret is in the password manager.
- [ ] `main` is protected, CI runs lint, typecheck, test, build, audit, check:dashes, and is green.
- [ ] `GET /api/v1/health` shows `db: ok`, `redis: ok` on both machines.
- [ ] Token page renders light and dark, English and Telugu sample, at 360, 768, 1280 px.
- [ ] `packages/shared` exports enums, error codes, status map with tests.
- [ ] Version record in `docs/04` filled.
- [ ] Both end of day reports in `progress/daily-log.md`.

## Not today

Components, pages, auth, full schema, i18n setup, deploy.

## Optional skill hints (Claude Code)

- Dev A: `/brand-system` to generate the Tailwind 4 `@theme` block from docs/09 and re check contrast.
- Dev B: `/security` while writing config validation and helmet setup.
