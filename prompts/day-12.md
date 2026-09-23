# Day 12 · Live transport: tracking map, ETA and ticket validation

**Phase:** Live transport · **Goal:** citizens watch the bus move with ETA and delay; the API validates tickets in under 300 ms with exact reasons.

**Read first (both):** `docs/13-realtime-tracking.md` (Progress, ETA and delay; Socket rooms; Maps), `docs/07-ticket-and-pass-rules.md` (section 5), `docs/adr/004-maps-maplibre.md`

---

## Dev A (frontend)

**Read first:** `docs/11-screens.md` (`/track`, `/track/[tripId]`), `docs/09-design-system.md` (Route progress colours, MapView, RouteProgress), plan sec 22 to 24

```text
Day 12, Dev A (frontend). Goal: live tracking for citizens, and sockets wired across the app.

1. apps/web/lib/socket.ts: one shared Socket.IO client for the tab, connects to NEXT_PUBLIC_WS_URL namespace /live with auth token when logged in (reconnect with the fresh token after refresh), subscribe and unsubscribe helpers returning cleanup functions, connection state exposed for UI. Fallback: if the socket is disconnected for more than 10 s, the page polls the REST endpoint every 15 s.
2. MapView in packages/ui (client only, loaded with next/dynamic so maplibre stays out of other routes): MapLibre with NEXT_PUBLIC_MAP_STYLE_URL, AP default bounds, attribution visible, route line split into done (success tone) and ahead (neutral dashed), stop dots, bus marker with a bus icon rotated by heading, next stop highlighted, fit to route on load, recenter button. Colours read from CSS variables so dark mode works. The map is aria-hidden; the RouteProgress list carries the same information.
3. RouteProgress in packages/ui: vertical list of stops with Done, Current, Upcoming states (plan sec 23 and 24 as resolved in docs/09), ETA per upcoming stop, delay chip, incident chip. Current stop is announced politely when it changes.
4. /track: pick from upcoming tickets (one tap), or enter a ticket code, or search a route and pick a running trip.
5. /track/[tripId]: map on top (40 percent height on mobile), a draggable Sheet with next stop, ETA, StatusBadge, delay chip, "Updated 5 s ago" (ticks every second, turns warning after 60 s without updates), and RouteProgress. Subscribes to trip:{id} for bus:position, trip:status and incident events. Not started state per docs/11. Completed state with a Give feedback link.
6. Wire sockets elsewhere: user room notification:new updates the bell count and shows a toast for TRIP_DELAYED, TRIP_CANCELLED, REPLACEMENT_BUS; ticket:status invalidates the ticket queries; the driver trip screen uses socket updates for next stop and ETA instead of polling.

Verify: run Dev B's simulator on a trip you hold a ticket for, watch it move on a phone at 360 px and on a laptop, check the delay chip when the simulator injects a stall, kill Wi Fi for 20 s and confirm the polling fallback. Lighthouse on /track/[id]: maplibre not in the first load of other routes. Write Playwright E2E-7.
```

## Dev B (backend)

**Read first:** `docs/13-realtime-tracking.md` (Progress, ETA and delay), `docs/07-ticket-and-pass-rules.md` (section 5, section 10), `docs/06-api-contract.md` (POST /tickets/validate, conductor endpoints), `docs/14-testing-qa.md` (Performance targets)

```text
Day 12, Dev B (backend). Goal: fixed math for progress, ETA and delay with trip notifications, and the ticket validation endpoint with the conductor endpoints.

1. Finish tracking/progress.ts exactly as docs/13: stop reached within 150 m, lastStopSeq, delay against the last reached stop (floored at 0), paceFactor clamp 0.8 to 1.5, ETA per upcoming stop, progressPct. Pure functions, 90 percent coverage, tests for each step including a trip that stalls and one that runs early.
2. Apply progress on each accepted ping: update Redis live state, update trips.delayMinutes (only when it changes by 2 min or more) and lastStopSeq, emit trip:status when displayStatus changes. Notifications from docs/13: TRIP_DEPARTED on start, TRIP_DELAYED when delay first crosses 10 min then every further 15 min, BUS_NEAR_STOP once per ticket when ETA to its boarding stop is 10 min or less. Send to holders of BOOKED and ACTIVE tickets on that trip.
3. Simulator options --delay-at <stopSeq>:<minutes> and --breakdown-at <km> (stops pinging movement and files a BREAKDOWN incident through the API).
4. POST /tickets/validate (CONDUCTOR, rate limited): exact check order from docs/07 section 5 for tickets and passes. Conductor's current trip comes from their assignment, compared with the tripId in the body (reject mismatches with FORBIDDEN). Write ticket_scans for every attempt with result and reason. On VALID update ticket ACTIVE to SCANNED with the optimistic lock (a lost race returns ALREADY_SCANNED), emit ticket:status to the holder. For ALREADY_SCANNED include the earlier scan time. Response shape per docs/06. Audit ticket.scan.
5. Performance: one query to load the ticket or pass with trip and bus type, keys cached in memory, target p95 under 300 ms. Log timing per request. Add a unit test per validation row and an integration test that runs the whole order.
6. GET /conductor/today and GET /conductor/trips/:id/manifest (counts: passengers = tickets on the trip in BOOKED, ACTIVE, SCANNED, USED plus pass scans; checked = scanned; pending = the rest).

Rules: math only in progress.ts, validation only in ticket-rules and the validate service. No em dash or en dash.

Verify: simulate a trip with a stall and watch delay and notifications; validate a live QR (VALID), the same again (ALREADY_SCANNED with time), a BOOKED ticket (NOT_ACTIVATED), a 90 second old screenshot (STALE_CODE), a ticket from another trip (WRONG_TRIP). Record p95 in the daily log.
```

## Sync point (end of day, 15 min)

- Watch a simulated trip on Dev A's tracking page while Dev B injects a delay and a breakdown.
- Dev B shows validation responses for every reason. Dev A maps each to the scanner copy in docs/10 tomorrow.
- Merge order: Dev B `b/progress-validate`, then Dev A `a/live-tracking`.

## Done when

- [ ] Tracking page shows movement, next stop, ETA, delay and incidents live, with polling fallback.
- [ ] Progress, ETA and delay are fixed math with tests.
- [ ] Trip notifications fire at the right moments, once.
- [ ] Validation returns every reason correctly, p95 under 300 ms locally.
- [ ] E2E-7 passes.

## Not today

Scanner UI (Day 13), ops screens.

## Optional skill hints (Claude Code)

- Dev A: `/frontend-design` for the tracking sheet; `/dataviz` is not needed yet.
- Dev B: `/scalability` for the validate hot path.
