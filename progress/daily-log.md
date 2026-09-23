# Daily log

Newest day on top. Each dev adds their own block at the end of every day using `prompts/_shared/end-of-day-report.md`.

Severity: **S1** blocks the demo (fix today), **S2** wrong behaviour (fix this week), **S3** polish (known issues list).

---

## Day 01 · 2026-09-23 · Dev B

**Done**
- Monorepo: pnpm 11 workspaces, Turborepo tasks (generate, build, dev, lint, typecheck, test), shared tsconfig, ESLint and Prettier presets in `packages/config`.
- `scripts/check-dashes.mjs` with tests, wired into `pnpm lint` and CI.
- `packages/shared`: every enum from docs/05, error codes with HTTP status map and the error body schema, status map with `deriveTripDisplayStatus`, ticket status tones, colour of the day in IST, money helpers, `HealthDto`. 18 unit tests.
- `apps/api`: NestJS 11, `/api/v1` prefix, helmet, CORS for WEB_ORIGIN only, 100 kb body limit, trust proxy, zod env validation (refuses live Razorpay keys and dev switches in production), pino logs with request ids and redaction, docs/06 error filter, Prisma 7 with the pg adapter (lazy connect), ioredis (lazy, TLS ready), `GET /api/v1/health` (200 ok, 503 degraded), worker entry.
- Prisma schema with `settings`, `init` migration generated offline.
- 18 API tests: env rules, health probes, full HTTP pipeline (health, 404 shape, request ids, security headers, CORS, body limit). Neon integration test skips until `TEST_DATABASE_URL` exists.
- CI workflow and PR template. Version record in docs/04.
- Booted the compiled API and worker with a fake env: health answers 503 with db and redis down, live Razorpay key is refused at boot.

**Merged PRs**
- `b/skeleton`: fast forwarded into `main` on 2026-09-23 (no PR, at the owner's request).

**Carry over (starts tomorrow before the new prompt)**
- Fill `apps/api/.env` once the accounts exist, run `pnpm db:migrate` on dev-a and dev-b, confirm `/api/v1/health` shows db ok and redis ok.
- Add `TEST_DATABASE_URL` (Neon test branch) as a GitHub Actions secret so the integration test runs in CI.
- Protect `main` on GitHub: PR required, 1 approval, CI required.
- Check the first GitHub Actions run (triggered by the push to `main`).

**Contract changes (packages/shared)**
- New: enums, errors, status, money, `HealthDto`.

**Bugs found**
- none open

**Blockers or questions for the other dev**
- Accounts (Neon, Upstash, Razorpay test, Resend) are needed before the API can reach real services.

**Decisions needed (also added to decisions-log.md)**
- D-001 to D-006, D-008. Review at the sync.

## Day 01 · 2026-09-23 · Dev A

**Done**
- `packages/ui`: all docs/09 tokens in `tokens.css` (light, dark by system preference, dark by choice), status tones (text, soft, solid), colour of the day, type scale with taller Telugu line heights, radius, elevation, gutter, layers, motion, Tailwind 4 theme that only knows our tokens, base layer (focus ring, reduced motion, long word wrapping).
- `cn()` with tailwind-merge taught our token names (text-h1 and text-muted no longer cancel each other).
- `apps/web`: Next.js 16, Tailwind 4, Inter and Noto Sans Telugu via next/font, rewrite of `/api/v1` to the API, `.env.example`, ESLint with Next rules and full jsx-a11y.
- Temporary token check page at `/` (delete on Day 3). Checked at 360, 768, 1280 px, light, dark and system, English and Telugu, keyboard focus.

**Merged PRs**
- `a/web-scaffold`: fast forwarded into `main` on 2026-09-23 (no PR, at the owner's request).

**Carry over (starts tomorrow before the new prompt)**
- Create the accounts from docs/15 and share them through the password manager.

**Contract changes (packages/shared)**
- none

**Bugs found**
- Fixed today: 6 px horizontal scroll at 360 px from a long Telugu word, focus ring briefly flashing the text colour, status chip overflowing its card at 1280 px, `next dev` writing its own AGENTS.md and CLAUDE.md with em dashes (turned off, D-007).

**Blockers or questions for the other dev**
- none

**Decisions needed (also added to decisions-log.md)**
- D-007. Review at the sync.
