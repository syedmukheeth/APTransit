# Day 16 · Government: command center, and feedback API

**Phase:** Government · **Goal:** officers see the whole AP network live and drill down from state to a single trip; citizens can send feedback and track complaints through the API.

**Read first (both):** `docs/11-screens.md` (Government), `docs/13-realtime-tracking.md` (Maps, Socket rooms), `docs/06-api-contract.md` (Government and analytics, Feedback)

---

## Dev A (frontend)

**Read first:** `docs/11-screens.md` (`/gov` rows), `docs/09-design-system.md` (KpiTile, MapView, Breakpoints xl), `docs/13-realtime-tracking.md` (Maps: Gov map), plan sec 35 and 36

```text
Day 16, Dev A (frontend). Goal: the government command center and the drill down pages. Calm, dense, trustworthy, never flashy.

1. Gov shell: sidebar (Command center, Analytics, Reports, Complaints overview link, Audit for allowed roles), top bar with a date indicator "Live, updated 5 s ago".
2. /gov command center (plan sec 35) at 1280 px: KPI row (Active buses, Active trips, Passengers today, Delayed trips, Incidents) from GET /gov/overview and kpi:update on the state room. Main area: MapView of AP with one marker per district HQ (size by active buses, tone by delay level, label with the number of delayed trips), clustered bus markers (maplibre clustering on a GeoJSON source) coloured by tone, incident markers with a distinct icon. Side panel: live incident feed (incident:new, incident:update) and a "Most delayed routes now" list. Clicking a district marker goes to /gov/district/[id].
3. Drill down (plan sec 36) with a breadcrumb Andhra Pradesh, District, Depot, Route, Trip:
   a. /gov/district/[id]: KPI row scoped to the district, map zoomed to it, depots list with their KPIs.
   b. /gov/depot/[id]: depot KPIs, routes list with today's trips, delays and load.
   c. /gov/route/[id]: trips today table, delay by hour mini chart (simple bars from /analytics/delays), demand bands chips (Morning High and so on), buses on the route now.
   d. /gov/trip/[id]: reuse the live tracking view (map and RouteProgress) plus trip facts (bus, driver, conductor, passengers, scans, incidents).
4. Performance: maplibre loads only on these routes, markers update without re rendering the whole map (update GeoJSON source data), socket updates for the state room are throttled by the server to one per trip per 10 s.
5. At 768 px the map stacks above the side panel. Below 768 px show a friendly note that the command center is designed for larger screens, with the KPI row still visible.
6. District officers land on their own district page instead of the state view.

Verify as transport@aptransit.test with the simulator running all Kurnool trips: markers move, KPIs tick, an injected breakdown shows up in the feed within 3 s, drill down to the trip and back keeps state. UI quality checklist at 1280 and 768 px.
```

## Dev B (backend)

**Read first:** `docs/06-api-contract.md` (Feedback, conductor offline endpoints), `docs/05-data-model.md` (complaints), `docs/07-ticket-and-pass-rules.md` (section 4, offline notes in ADR 003), `docs/12-security.md` (Rate limits), plan sec 40, 41 and 77

```text
Day 16, Dev B (backend). Goal: feedback and complaints end to end, then (stretch) the offline scanning pack.

1. POST /feedback (public, user optional, rate limited 5 per IP per hour): email required (prefilled for users on the web), category, message (10 to 2000 chars), optional ticketCode, busRegNo, routeCode, travelDate. Creates a complaints row with code CMP-XXXXXX and status RECEIVED. Auto assigns depotId from the bus, route or ticket when given. Sends a confirmation email with the code (shared message keys). Returns { code }.
2. GET /feedback/mine (user) and GET /feedback/status?code&email (public, both must match, else NOT_FOUND without saying which part is wrong).
3. Ops side: GET /ops/complaints?status (complaint:manage, depot scoped, district officers see their district), PATCH /ops/complaints/:id (status transitions RECEIVED to IN_REVIEW to RESOLVED to CLOSED, resolutionNote required for RESOLVED, assignedToId optional). Each change sends COMPLAINT_UPDATE in app (when the complaint has a userId) and by email, and writes audit complaint.update.
4. Add complaint counts to daily_stats and to /gov/overview (complaints today, open complaints, average hours to resolve).
5. Stretch, only if 1 to 4 are merged: offline scanning per ADR 003.
   a. GET /conductor/trips/:id/offline-pack: public keys with keyIds, tickets on the trip (id, status, validUntil), passes valid today (id, status, validUntil, eligibleServiceTypes), generatedAt. Small and cacheable.
   b. POST /tickets/validate/batch: replays offline scans sorted by deviceTime, applies the normal validation with "first scan wins", writes ticket_scans with offline true, returns per scan results.
   c. Tests for conflicts: the same ticket scanned offline on two devices.
6. Tests: feedback happy path, status lookup with wrong email, transitions and notifications, district scope.

Rules: never reveal whether an email exists. No em dash or en dash.

Verify: submit feedback as a guest and as a citizen, move it through statuses as staff.knl, check emails in the log and the citizen notification.
```

## Sync point (end of day, 15 min)

- Dev A demos the command center with the simulator running. Dev B checks server load and socket throttling.
- Decide together whether offline scanning ships in the UI (Dev A would add it on Day 18 if Dev B finished the API).
- Merge order: Dev B `b/feedback`, then Dev A `a/command-center`.

## Done when

- [ ] Command center and all drill down levels work live.
- [ ] District officers are scoped to their district.
- [ ] Feedback, complaint status and ops complaint handling work via API with notifications.
- [ ] Offline pack API merged or explicitly moved to backlog in the decisions log.

## Not today

Analytics charts, reports page, feedback screens (Day 17).

## Optional skill hints (Claude Code)

- Dev A: `/dataviz` for map encodings and KPI tiles, `/frontend-design` for the command center layout.
- Dev B: `/security` for the public feedback endpoints.
