# Day 11 · Live transport: driver app, GPS ingest and sockets

**Phase:** Live transport · **Goal:** a driver starts a trip on a phone and GPS positions reach Redis and a Socket.IO room; the simulator can drive any trip.

**Read first (both):** `docs/13-realtime-tracking.md` (all), `docs/06-api-contract.md` (Driver, tracking, conductor; WebSocket), `docs/12-security.md` (GPS trust)

---

## Dev A (frontend)

**Read first:** `docs/11-screens.md` (Driver), `docs/09-design-system.md` (Surfaces: Driver), `docs/13-realtime-tracking.md` (Driver side), plan sec 25 and 26

```text
Day 11, Dev A (frontend). Goal: the driver app. It must be usable at a glance by a busy driver, with big targets and no complicated screens.

1. /driver (DRIVER only): greeting by time of day ("Good morning, Ravi"), today's bus number, route (From to To), departure time, status chip READY, device state. One xl primary button "Start trip". If the device is not registered: a card linking to /driver/setup. If registered but not approved: a neutral card "Waiting for depot approval" and Start trip disabled with that reason.
2. /driver/setup: Register this phone (POST /driver/devices with a label like "Samsung A14"), store deviceKey in localStorage (try/catch), show pending or approved state (poll GET /driver/today every 30 s).
3. Start trip: request location permission first with a clear explanation screen. If denied: instructions for Chrome on Android to re enable it, and Start stays disabled. Then POST /driver/trips/:id/start and go to /driver/trip/[id].
4. useGpsSender hook: watchPosition with the options in docs/13, keeps the latest fix and a GPS status (Active, Weak, Off) with the thresholds in docs/13. Sends POST /tracking/ping with X-Device-Key every 5 s while moving, every 20 s when stationary for 1 min, batching up to 20 points. When offline, buffers up to 500 points in IndexedDB and flushes in batches of 20 when online. Stops cleanly when the trip ends.
5. Screen Wake Lock while the trip runs, re acquired on visibilitychange. If Wake Lock is not supported, show a small tip to keep the screen on.
6. /driver/trip/[id]: "TRIP ACTIVE", GPS status with icon and word, next stop and ETA (from GET /tracking/trips/:id/live, poll every 15 s today), Report issue (secondary, large), End trip (danger, confirmation Dialog "End trip at Nandyal? Passengers will see the trip as completed."). No scrolling needed at 360 x 640.
7. /driver/report: big tiles with icon and label for Delay, Traffic, Breakdown, Accident, Road block, Medical, Other. Optional short note. Sends POST /driver/incidents (server fills trip, bus and GPS). Success confirmation that the depot was alerted, then back to the trip screen.
8. All copy in en and te, body-lg type, 56 px targets, high contrast.

Verify on a real Android phone over HTTPS (staging or pnpm dev:https): log in as driver.knl@aptransit.test, start the assigned trip, walk around and see pings arrive (Dev B watches Redis). Toggle airplane mode for a minute and confirm the buffer flushes. UI quality checklist with driver sizes.
```

## Dev B (backend)

**Read first:** `docs/13-realtime-tracking.md` (all), `docs/12-security.md` (GPS trust, Rate limits), `docs/06-api-contract.md` (Driver, tracking; WebSocket), `docs/05-data-model.md` (devices, trip_assignments, gps_locations, incidents)

```text
Day 11, Dev B (backend). Goal: driver endpoints, trusted GPS ingest, Redis live state, the Socket.IO gateway with room permissions, sampled persistence, driver incident reports, and the simulator.

1. Driver endpoints (DRIVER): POST /driver/devices (random 32 byte key returned once, stored hashed, approvedAt null), GET /driver/today (current or next assignment for today with bus, route, ordered stops, deviceApproved), POST /driver/trips/:id/start (assigned to this driver now, status SCHEDULED, within 60 min of departure: sets RUNNING, actualDepartureAt, adds to depot:live set, publish trip.started, audit), POST /driver/trips/:id/end (RUNNING, sets COMPLETED, actualArrivalAt, removes from live set, publish trip.completed, audit).
2. POST /tracking/ping: all trust checks from docs/12 (role, approved device of this driver, trip RUNNING and assigned to this driver, sane point, 1 to 20 points, rate limit). Sort points by recordedAt, take the latest for live state. Write bus:live:{tripId} with TTL 120. Insert into gps_locations when 30 s passed since trip:lastSample:{tripId}. Return 202 quickly (do heavier work after responding if needed).
3. tracking/progress.ts (first half, rest tomorrow): snapToRoute(point, polyline) returning kmAlong, progressPct, nextStop by kmFromOrigin. Unit tests with the seeded KNL-VJA polyline.
4. Socket.IO gateway on namespace /live: verify the JWT from handshake auth when present, auto join user:{id}. subscribe and unsubscribe events with the permission rules in docs/06 and docs/13. Emit bus:position to trip, route, depot, district and state rooms after each accepted ping, throttled to one per trip per 2 s (state room one per 10 s). Emit trip:status on start and end.
5. GET /tracking/trips/:id/live (public) and GET /tracking/live?depotId&districtId (ops roles with scope checks) from Redis live keys plus the trip data.
6. POST /driver/incidents (DRIVER): type, optional severity and note. Server fills tripId and busId from the current assignment and lat and lng from bus:live (or last gps_locations row). Code INC-XXXXXX, status OPEN, sets trips.hasOpenIncident, bus status BREAKDOWN when type is BREAKDOWN. Publish incident.created, emit incident:new to trip and depot rooms, audit incident.create.
7. scripts/simulate-trip.ts (pnpm simulate): per docs/13. Logs in as the assigned driver through the normal OTP endpoints using the dev echo code (works locally, and on staging only while OTP_DEV_ECHO=1 is set for a demo session), uses the seed device key, starts the trip, interpolates points along the polyline at real pace times --speed, pings every 5 s of simulated time. Options --trip, --speed, --all --depot. --delay-at and --breakdown-at come tomorrow.
8. Tests: ping rejected for unapproved device, wrong driver, trip not running, out of bounds point, too fast; accepted ping writes Redis and emits (use a socket client in the test); start and end rules; incident fills server side fields.

Rules: never trust client supplied trip or bus ids for incidents. No em dash or en dash.

Verify: run pnpm simulate --trip <KNL-VJA trip id> --speed 20 and watch bus:position events with a tiny socket client script in the terminal.
```

## Sync point (end of day, 15 min)

- Dev A drives (walks) a real trip on staging while Dev B watches the socket client print positions.
- Agree the exact `LiveTripDto` for tomorrow's tracking page.
- Merge order: Dev B `b/tracking-ingest`, then Dev A `a/driver-app`.

## Done when

- [ ] Driver can register a device, start, share GPS, report an issue and end a trip on a real phone.
- [ ] Pings are trusted only from approved devices of the assigned driver.
- [ ] Positions flow to Redis, Postgres samples, and Socket.IO rooms with permission checks.
- [ ] Simulator drives a seeded trip end to end.

## Not today

ETA and delay math, citizen map, conductor scanner.

## Optional skill hints (Claude Code)

- Dev A: `/frontend-design` with a note "driver in a moving bus, glance only".
- Dev B: `/scalability` for socket fan out and throttling.
