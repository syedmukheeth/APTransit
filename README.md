# AP TransitOS

One connected digital public transport platform for Andhra Pradesh. Simple for citizens. Powerful for operations. Useful for government.

This repo holds the 20 day build kit: locked reference docs, day by day prompts for two developers, and (from Day 1) the code itself.

## Team

| Role | Name | Owns |
| --- | --- | --- |
| Dev A (frontend) | _fill in_ | Web app, PWA, design system, i18n, e2e tests |
| Dev B (backend) | _fill in_ | API, database, realtime, jobs, infra, CI, deploy |

## How to use this kit

1. Read `AGENTS.md` once. It is the rulebook for humans and AI tools.
2. Read `progress/handoff.md`: the current state of the code, how it is wired, patterns to copy and known gotchas. **Any new AI session starts here.**
3. Read `docs/00-index.md` and skim every doc once.
4. Each morning open `prompts/day-NN.md`. Dev A copies the Dev A prompt, Dev B copies the Dev B prompt, into their AI tool after `prompts/_shared/context-preamble.md`.
5. Work in your own branch. Open a PR before the sync point.
6. At the end of each day: 15 minute sync, merge, then each dev writes the report in `progress/daily-log.md` using `prompts/_shared/end-of-day-report.md`, and the dev who merges last updates `progress/handoff.md`.

## Folder map

```
AGENTS.md          rules for every AI tool and human
apps/api/          NestJS API and worker (README inside)
apps/web/          Next.js web app for every surface (README inside)
packages/shared/   zod contracts, enums, error codes, status map (README inside)
packages/ui/       design tokens and components (README inside)
packages/config/   tsconfig, ESLint and Prettier presets
scripts/           repo scripts (check-dashes)
docs/              locked reference docs (product, scope, architecture, API, rules, design)
docs/adr/          architecture decision records
prompts/           day-01.md to day-20.md, plus shared templates
progress/          handoff.md (current state), daily-log.md, decisions-log.md
```

## Quickstart

```bash
npm i -g pnpm@11                              # or: corepack enable
pnpm install
cp apps/api/.env.example apps/api/.env        # fill values (docs/15)
cp apps/web/.env.example apps/web/.env.local  # fill values (docs/15)
pnpm db:migrate
pnpm dev                                      # web http://localhost:3000, api http://localhost:4000/api/v1/health
```

Before a PR: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.

Accounts needed (all free tiers):

- Neon (Postgres), one project, one branch per dev
- Upstash (Redis), one database per dev
- Razorpay (test mode keys only)
- Resend (email OTP)
- GitHub: https://github.com/syedmukheeth/APTransit (add both devs as collaborators)
- Vercel (web) and Render (api) for staging on Day 10

Details in `docs/15-env-setup.md`.

## Rule that matters most

Make public transport easier without making the app complicated.
