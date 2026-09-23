# Day 15 · Operations: detail screens, admin UI, and analytics API

**Phase:** Operations and Government · **Goal:** depot staff can handle a breakdown end to end in the UI, admins can manage the network, and the analytics API returns real numbers from 14 days of history.

**Read first (both):** `docs/11-screens.md` (Depot operations, Admin), `docs/06-api-contract.md` (Government and analytics), `docs/19-seed-data.md` (History)

---

## Dev A (frontend)

**Read first:** `docs/11-screens.md` (rows for `/ops/buses/[id]`, `/ops/trips/[id]`, `/ops/trips/[id]/replace`, `/ops/staff`, Admin), `docs/09-design-system.md` (Dialog, forms), plan sec 30 to 34 and 71

```text
Day 15, Dev A (frontend). Goal: the remaining ops screens including the replacement flow, and the admin screens.

1. /ops/buses/[id] (plan sec 30): profile header (bus number, type, depot, StatusBadge), facts grid (driver and conductor today, current route, maintenance due), trip history table, maintenance records, Set maintenance dialog.
2. /ops/trips/[id]: trip header with StatusBadge and delay, a vertical timeline (scheduled, started, stops reached, incidents, replacement, completed), assignment history, passenger count, open incidents, actions Replace bus and Cancel trip (manager only, hidden otherwise).
3. /ops/trips/[id]/replace (plan sec 34): step 1 reason (prefilled when coming from an incident), step 2 pick a bus from GET /ops/buses/available (cards with type, seats, distance hint if known) and optionally a driver, step 3 confirm Dialog that names the consequence ("Replace AP 39 Z 0107 with AP 39 Z 0112? 38 passengers will be notified."). Success returns to the trip with the new assignment visible.
4. Cancel trip Dialog: states the number of passengers who get a full refund, requires a reason.
5. /ops/staff: tabs Drivers and Conductors, add staff dialog, and a Devices section with pending devices and Approve and Revoke actions.
6. Admin (plan sec 71), desktop first:
   a. /admin overview: links to each area and the last 10 audit events.
   b. /admin/stops: DataTable, add and edit dialog with a small map pin preview (MapView), bilingual name fields side by side.
   c. /admin/routes and /admin/routes/[id]: ordered stop editor as a list with Move up and Move down buttons (keyboard accessible, no drag only interactions), inline km and minutes fields with validation, a map preview of the route, Save with a summary of changes.
   d. /admin/timetables: per route, departures table (time, bus type, days chips Mon to Sun, valid from and to, active switch), add departure, Generate trips action with a date range.
   e. /admin/users: search, user drawer with roles and scopes, add and remove role (admin level roles only shown to super admins).
   f. /admin/policies: three sections (Fare rules, Refund policy tiers, Settings), each a clear form with units in labels ("Hold time (minutes)"), validFrom where relevant, and a confirm dialog before saving.
   g. /admin/audit: DataTable with filters (action, entity, actor, date range), row opens a drawer with a before and after diff.

Verify: the full breakdown story in the UI (simulator breakdown, acknowledge on dashboard, replace from the trip page, citizen sees the notification). Edit a route's stops as admin. Playwright E2E-9. UI quality checklist at 1280 and 768 px.
```

## Dev B (backend)

**Read first:** `docs/06-api-contract.md` (Government and analytics), `docs/05-data-model.md` (daily_stats), `docs/19-seed-data.md` (History), `docs/13-realtime-tracking.md` (Progress for delay facts), plan sec 35 to 39 and 72

```text
Day 15, Dev B (backend). Goal: 14 days of believable history, daily rollups, and the government and analytics endpoints with CSV reports.

1. History generator (pnpm db:seed --history 14) per docs/19: completed and cancelled trips with actual times and delays (evening peak on KNL-VJA and VJA-GNT), tickets with realistic load by time band and weekday, scans, passes and free travel scans, complaints, incidents (all resolved except the one open breakdown), gps_locations only for the last 2 days (keep the table small). Deterministic with the fixed seed. Must run in under 2 minutes against Neon (batch inserts with createMany).
2. Rollup job (rollups queue, repeatable 00:15 IST): computes daily_stats per route, depot and district for yesterday. pnpm rollups:backfill --days 14 command. Unit tests for the math (onTimePct = trips with delay under 5 min over completed trips, load factor = tickets over seats, revenue = captured minus refunded).
3. Government endpoints (gov:read, district scoped for DISTRICT_OFFICER): GET /gov/overview (today live from queries plus Redis live counts), GET /gov/map (per district HQ: activeBuses, delayed, incidents; live buses; open incidents), GET /gov/districts/:id, /gov/depots/:id, /gov/routes/:id summaries.
4. Analytics endpoints: /analytics/routes, /analytics/buses, /analytics/passengers (busyHours array of 24), /analytics/delays (avg delay by hour of day and worst routes), /analytics/demand (bands MORNING, AFTERNOON, EVENING, NIGHT with level LOW, MEDIUM, HIGH using fixed thresholds on load factor: under 50 percent LOW, 50 to 80 MEDIUM, over 80 HIGH). Read from daily_stats for past days and live queries for today. All numbers from fixed calculations (plan sec 73).
5. Reports: GET /reports/:kind.csv streamed (daily-operations, route-performance, complaints, tickets), header row, ISO dates, IST local times, UTF 8 with BOM so Telugu names open correctly in Excel, audit report.export.
6. Performance: each analytics call under 500 ms on 14 days of data. Add indexes if needed (tell me which, because docs/05 lists minimum indexes only).
7. Tests: rollup math, demand thresholds, district officer sees only their district, CSV escaping of commas and quotes.

Rules: no AI or estimated numbers, everything from data. No em dash or en dash.

Verify: run the history seed and backfill on dev-b, call each endpoint and sanity check numbers against a few manual SQL queries. Then run both on staging.
```

## Sync point (end of day, 15 min)

- Dev A demos the breakdown to replacement flow in the UI on staging.
- Dev B shows sample analytics payloads. Dev A confirms they are enough for the charts on Day 17 and the command center tomorrow.
- Merge order: Dev B `b/analytics`, then Dev A `a/ops-detail-admin`.

## Done when

- [ ] Replacement bus and cancel trip work fully from the UI with notifications.
- [ ] All admin screens work with validation and audit visible.
- [ ] Staging has 14 days of history and rollups.
- [ ] Gov and analytics endpoints return correct numbers under 500 ms. CSV opens in Excel with Telugu intact.
- [ ] E2E-9 passes.

## Not today

Command center UI (Day 16), charts (Day 17).

## Optional skill hints (Claude Code)

- Dev A: `/frontend-design` for admin forms, keep them plain and clear.
- Dev B: `/scalability` for rollups and analytics queries.
