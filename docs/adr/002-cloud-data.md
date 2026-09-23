# ADR 002 · Neon Postgres and Upstash Redis instead of local Docker

**Status:** Accepted, Day 0.

## Context

Docker is not installed on the dev machines. Plan sec 82 prefers Docker, but installing and tuning Docker Desktop on Windows costs time we do not have.

## Decision

- **Postgres:** Neon, one project, a branch per developer (`dev-a`, `dev-b`), `test` for CI and `main` for staging. Prisma 7 with `@prisma/adapter-pg`: pooled URL for the app, direct URL for migrations.
- **Redis:** Upstash, one database per developer plus staging, TLS (`rediss://`), used through ioredis for holds, live positions, rate limits, Socket.IO fan out helpers and BullMQ.
- BullMQ tuned for the free tier: workers only in the `WORKER=1` process, `drainDelay: 60`, at most 4 queues.

## Consequences

- Zero local install, identical setup for both devs, staging uses the same providers.
- Needs internet to develop. Neon cold start adds about 1 s to the first query after idle.
- Upstash free tier is 500K commands per month. If exceeded, move that database to pay as you go.
- Production hosting is decided later with the authority. Nothing here locks us in: both are plain Postgres and Redis.
