# Day 05 · Citizen: results, bus details, timetable, and seat holds

**Phase:** Citizen MVP · **Goal:** a guest can search, compare buses, open bus details and browse timetables; the API can hold seats safely under concurrency.

**Read first (both):** `docs/06-api-contract.md` (Trips and booking), `docs/11-screens.md` (`/search`, `/bus/[tripId]`, `/timetable`), `docs/05-data-model.md` (Seat rule)

---

## Dev A (frontend)

**Read first:** `docs/11-screens.md` (Citizen rows for search, bus, timetable), `docs/09-design-system.md` (TripCard, StatusBadge, Formats), plan sec 8 to 10

```text
Day 05, Dev A (frontend). Goal: search results, bus details and the timetable drill down, fast and calm.

1. packages/shared/src/format.ts (coordinate with Dev B, it lives in shared): formatTime, formatDate, formatMoney (paise in, "₹541" out, Indian grouping), formatDuration ("5 h 40 min"), formatDistance, all locale aware (en, te) and in Asia/Kolkata. Unit tests.
2. TripCard in packages/ui: departure (large, tabular), service type name (i18n serviceType key), arrival "approx.", duration, seats left (plural ICU, warning tone when 5 or fewer, "Full" when 0 and the card is not clickable), fare, StatusBadge when not UPCOMING, free travel eligible chip. Whole card is one link with a clear accessible name ("06:30 AM Express to Vijayawada, arrives 12:10 PM, 22 seats left, ₹541").
3. /search: server component reads from, to, date, after from the URL and fetches GET /search/trips. Sticky summary bar (From to To, date, Edit opens a Sheet with the home form). Time band filter chips (Morning 05:00 to 11:59, Afternoon 12:00 to 16:59, Evening 17:00 to 20:59, Night 21:00 to 04:59) stored in the URL. Results list with skeletons. Empty state: "No buses for this date." with Next day and Change route actions. Error state with Retry.
4. /bus/[tripId]: GET /trips/:id and GET /trips/:id/fare for the searched from and to (carry them in the URL). Show everything in docs/11 for this route (plan sec 9): service type, bus number when assigned, departure, arrival, fare breakdown, seats left, live status, boarding points and dropping points, stops as a compact vertical list. Actions: Book ticket (primary, goes to /book/[tripId]?from=&to=, disabled with a reason when full or booking closed), Track bus (secondary), View route (link to the timetable route page).
5. /timetable: districts list, then /timetable?district=ID shows bus stands, then bus stand shows routes, with a breadcrumb. /timetable/route/[routeId]: first, last and next bus, frequency ("Every 30 min"), a date switcher (Today, Tomorrow, calendar), the day's trips as a compact list with StatusBadge, and the stops list. All data from the Day 4 endpoints.
6. Responsive: on md and up, /search shows filters in a left column and results on the right.

Verify: search Kurnool to Vijayawada for tomorrow, open the 06:30 Express, go back and the filters are still set. Telugu at 360 px has no clipped text in TripCard. Write Playwright E2E-1 from docs/14 (install Playwright in apps/web if not yet). Run the UI quality checklist.
```

## Dev B (backend)

**Read first:** `docs/06-api-contract.md` (Trips and booking), `docs/07-ticket-and-pass-rules.md` (section 1), `docs/13-realtime-tracking.md` (Redis keys), `docs/15-env-setup.md` (Upstash and BullMQ budget)

```text
Day 05, Dev B (backend). Goal: trip details, seat map, fare endpoint and booking creation with Redis seat holds that are safe under concurrency, plus the first background jobs.

1. Shared schemas: TripDetailDto, SeatMapDto (layout + seats with FREE, TAKEN, HELD, BLOCKED), FareDto (including refundTiers from the active refund policy), CreateBookingInput, BookingDto.
2. GET /trips/:id, GET /trips/:id/seats?from&to, GET /trips/:id/fare?from&to (public). Seat state: TAKEN from tickets in BOOKED, ACTIVE, SCANNED, USED; HELD from Redis hold:{tripId}:{seatNo}; BLOCKED from the layout. Update GET /search/trips seatsLeft to subtract live holds (one MGET or SCAN per request is too expensive: keep a per trip counter key holdcount:{tripId} maintained on hold and release, with TTL).
3. POST /bookings (user): validate with settings (booking.maxPassengers, booking.daysAhead, booking.closeMinutesBefore), boarding before dropping on the route, seats exist and are not blocked. Hold all seats atomically: SET hold:{tripId}:{seat} bookingId NX EX (holdMinutes x 60) for each seat; if any fails, delete the ones you set and return SEAT_TAKEN with the seat in details. Also check the DB for tickets on those seats. Create the booking (PENDING_PAYMENT, holdExpiresAt, totalPaise from fare.ts for all passengers) and booking_passengers in one transaction. Accept Idempotency-Key.
4. GET /bookings/:id (owner only) and DELETE /bookings/:id (owner, only PENDING_PAYMENT: releases holds, status CANCELLED).
5. BullMQ setup: queues notifications, expiry, rollups, maintenance registered in a QueueModule used by the API (producers only). Worker process (WORKER=1) registers processors with drainDelay from BULLMQ_DRAIN_DELAY_SEC. Jobs today:
   a. expiry: "booking-hold-expired" delayed job at holdExpiresAt: if still PENDING_PAYMENT, mark EXPIRED and release holds.
   b. maintenance: repeatable "generate-trips" daily at 00:30 IST that keeps trips generated 7 days ahead using trip-generator.
6. Tests: concurrency integration test (two parallel POST /bookings for the same seat, exactly one succeeds, the other gets SEAT_TAKEN); hold expiry job releases seats; DELETE releases; validation failures (too many passengers, booking closed, dropping before boarding).

Rules: never trust the client fare, the server computes totalPaise. No em dash or en dash.

Verify: create a booking with curl, see the seats as HELD in GET /trips/:id/seats, wait for expiry with holdMinutes temporarily set to 1 in settings, and see them FREE again. Check the Upstash command count after an hour of idle worker time and write it in the daily log.
```

## Sync point (end of day, 15 min)

- Dev B shows the SeatMapDto for an Express and a Pallevelugu bus. Dev A confirms the SeatMap can render both.
- Confirm the idempotency header name and behaviour for POST /bookings.
- Merge order: Dev B `b/trips-bookings`, then Dev A `a/search-details-timetable`.

## Done when

- [ ] Search, bus details and timetable pages work for guests in both languages at all widths.
- [ ] E2E-1 passes locally and in CI.
- [ ] Seat holds are atomic, expire on time, and the concurrency test passes.
- [ ] Worker runs with drainDelay 60. Upstash usage noted.

## Not today

Seat selection UI, payment.

## Optional skill hints (Claude Code)

- Dev A: `/frontend-design` for TripCard density and hierarchy.
- Dev B: `/scalability` for the hold counter design.
