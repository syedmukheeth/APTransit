# 14 · Testing and QA

**Status: LOCKED.** Source: plan sec 78, 79, 93. Both devs.

## Test levels

| Level | Tool | Where | Rule |
| --- | --- | --- | --- |
| Unit | Vitest | next to the file: `x.ts` and `x.test.ts` | Every pure rule function. Must run in under 10 s total per package |
| Integration (API) | Vitest + supertest + a Neon test branch | `apps/api/test/*.int.test.ts` | Each endpoint: happy path, auth failure, one business rule failure |
| Component | Vitest + Testing Library | `packages/ui`, `apps/web/components` | Interactive components: keyboard, aria, states |
| End to end | Playwright | `apps/web/e2e/*.spec.ts` | Core journeys below, desktop Chrome and a Pixel 7 profile |
| Accessibility | @axe-core/playwright | inside e2e | Zero serious or critical violations on main pages |
| Load | autocannon | `scripts/load/*.ts` | Validate and search targets below |

Coverage target: 90 percent lines on `ticket-rules.ts`, `pass-rules.ts`, `fare.ts`, `progress.ts`, `status.ts`. No global target elsewhere; test what can break.

## Must have unit tests (plan sec 78)

| Area | Cases |
| --- | --- |
| Fare | Base, per km, minimum fare, reservation fee, free travel 0, rounding to whole rupee |
| Refund quote | Each tier edge (exactly 24 h, 12 h, 1 h, 59 min), operator cancel 100 percent, free ticket 0 |
| Ticket activation | Before window, at open, inside, at close, after close, already active, cancelled trip, delay extends window |
| Ticket validation | Every row of the scan order table in [07](07-ticket-and-pass-rules.md) section 5, in order |
| Rotating code | Current, previous, next step valid; two steps old invalid; clock offset handling |
| Gifting | Every rule row in [07](07-ticket-and-pass-rules.md) section 7 |
| Pass | Expiry math (7 and 30 days), countdown format, activate within window, one active per kind |
| Eligibility | Mock provider results, consent false, pass not giftable |
| Tracking | Snap to polyline, stop reached at 150 m, delay math, pace factor clamp, derived display status |
| Status | `deriveTripDisplayStatus` priority order |

## End to end journeys (plan sec 78, 97)

| Id | Journey | Day ready |
| --- | --- | --- |
| E2E-1 | Guest: home, search Kurnool to Vijayawada, see results, open bus details | 5 |
| E2E-2 | Citizen: login with OTP (dev echo), book seat, pay with Razorpay test (mocked checkout in CI), see ticket | 10 |
| E2E-3 | Citizen: activate ticket inside window, QR shows and rotates | 10 |
| E2E-4 | Citizen: cancel a booked ticket, refund amount matches quote | 10 |
| E2E-5 | Citizen: gift ticket to citizen2, citizen2 sees it, citizen1 no longer does | 10 |
| E2E-6 | Citizen: buy weekly pass, activate, countdown visible | 10 |
| E2E-7 | Driver: start trip, simulator pings, citizen tracking page updates position and ETA | 12 |
| E2E-8 | Conductor: scan active ticket VALID, scan again ALREADY_SCANNED, scan booked NOT_ACTIVATED | 13 |
| E2E-9 | Driver reports breakdown, ops sees incident live, assigns replacement, citizen gets notification | 15 |
| E2E-10 | Gov: command center loads, drill down district to trip, export CSV | 17 |
| E2E-11 | Feedback: submit, get code, ops changes status, citizen sees update | 17 |
| E2E-12 | Language: switch to Telugu on home, search, ticket; no missing keys, no overflow | 18 |

In CI, Razorpay checkout is replaced by a test double that calls `/payments/verify` with a signature made from the test secret. Manual QA uses the real Razorpay test checkout (UPI `success@razorpay`, card `4111 1111 1111 1111`).

## Performance targets (plan sec 79)

| Area | Target | How measured |
| --- | --- | --- |
| Search API | p95 under 250 ms at 50 rps | autocannon on staging |
| Validate API | p95 under 300 ms at 30 rps | autocannon on staging |
| Scan, camera to result | under 2 s on a mid range Android | manual, stopwatch, 10 scans |
| Citizen pages | LCP under 2.5 s, CLS under 0.1, INP under 200 ms on mobile Lighthouse | Lighthouse CI on `/`, `/search`, `/tickets/[id]` |
| JS per citizen route | under 200 kB gzip first load | `next build` output |
| Live tracking | position visible within 3 s of the ping | e2e timestamp check |
| Dashboards | first data under 2 s with 7 days of seed data | manual |

## Manual QA script (run on Day 10, 15, 19)

Devices: one Android phone (Chrome), one iPhone if available (Safari), one laptop (Chrome, Firefox). Both themes. Both languages.

1. Home at 360 px: no horizontal scroll, all tap targets comfortable, text readable in sunlight (max brightness outdoors if possible).
2. Search with a typo in the place name, with Telugu input, with no results.
3. Book 2 seats, let the hold expire, confirm the seats are released.
4. Pay, kill the tab during payment, reopen: booking recovers via webhook, no double ticket.
5. Activate a ticket twice from two tabs: only one succeeds.
6. Screenshot a live QR, wait 90 s, scan it: STALE_CODE.
7. Turn off network on the ticket page: ticket and QR still show (cached), offline banner shows.
8. Driver: deny location permission, see clear instructions. Allow, start trip, lock and unlock screen.
9. Conductor: scan in low light with torch, scan a printed QR of another site, scan a gifted ticket as the old holder's QR.
10. Ops: open incidents on two screens, acknowledge on one, the other updates live.
11. Keyboard only: complete booking without a mouse. Screen reader: hear seat numbers and states.
12. Telugu: every screen in the core journey, look for clipped text and English leftovers.

## Bug reporting

In `progress/daily-log.md` under "Bugs found": id, steps, expected, actual, screenshot path, severity (S1 blocks demo, S2 wrong behaviour, S3 polish). S1 is fixed the same day.

## Pilot KPIs to wire into analytics (plan sec 93)

Search usage, completed bookings, activation rate, average scan time, tracking views, pass usage, trips completed, delay reports, incident response time (created to acknowledged), GPS uptime (pings received vs expected), complaints resolved, average booking time (search to verified payment), app errors (5xx rate).
