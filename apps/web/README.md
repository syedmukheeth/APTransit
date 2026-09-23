# apps/web

Next.js 16 App Router app for every AP TransitOS surface: citizen PWA, driver, conductor, ops, gov and admin. Owner: Dev A. Screens: `docs/11-screens.md`. Design: `docs/09-design-system.md`. Current state and gotchas: `progress/handoff.md`.

## Run

```bash
cp .env.example .env.local      # docs/15
pnpm dev                        # from the repo root: web on http://localhost:3000, api on :4000
```

Today `/` is a temporary token check page (delete on Day 3, when `/design` exists).

## Scripts

| Script | What it does |
| --- | --- |
| `dev`, `build`, `start` | Next on port 3000 (Turbopack) |
| `lint` | ESLint: Next core web vitals, Next TypeScript, full jsx-a11y recommended, our shared rules |
| `typecheck` | `next typegen` (route types) then `tsc --noEmit` |

## How it is wired

- `app/globals.css`: `@import "tailwindcss"`, then `@import "@aptransit/ui/tokens.css"`, then `@source` for `packages/ui/src` so Tailwind sees component classes. Class reference: `packages/ui/README.md`.
- `app/layout.tsx`: Inter (`--font-inter`) and Noto Sans Telugu (`--font-telugu`) via `next/font/google`, self hosted at build time. Title template `"%s · AP TransitOS"`. `lang` and theme come from cookies on Day 3.
- `next.config.ts`:
  - rewrites `/api/v1/*` to `API_URL`, so the browser always calls the web origin and the refresh cookie stays first party (docs/06);
  - `transpilePackages: ["@aptransit/ui"]` because ui ships source;
  - `agentRules: false` so `next dev` stops writing its own AGENTS.md and CLAUDE.md here (decision D-007);
  - `poweredByHeader: false`.
- `@aptransit/shared` is imported from its compiled `dist/` (Turbo builds it first).

## Rules that bite

- **Next.js 16 changed APIs.** When unsure, read the bundled guides in `node_modules/next/dist/docs/` before writing code (AGENTS.md rule 12).
- **Tokens only.** No hex, no `bg-white`, no `text-lg` (they do not exist). Use `packages/ui` classes.
- **No hardcoded strings** from Day 3 on (next-intl keys in `messages/en.json` and `messages/te.json`). The Day 1 token page is the only exception.
- **No `setState` directly in `useEffect`.** The React Compiler lint rule rejects it. Read browser state with `useSyncExternalStore`, change things in event handlers. Example: `app/_token-check/token-check.tsx`.
- **Private folders** start with `_` (`app/_token-check`), so they never become routes.
- **Telugu overflow:** check every screen at 360 px in Telugu. In flex and grid rows give text cells `min-w-0`.
- Every screen needs loading, empty, error and success states (docs/11), and a single `h1`.

## Folder plan (docs/03)

```
app/(citizen)/   app/(auth)/login/   app/driver/   app/conductor/   app/ops/   app/gov/   app/admin/   app/design/
components/      app level components composed from packages/ui
lib/             api client, auth, query keys, socket client, formatters
messages/        en.json, te.json (Day 3)
public/          manifest icons, static files
```
