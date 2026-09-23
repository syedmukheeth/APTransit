# Day 02 · Foundation: design system primitives and full schema

**Phase:** Foundation · **Goal:** every core UI primitive exists with all states, and the full database schema is migrated and seeded with real AP network data.

**Read first (both):** `progress/handoff.md`, `docs/05-data-model.md`, `docs/09-design-system.md`, `docs/19-seed-data.md`

## State after Day 1 (read before pasting your prompt)

- Day 1 is merged into `main`. Pull `main` and branch today from it (`a/<topic>` or `b/<topic>`).
- Accounts and `.env` files must exist (docs/15). Without them the API boots but health reports db and redis down.
- **Dev B first thing:** `pnpm db:migrate` on your Neon branch (applies `20260923000000_init`), then confirm `/api/v1/health` shows `db: "ok"` and `redis: "ok"`. Your `schema_v1` migration goes on top of `init`. Replace the `db:seed` and `db:reset` placeholder scripts in `apps/api/package.json` and add `migrations.seed` to `apps/api/prisma.config.ts`. New env vars go into `env.ts`, `.env.example` and `test/test-env.ts`.
- **Dev A first thing:** `packages/ui` has only `tokens.css` and `cn()`. It has no React dependencies and no test setup yet: add them as described in `progress/handoff.md` (Day 2 notes, decision D-010). Class names are listed in `packages/ui/README.md`; shadcn colour classes such as `bg-background` do not exist here. Register any new class family in `packages/ui/src/cn.ts`.
- Patterns to copy and known gotchas: `progress/handoff.md`. Package guides: `apps/api/README.md`, `packages/shared/README.md`, `packages/ui/README.md`.

---

## Dev A (frontend)

**Read first:** `docs/09-design-system.md` (all), `docs/10-ux-writing.md` (Rules), `prompts/_shared/ui-quality-checklist.md`

```text
Day 02, Dev A (frontend). Goal: the core primitives in packages/ui, fully styled with our tokens, accessible, with tests.

Use shadcn/ui as the starting point (copy components into packages/ui/src/components with the shadcn CLI or by hand), then restyle every one to docs/09 tokens. Remove anything shadcn adds that we do not use. Export everything from packages/ui/src/index.ts.

Build in this order (most important first):
1. Button: variants primary, secondary, ghost, danger, link. Sizes md (44 px), lg (52 px), xl (56 px). Props: loading (keeps width, spinner, aria-busy, blocks clicks), leftIcon, rightIcon, asChild. Focus visible ring from tokens.
2. IconButton: required aria-label prop (TypeScript enforced), 44 px hit area.
3. Field wrapper: Label always visible, optional hint, error message with an icon, wires id, aria-describedby and aria-invalid for its child control.
4. Input, Textarea, Select (Radix), Checkbox, RadioGroup, Switch: 16 px text minimum, border-strong token for the boundary, error state, disabled state.
5. Card: plain, interactive (whole card is one link or button with a visible focus ring), selected.
6. StatusBadge: takes a status key from @aptransit/shared status.ts, renders lucide icon + label text (label comes in as a prop for now; i18n is wired on Day 3), sizes sm and md, tone colours from tokens. Also a ToneChip for arbitrary text in a tone.
7. Skeleton (shape presets: line, block, card), Spinner (only for inline button loading).
8. EmptyState (icon, title, hint, one action slot) and ErrorState (message, Retry button, optional request id in small text).
9. Dialog (Radix): title, description, footer with two buttons, focus trap, Escape closes, returns focus. No nested dialogs.
10. Sheet (vaul drawer) for mobile bottom sheets with a drag handle and a visible close button.
11. Toast (sonner) with success and info only, positioned bottom on mobile and top right on desktop.
12. Tabs (Radix), Tooltip (Radix, never the only place for essential info), DropdownMenu (Radix).

Rules for every component: tokens only (no raw hex, no arbitrary values), forwardRef, className merge through cn, dark mode through tokens, prefers-reduced-motion respected, no hardcoded English inside components (all text comes through props).

Tests (Vitest + Testing Library in packages/ui): Button loading blocks clicks and sets aria-busy; Field links the error to the input via aria-describedby; Dialog traps focus and closes on Escape; StatusBadge renders icon and label for every status key.

Verify on the Day 1 token page (add a temporary section) that every component and state looks right at 360 and 1280 px, light and dark. Then run the UI quality checklist. pnpm lint, typecheck, test, check:dashes must pass.
```

## Dev B (backend)

**Read first:** `docs/05-data-model.md` (all), `docs/07-ticket-and-pass-rules.md` (section 1 settings), `docs/08-roles-permissions.md` (Seed accounts), `docs/19-seed-data.md` (all)

```text
Day 02, Dev B (backend). Goal: full Prisma schema v1 migrated on dev-a, dev-b and test branches, and a deterministic seed with the AP network from docs/19.

1. Write apps/api/prisma/schema.prisma from docs/05 exactly: every enum, every table with the listed fields, relations, @@map snake_case names, unique constraints and the minimum indexes. cuid2 ids (default via @paralleldrive/cuid2 in a Prisma client extension or at creation time, pick one and be consistent), BigInt autoincrement for gps_locations, createdAt and updatedAt. Money Int paise. JSON fields typed via Prisma JSON with zod parsing at the edges.
2. Migration "schema_v1". Apply to dev-a, dev-b and test branches (give me the exact commands).
3. packages/shared additions: src/codes.ts (Crockford base32 code generator for APT-XXXX-XXXX, BKG-XXXXXX, PAS-XXXXXX, CMP-XXXXXX, INC-XXXXXX, with tests), src/polyline.ts (Google encoded polyline encode and decode, with tests), src/time.ts (IST helpers: local "HH:mm" plus service date to UTC Date, UTC to IST parts, with tests around midnight and the 21:30 night trips), src/permissions.ts (permission keys and the role matrix from docs/08, with a can(roles, permission) helper and tests).
4. apps/api/src/modules/trips/trip-generator.ts: pure function that takes timetables and a date range and returns trip rows (code, serviceDate, scheduledDepartureAt, scheduledArrivalAt from the last route stop minutesFromOrigin). Unit tests: daysMask, validFrom and validTo, a night departure, idempotency by (timetableId, serviceDate).
5. apps/api/prisma/seed.ts (run with tsx), deterministic with seed 20260923, idempotent (upsert by code):
   a. districts, stops and bus stands, depots, routes and their reverse routes with route_stops and encoded straight line polylines, exactly as docs/19.
   b. bus_types with seatLayout JSON (rows, columns, aisle index, labels, blocked cells) and the demo fare_rules from docs/19.
   c. refund_policies default tiers and settings defaults from docs/07 section 1.
   d. pass_types: weekly, monthly, free travel (docs/07 section 8).
   e. buses per depot with fictional AP 39 Z registrations, drivers and conductors (users with roles scoped to their depot), two approved driver devices with fixed keys printed at the end of the seed for the simulator.
   f. all demo accounts from docs/08 with correct roles and scopes.
   g. timetables from docs/19 and trips for today to today plus 7 days using trip-generator, with an INITIAL trip_assignment for every trip that has a bus available.
   h. a few bus statuses for today (2 MAINTENANCE, 1 BREAKDOWN at Kurnool) as in docs/19. The open incident for the breakdown comes later.
6. Scripts: pnpm db:seed, pnpm db:reset (local only, refuses if DATABASE_URL looks like the main branch).
7. Seed test: after seeding, assert counts (districts 10, depots 6, 12 routes, every route has ordered stops, trips exist for today) and that running the seed twice changes nothing.

Rules: all names in both nameEn and nameTe from docs/19, no em dash or en dash in any seed string, no invented fields outside docs/05 (if you need one, stop and tell me so we log a decision).

Verify: pnpm db:reset then pnpm db:seed on dev-b works; prisma studio shows the data; pnpm test passes; seed runs twice without duplicates.
```

## Sync point (end of day, 15 min)

- Dev B shows the seat layout JSON shape. Dev A confirms it is enough to draw a SeatMap (rows, columns, aisle, labels, blocked cells). Agree the zod schema `SeatLayout` in `packages/shared`.
- Dev A shows the primitives. Dev B confirms `StatusBadge` covers every status key in `status.ts`.
- Merge order: Dev B `b/schema-v1` (includes shared additions), then Dev A `a/ui-primitives`.

## Done when

- [ ] Schema matches `docs/05` table by table. Migration applied on dev-a, dev-b, test.
- [ ] Seed is deterministic and idempotent. Demo accounts exist with correct roles.
- [ ] `packages/shared` has codes, polyline, time, permissions with tests.
- [ ] All 12 primitive groups exist with every state, light and dark, with tests.
- [ ] CI green.

## Not today

Pages, i18n wiring, auth endpoints, history data.

## Optional skill hints (Claude Code)

- Dev A: `/frontend-design` for component polish, `/motion-system` for sheet and dialog timing.
- Dev B: `/scalability` to sanity check indexes against the queries in `docs/06`.
