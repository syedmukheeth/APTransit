# Day 17 · Government: analytics, reports, feedback UI, and security hardening

**Phase:** Government · **Goal:** planners get clear charts and exportable reports, citizens can give feedback and track it, and the whole system passes a security and load pass.

**Read first (both):** `docs/12-security.md` (all), `docs/14-testing-qa.md` (Performance targets), `docs/11-screens.md` (`/gov/analytics`, `/gov/reports`, `/feedback`, `/ops/complaints`)

---

## Dev A (frontend)

**Read first:** `docs/11-screens.md` (rows listed above), `docs/09-design-system.md` (tokens for charts, DataTable), `docs/10-ux-writing.md`, plan sec 37 to 41 and 72

```text
Day 17, Dev A (frontend). Goal: analytics and reports for government, feedback and complaint screens for citizens and ops.

1. Chart rules (write them as a short comment at the top of apps/web/components/charts/index.ts): Recharts only, colours from tokens (one accent for a single series, neutral for context, status tones only when the data is a status), no 3D, no pie charts for more than 3 parts, axis labels and units always, tooltips in the user's language and formats, tabular numbers, every chart has a data table toggle for screen reader users and exact values.
2. /gov/analytics with tabs in the URL (Routes, Buses, Passengers, Delays, Demand) and a date range picker (last 7 days default, max 14 with our data):
   a. Routes: DataTable (passengers, trips, load factor, average delay, cancellations, revenue) sortable, top 5 routes by passengers as a horizontal bar chart.
   b. Buses: utilisation and downtime table, bar chart of utilisation.
   c. Passengers: tickets sold per day (line), busy hours (24 bars), pass usage numbers.
   d. Delays: average delay by hour of day (bars, evening peak should be visible), worst routes list with a sentence like "KNL-VJA-01: average delay 18 min, mostly 5 PM to 8 PM" built from i18n with variables (plan sec 39).
   e. Demand: route picker, bands Morning, Afternoon, Evening, Night with Low, Medium, High chips (plan sec 38) and a small note that this supports planners and does not decide anything.
3. /gov/reports: cards Daily, Weekly, Monthly (plan sec 72) with report kinds, date range, Download CSV (file download via the API, loading state, success toast).
4. /feedback (plan sec 40): email (prefilled when logged in), category chips, message with a character counter, optional details collapsed under "Add trip details" (ticket code, bus number, route, date). Submit shows the complaint code prominently with Copy and "Track status" link. /feedback/status: code and email lookup, status timeline (Received, In review, Resolved, Closed) with dates and the resolution note.
5. /ops/complaints: DataTable with status filter, detail drawer with the message and trip details, status change with a required note for Resolved, assignment.
6. Add a "Give feedback" link on completed tickets and in the account page.

Verify: E2E-10 (gov drill down and CSV export) and E2E-11 (feedback to resolution). Charts readable in dark mode and Telugu. UI quality checklist.
```

## Dev B (backend)

**Read first:** `docs/12-security.md` (all, especially Day 17 hardening pass), `docs/14-testing-qa.md` (Performance targets, Load), `docs/17-deployment.md` (Monitoring)

```text
Day 17, Dev B (backend). Goal: a full security pass with real attack attempts, load tests on staging, fixes for hot paths, and the web security headers.

1. Go through docs/12 row by row. For each row add a line to progress/daily-log.md with the file and function that implements it, or "missing" and then fix it today.
2. Try every attack in the "Day 17 hardening pass" list and record the result. Add a regression test for each one that could have worked.
3. Web security headers in apps/web/next.config.ts headers() exactly as docs/12 (CSP with a nonce for Next scripts if needed, Razorpay and OpenFreeMap and the WS origin allowed, HSTS, nosniff, referrer policy, permissions policy with camera and geolocation self). Coordinate with Dev A and check checkout, maps, sockets and the scanner still work on staging.
4. Load tests with autocannon scripts in scripts/load: search (50 rps for 60 s) and validate (30 rps for 60 s with a pool of pre activated test tickets on a test trip). Run against staging. Record p50, p95, p99 and errors. Targets from docs/14.
5. Fix hot paths found: add missing indexes, select only needed columns, avoid N+1, cache static reads in memory, make sure Neon pooled connections are used by the app. Rerun and record.
6. pnpm audit --prod: fix or document every high issue.
7. Check logs on staging for leaked secrets, OTPs, tokens, phone numbers or emails in full. Fix redaction if anything leaks.

Rules: only attack our own staging and local environments. No em dash or en dash.

Verify: the checklist in the daily log is complete with no "missing" rows left, load test numbers meet targets or have a written reason and a follow up.
```

## Sync point (end of day, 15 min)

- Dev B presents the security checklist and load numbers. Decide together about anything that misses a target.
- Dev A checks the CSP did not break checkout, maps, sockets or camera on staging.
- Merge order: Dev B `b/hardening` (includes headers), then Dev A `a/analytics-feedback`.

## Done when

- [ ] Analytics tabs, reports download and feedback screens work in both languages.
- [ ] E2E-10 and E2E-11 pass.
- [ ] Every docs/12 row is implemented and linked, attacks recorded with regression tests.
- [ ] Load test results recorded against targets.
- [ ] Security headers live on staging without breaking features.

## Not today

Telugu review, accessibility audit, observability (Day 18).

## Optional skill hints (Claude Code)

- Dev A: `/dataviz` before writing any chart code.
- Dev B: `/security` while fixing, `/security-review` on the branch before merging, then `/cost-reducer` for Neon and Upstash usage.
