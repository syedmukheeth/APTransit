# ADR 001 · pnpm + Turborepo monorepo

**Status:** Accepted, Day 0. **Deciders:** Dev A, Dev B.

## Context

Two developers, 20 days, one web app with six surfaces and one API. The biggest risk is the frontend and backend drifting apart on shapes and rules.

## Decision

One repo. `apps/web` (Next.js), `apps/api` (NestJS), `packages/shared` (zod schemas, enums, status map, fare and time helpers), `packages/ui` (tokens and components), `packages/config`. pnpm workspaces with Turborepo for tasks and caching.

## Consequences

- One zod schema validates the API request and types the web form. A contract change breaks the build on both sides at once, which is what we want.
- Both devs touch `packages/shared`, so it needs quick reviews and small PRs.
- Separate repos or a Next.js only backend were rejected: separate repos double the setup, and Next.js route handlers cannot host long lived Socket.IO connections on Vercel.
