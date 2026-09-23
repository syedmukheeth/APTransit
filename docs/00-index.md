# 00 · Docs index

**Status: LOCKED.** These docs are the single reference for the 20 day build. Change only through `progress/decisions-log.md` with both devs agreeing.

## Read order on Day 1

| # | Doc | What it answers | Main reader |
| --- | --- | --- | --- |
| 01 | [Product brief](01-product-brief.md) | What we build, for whom, and the principle behind it | Both |
| 02 | [MVP scope](02-mvp-scope.md) | What is in the 20 days, what is out, the demo story | Both |
| 03 | [Architecture](03-architecture.md) | Monorepo layout, flows, environments | Both |
| 04 | [Tech stack](04-tech-stack.md) | Allowed libraries, versions, banned libraries | Both |
| 05 | [Data model](05-data-model.md) | Tables, enums, indexes, retention | Dev B |
| 06 | [API contract](06-api-contract.md) | Every endpoint, payload, error and socket event | Both |
| 07 | [Ticket and pass rules](07-ticket-and-pass-rules.md) | Status machine, activation, QR, gifting, refunds, free travel | Both |
| 08 | [Roles and permissions](08-roles-permissions.md) | Who can do what | Both |
| 09 | [Design system](09-design-system.md) | Tokens, components, status colours, layouts | Dev A |
| 10 | [UX writing](10-ux-writing.md) | Copy rules, tone, English and Telugu glossary | Dev A |
| 11 | [Screens](11-screens.md) | Every route and its states | Dev A |
| 12 | [Security](12-security.md) | OWASP checklist, rate limits, audit events | Dev B |
| 13 | [Realtime tracking](13-realtime-tracking.md) | GPS flow, Redis keys, socket rooms, ETA math, simulator | Both |
| 14 | [Testing and QA](14-testing-qa.md) | Test matrix, manual QA scripts | Both |
| 15 | [Environment setup](15-env-setup.md) | Accounts, env vars, first run | Both |
| 16 | [Git workflow](16-git-workflow.md) | Branches, PRs, commits, daily sync | Both |
| 17 | [Deployment](17-deployment.md) | Staging on Vercel and Render, smoke test | Dev B |
| 18 | [Open decisions](18-open-decisions.md) | Items to confirm with the authority, assumptions we made | Both |
| 19 | [Seed data](19-seed-data.md) | AP districts, stands, routes, service types, fares | Dev B |
| 99 | [Source product plan](99-source-product-plan.md) | The original full plan. "Plan sec NN" in any doc points here | Both |

## Architecture decision records

| ADR | Decision |
| --- | --- |
| [001](adr/001-monorepo.md) | pnpm + Turborepo monorepo with shared contracts |
| [002](adr/002-cloud-data.md) | Neon Postgres + Upstash Redis instead of local Docker |
| [003](adr/003-qr-signing.md) | Ed25519 signed QR with a rotating 30 second code |
| [004](adr/004-maps-maplibre.md) | MapLibre GL + OpenFreeMap tiles |
| [005](adr/005-i18n.md) | next-intl with cookie based locale, English and Telugu |

## How to change a locked doc

1. Write the proposed change in `progress/decisions-log.md` (template inside).
2. Both devs agree at the daily sync.
3. The owner of the doc edits it in a PR titled `Update docs: <topic>`.
4. If code already depends on the old rule, the same PR updates the code.
