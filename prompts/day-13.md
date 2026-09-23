# Day 13 · Live transport: conductor scanner and depot operations API

**Phase:** Live transport and Operations · **Goal:** a conductor checks a ticket in under 2 seconds with a clear green or red answer; the depot API can manage fleet, trips, incidents and replacement buses.

**Read first (both):** `docs/07-ticket-and-pass-rules.md` (section 5), `docs/06-api-contract.md` (Operations), `docs/08-roles-permissions.md`

---

## Dev A (frontend)

**Read first:** `docs/11-screens.md` (Conductor), `docs/10-ux-writing.md` (Scanner reasons), `docs/09-design-system.md` (Surfaces: Conductor, Motion), plan sec 14, 27, 28

```text
Day 13, Dev A (frontend). Goal: the conductor app. The scanner is the most important button in the whole product.

1. /conductor (CONDUCTOR only): route and departure of today's trip, three big counts (Passengers, Checked, Pending) from GET /conductor/today, updated after each scan and through the socket (trip room), and a 64 px primary "Scan ticket" button. Link to the manifest.
2. /conductor/scan: opens the camera immediately with qr-scanner (web worker, back camera, highlight off, maxScansPerSecond 10). Full screen video, a square frame overlay with "Place QR inside the frame", torch toggle when supported, a close button. Camera permission states: prompt (explain why first), denied (instructions to enable), no camera (manual entry). Manual entry fallback: type the ticket code.
3. On a decoded QR: ignore the same text for 3 s (debounce), vibrate briefly, POST /tickets/validate with tripId and deviceTime. Show the result overlay while the request is in flight (a neutral "Checking" state if it takes more than 300 ms).
4. Result overlay (role="status", announced): full screen solid success or danger tone from tokens, big icon (circle check or circle x), VALID or INVALID in display size, the reason line and helper from docs/10 for the returned reason (with the earlier scan time for ALREADY_SCANNED), and for VALID the passenger name, seat, route, boarding and dropping. Distinct haptic patterns (short for valid, long double for invalid) and a short tone generated with the Web Audio API (no audio files), with a mute toggle remembered in localStorage. Auto return to the scanner after 3 s, or tap anywhere to continue.
5. Measure: log camera decode to result time in development and show it in a small debug line only in development. Target under 2 s on a mid range Android.
6. /conductor/manifest: seat list with Checked or Pending, simple and readable.
7. Everything in en and te, 56 px targets, readable in sunlight (solid tones, big text).

Verify on a real phone over HTTPS against staging: scan an ACTIVE ticket (VALID), scan it again (ALREADY_SCANNED with time), a BOOKED ticket (NOT_ACTIVATED), a 90 second old screenshot (STALE_CODE), a random QR (not recognised), a pass on a Super Luxury trip (SERVICE_NOT_ELIGIBLE). Time 10 scans and write the average in the daily log. Write Playwright E2E-8 (inject the QR text directly into the scan handler in tests).
```

## Dev B (backend)

**Read first:** `docs/06-api-contract.md` (Operations), `docs/08-roles-permissions.md` (Permission keys, Sensitive actions), `docs/05-data-model.md` (buses, trip_assignments, incidents, maintenance_records, devices), `docs/12-security.md` (Audit events), plan sec 29 to 34

```text
Day 13, Dev B (backend). Goal: the depot operations API with strict scope checks, incident handling and the replacement bus flow.

Every endpoint below: permission from docs/08, depot scope enforced in the service (district and state roles can pass depotId), zod schemas in shared, audit where listed, tests.

1. GET /ops/dashboard?depotId: activeBuses, totalBuses, activeTrips, delayedTrips (displayStatus DELAYED), breakdowns, openIncidents, busStatusCounts. One or two queries plus Redis live set, not N+1.
2. Buses: GET /ops/buses (filters status, q), POST /ops/buses, GET and PATCH /ops/buses/:id (profile fields from plan sec 30 plus trip history, last 20 trips), POST /ops/buses/:id/maintenance (sets status MAINTENANCE while open), GET /ops/buses/available?at (depot buses IDLE and not assigned to an overlapping trip, not in maintenance).
3. Trips: GET /ops/trips?date&status&routeId (with bus, driver, status, delay, passengers count), GET /ops/trips/:id (assignment history, incidents, counts), POST /ops/trips/:id/assign (bus, driver, conductor available at that time, else BUS_NOT_AVAILABLE).
4. POST /ops/trips/:id/replace-bus (plan sec 34): ends the current assignment (endedAt), creates a REPLACEMENT assignment with the new bus and driver, sets the old bus BREAKDOWN or keeps its status as reported, keeps all tickets on the same trip (seat numbers stay; if the new bus type has fewer seats, return a clear error and do not replace), publishes trip.bus_replaced, sends REPLACEMENT_BUS to every BOOKED and ACTIVE ticket holder, emits trip:status, audits trip.replace_bus. If the driver changed, the new driver sees the trip in /driver/today.
5. POST /ops/trips/:id/cancel: MANAGER and up. Trip CANCELLED, every BOOKED and ACTIVE ticket gets a full refund (100 percent including fee) through the provider and moves to REFUNDED on the webhook, TRIP_CANCELLED notifications, audit.
6. Staff: GET and POST /ops/staff?type (creates the user by email with the DRIVER or CONDUCTOR role scoped to the depot). Devices: GET /ops/devices, POST approve and revoke with audit.
7. Incidents: GET /ops/incidents?status, POST acknowledge (acknowledgedAt, by), POST resolve (note, resolvedAt; clears trips.hasOpenIncident when no other open incident; bus back to IDLE or RUNNING as fits), emit incident:update to depot and trip rooms.
8. kpi:update: every 15 s, for depot rooms that have at least one member, compute the dashboard numbers and emit. Skip when nobody listens.
9. Tests: scope (Kurnool manager cannot touch Nandyal), replacement notifies holders and keeps seats, cancel refunds everyone, assign rejects a busy bus, device approval unlocks pings.

Rules: no em dash or en dash, business rules in services, not controllers.

Verify: with the simulator run a trip with --breakdown-at 60, then as manager.knl acknowledge the incident, replace the bus with an available one, and check that citizen@aptransit.test gets the REPLACEMENT_BUS notification.
```

## Sync point (end of day, 15 min)

- Scanner test session: Dev B generates tickets in every state, Dev A scans them on a phone.
- Dev B demos the breakdown to replacement story with curl. Dev A will build the screens tomorrow and the day after.
- Merge order: Dev B `b/ops-api`, then Dev A `a/conductor-app`.

## Done when

- [ ] Scanner shows VALID or INVALID with the right reason for every case, under 2 s on a phone.
- [ ] E2E-8 passes.
- [ ] Ops API complete with scope checks, audit and tests.
- [ ] Breakdown, acknowledge, replacement and passenger notification work end to end via API.

## Not today

Ops screens (Day 14 and 15), admin API.

## Optional skill hints (Claude Code)

- Dev A: `/frontend-design` with "used in bright sunlight by a conductor in a crowded bus".
- Dev B: `/engineering:code-review` on the replacement and cancel paths before merging.
