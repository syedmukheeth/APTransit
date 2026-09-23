# Day 04 · Citizen: home, login and search API

**Phase:** Citizen MVP · **Goal:** a citizen can open the home screen, pick From and To with real AP places, log in with OTP, and the search API returns real trips with fares.

**Read first (both):** `docs/01-product-brief.md`, `docs/06-api-contract.md` (Network, search, timetable), `docs/11-screens.md` (Citizen: `/`, `/login`, `/account`)

---

## Dev A (frontend)

**Read first:** `docs/11-screens.md` (Citizen), `docs/09-design-system.md` (PlaceCombobox, DatePicker, OtpInput), `docs/10-ux-writing.md`, `docs/12-security.md` (Tokens on the web), plan sec 6 and 7 in `docs/99-source-product-plan.md`

```text
Day 04, Dev A (frontend). Goal: API client, session handling, home screen, login and account pages.

1. apps/web/lib/api.ts: small fetch wrapper. Base path /api/v1 (same origin). Adds Authorization from the in memory access token. Parses the error shape from docs/06 into an ApiError with code, details and requestId. Validates every response with the zod Dto schema from @aptransit/shared. On 401 it calls POST /auth/refresh once (single flight, so parallel requests share one refresh), retries once, else clears the session and redirects to /login?next=<current path>.
2. Session: AuthProvider (React context) holding the access token in memory only, a silent refresh on first load, useMe() with TanStack Query, login(), logout(). QueryClient provider with sensible defaults (retry 1 for 5xx, none for 4xx, refetchOnWindowFocus for tickets later).
3. middleware.ts: for routes that need login in docs/08 (web route guards table), redirect to /login?next= when the apt_rt cookie is missing. For driver, conductor, ops, gov and admin, the page also checks can(user, permission) from @aptransit/shared after useMe and shows a 403 EmptyState if not allowed.
4. Home (/) per docs/11 and plan sec 6: "Where do you want to go?", From and To PlaceCombobox (GET /places/search, debounce 200 ms, min 2 chars, matches English and Telugu, shows district as secondary text, recent places from localStorage wrapped in try/catch, keyboard accessible listbox), swap button with aria-label, date chips Today and Tomorrow plus a calendar DatePicker (today to today + 30), primary "Search buses" button that goes to /search?from=&to=&date=. Validation: From and To required and different, errors inline. Quick actions grid (Track bus, My tickets, My passes, Timetable) as large cards with icons. Updates strip hidden for now (no data yet).
5. Login (/login): tabs Email and Phone (phone tab shows a small note that SMS is only in dev for now, from i18n). Step 1 target input and "Send code". Step 2 OtpInput (6 boxes, paste, autocomplete one-time-code, auto submit), resend timer from resendInSec, change target link. Errors mapped from error codes (OTP_INVALID, OTP_EXPIRED, OTP_TOO_MANY_ATTEMPTS, RATE_LIMITED). After success go to next or to the role home from docs/08.
6. Account (/account): name (editable, PATCH /me), email and masked phone, language (LanguageSwitch now also PATCHes preferredLocale when logged in), theme (light, dark, system), role switcher when the user has more than one role, Log out.
7. Loading, empty and error states on all three pages. Skeletons for the combobox results.

Verify: at 360 px complete home, then log in as citizen@aptransit.test (OTP from the API log), then come back to home with the session kept after a full reload. Keyboard only works for the whole flow. Run the UI quality checklist. pnpm lint, typecheck, test, i18n:check, check:dashes pass.
```

## Dev B (backend)

**Read first:** `docs/06-api-contract.md` (Network, search, timetable), `docs/05-data-model.md` (Network, fare_rules), `docs/07-ticket-and-pass-rules.md` (section 1), `docs/19-seed-data.md` (Bus types and demo fares)

```text
Day 04, Dev B (backend). Goal: all public network, timetable and search endpoints, plus the shared fare calculator.

1. packages/shared/src/fare.ts: calculateFare({ distanceKm, rule, isFreeTravel }) returning { basePaise, reservationFeePaise, totalPaise } rounded to the nearest rupee, applying minFare; and refundQuote({ farePaise, reservationFeePaise, departureAt, now, tiers, operatorCancelled, isFree }) per docs/07 section 6. Exhaustive unit tests including every tier edge.
2. Shared zod schemas for every Dto and Query in the "Network, search, timetable" table of docs/06 (packages/shared/src/schemas/network.ts and search.ts).
3. Network module endpoints (all @Public, rate limited per docs/12): GET /places/search (prefix and contains match on nameEn and nameTe, bus stands ranked first, limit 10), /districts, /districts/:id/bus-stands, /bus-stands/:id/routes, /routes/:id (ordered stops), /routes/:id/timetable?date (firstDepartureLocal, lastDepartureLocal, nextDepartureAt from now in IST, frequencyMin as the median gap, trips for the date).
4. GET /search/trips?from&to&date&after: find active routes where both stops exist and seq(from) < seq(to); trips on that service date that are not CANCELLED; departureAt = scheduledDepartureAt + minutesFromOrigin(from); arrivalAt likewise for to; distance = km(to) minus km(from); fare via fare.ts with the fare rule valid on that date; seatsLeft = totalSeats minus tickets in BOOKED, ACTIVE, SCANNED, USED on the trip (holds are added on Day 5); displayStatus via deriveTripDisplayStatus; freeTravelEligible from bus type. Exclude trips whose departure from the boarding stop is already past booking.closeMinutesBefore. Sort by departureAt. One SQL round trip for trips plus one for seat counts (no N+1).
5. Small in memory cache (60 s) for districts and places search results. No Redis cache for these (saves Upstash commands).
6. Tests: fare and refund unit tests; integration tests for places search (English and Telugu input), timetable next departure, search Kurnool to Vijayawada tomorrow returns 6 trips with correct times and fares (Express 365 km is ₹541), search in the reverse direction on a one way stop pair returns nothing, invalid date gives VALIDATION_FAILED.

Rules: fares only from fare.ts, IST handled only through shared time.ts, no em dash or en dash.

Verify: curl the search for tomorrow and compare times against docs/19. p95 locally under 250 ms for search (log timings).
```

## Sync point (end of day, 15 min)

- Dev A runs home against Dev B's real places search. Check Telugu search input ("కర్నూ") returns Kurnool.
- Agree the query string format for `/search` (from and to are stop ids, date YYYY-MM-DD).
- Merge order: Dev B `b/network-search`, then Dev A `a/home-login`.

## Done when

- [ ] Home, login, account work end to end with the real API, in both languages.
- [ ] Session survives reload, refresh is single flight, guarded routes redirect with `next`.
- [ ] All network and search endpoints match `docs/06` with tests.
- [ ] `fare.ts` and `refundQuote` fully tested.
- [ ] E2E-1 can be written tomorrow (search returns data).

## Not today

Search results page, booking, seat holds.

## Optional skill hints (Claude Code)

- Dev A: `/frontend-design` for the home screen, then `/design-taste-frontend` for a critical second look.
- Dev B: `/scalability` for the search query plan.
