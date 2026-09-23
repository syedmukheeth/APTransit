# 04 · Tech stack

**Status: LOCKED.** Source: plan sec 55. Only libraries listed here may be installed. Need another one? Log it in `progress/decisions-log.md` first.

## Runtime and tooling

| Tool | Version rule | Why |
| --- | --- | --- |
| Node.js | 22 LTS | Both devs already have 22.20 |
| pnpm | latest 10.x via `corepack enable` | Fast, strict workspaces |
| Turborepo | latest 2.x | Task caching, `pnpm dev` runs web and api together |
| TypeScript | latest stable 5.x, `strict: true` | One language end to end |
| ESLint 9 (flat config) + typescript-eslint + eslint-plugin-jsx-a11y | latest | Catch bugs and a11y issues early |
| Prettier | latest | One format, no debates |
| tsx | latest | Run TS scripts (seed, simulator) |

## Web (`apps/web`, Dev A)

| Library | Purpose |
| --- | --- |
| next 16 (App Router, Turbopack) | Framework, server components, routing |
| react 19, react-dom 19 | UI |
| tailwindcss 4 + @tailwindcss/postcss | Styling from tokens (`@theme`) |
| shadcn/ui (copied into `packages/ui`), @radix-ui/* | Accessible primitives, restyled to our tokens |
| class-variance-authority, clsx, tailwind-merge | Component variants |
| lucide-react | Icons (one icon set only) |
| @tanstack/react-query | Server state, caching, retries |
| react-hook-form + @hookform/resolvers | Forms with zod validation |
| next-intl | English and Telugu |
| maplibre-gl + react-map-gl (maplibre entry) | Maps, see [ADR 004](adr/004-maps-maplibre.md) |
| recharts | Charts in ops and gov |
| qrcode | Render ticket QR as SVG |
| qr-scanner | Fast camera QR scanning in a web worker |
| socket.io-client | Live updates |
| sonner | Toasts (shadcn default) |
| vaul | Bottom sheets on mobile (shadcn Drawer) |
| date-fns 4 + @date-fns/tz | Dates in `Asia/Kolkata` |

PWA: follow the official Next.js PWA guide. `app/manifest.ts` plus a hand written `public/sw.js`. No PWA plugin.

Fonts via `next/font/google`: **Inter** (Latin) and **Noto Sans Telugu** (Telugu). Self hosted by Next, no runtime Google calls.

## API (`apps/api`, Dev B)

| Library | Purpose |
| --- | --- |
| @nestjs/core, common, platform-express 11 | Framework |
| @nestjs/config | Env loading, validated by a zod schema at boot |
| @nestjs/throttler + Redis storage | Rate limits |
| @nestjs/websockets, @nestjs/platform-socket.io, socket.io 4 | Realtime |
| prisma 7, @prisma/client, @prisma/adapter-pg, pg | Database, see [ADR 002](adr/002-cloud-data.md) |
| ioredis | Redis client (TCP, TLS to Upstash) |
| bullmq 5 + @nestjs/bullmq | Background jobs |
| zod | Validation via a small custom `ZodValidationPipe` in `common/` |
| jose | JWT sign and verify |
| Node `crypto` (built in) | Ed25519 QR signing, HMAC for Razorpay and rotating codes |
| @paralleldrive/cuid2 | Public ids |
| razorpay | Payments SDK (test mode) |
| resend | Email OTP and notifications |
| helmet | Security headers |
| nestjs-pino + pino | Structured JSON logs |
| @sentry/node (optional, Day 18) | Error tracking on free tier |

## Shared (`packages/shared`)

zod only. No runtime dependency on React or Nest.

## Testing

| Library | Where |
| --- | --- |
| vitest + @vitest/coverage-v8 | All unit tests (web, api, shared) |
| unplugin-swc | Lets vitest compile Nest decorators |
| supertest | API integration tests |
| @playwright/test + @axe-core/playwright | End to end and accessibility |
| autocannon | Load test for validate and search (Day 17) |

## Banned

| Library | Use instead |
| --- | --- |
| moment, dayjs, luxon | date-fns + @date-fns/tz |
| lodash, underscore | Native JS |
| axios | fetch (web: small wrapper in `lib/api.ts`) |
| MUI, Chakra, Ant Design, Bootstrap | packages/ui (shadcn + tokens) |
| styled-components, emotion, CSS modules | Tailwind with tokens |
| Redux, MobX, Zustand | React Query for server state, React state for UI state |
| Google Maps JS SDK, Leaflet | MapLibre |
| next-pwa, serwist | Manual service worker |
| bcrypt for OTP | SHA 256 with server pepper (OTP lives 5 minutes) |
| Any second icon set | lucide-react |

## Version record (filled once on Day 1 by Dev B, then locked)

| Package | Exact version |
| --- | --- |
| next | |
| react | |
| tailwindcss | |
| @nestjs/core | |
| prisma | |
| socket.io | |
| bullmq | |
| next-intl | |
| maplibre-gl | |
| typescript | |
