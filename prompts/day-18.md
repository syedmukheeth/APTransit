# Day 18 · Polish: Telugu, accessibility, responsive, and operations readiness

**Phase:** Polish · **Goal:** every screen is correct in Telugu, accessible, responsive and consistent; the backend is observable, backed up and cleaned up by retention jobs.

**Read first (both):** `docs/09-design-system.md` (Accessibility, Do not), `docs/10-ux-writing.md`, `docs/17-deployment.md` (Backups and recovery, Monitoring), `docs/05-data-model.md` (Retention jobs)

---

## Dev A (frontend)

**Read first:** `docs/09-design-system.md` (all), `docs/10-ux-writing.md` (all), `docs/11-screens.md` (Screen checklist), `prompts/_shared/ui-quality-checklist.md`

```text
Day 18, Dev A (frontend). Goal: a polish pass over every route in docs/11. No new features today.

1. Route inventory: make a checklist in progress/daily-log.md with every route in docs/11. For each route tick: 360, 768, 1280 px; light and dark; English and Telugu; loading, empty, error states; keyboard only; screen reader title and h1. Fix as you go.
2. Telugu: read every te.json value in context on the screen, not in the file. Fix overflow (buttons, bottom nav, table headers, chips), awkward wording, and any English leftovers. Mark keys that need a native speaker review and share the list (docs/18 item I1). Check number, date and currency formats in te.
3. Accessibility: add @axe-core/playwright to every e2e journey and fix all serious and critical issues. Manual: TalkBack on Android for the core journey (search, book, pay, activate, show QR) and NVDA or VoiceOver on desktop for ops and gov. Focus order, focus return after dialogs and sheets, live regions for the hold timer, scanner result and countdown summary. Zoom 200 percent on citizen pages.
4. Consistency sweep: every status goes through StatusBadge, every money value through formatMoney, every time through formatTime, no raw colours (grep for #, rgb, hsl outside tokens.css), no arbitrary Tailwind values (grep for "-[" patterns), no hardcoded strings (grep JSX text nodes), no em dash or en dash.
5. Performance: Lighthouse mobile on /, /search, /bus/[id], /tickets/[id], /track/[id]. Hit the targets in docs/14 (LCP, CLS, INP, JS budget). Typical fixes: dynamic import for maps and charts, server components for data, font subsetting, image sizes.
6. Reduced motion and dark mode final check on the ticket, tracking and scanner screens.
7. If Dev B shipped the offline pack on Day 16: add offline scanning to the conductor app (cache the pack when online, verify signature and validity offline with the public key, queue scans in IndexedDB, sync with the batch endpoint, show "Offline check" on results). Otherwise skip.

Verify: axe clean on all journeys, Lighthouse numbers recorded, route checklist fully ticked. Playwright E2E-12 (language switch journey).
```

## Dev B (backend)

**Read first:** `docs/17-deployment.md` (Monitoring, Backups and recovery), `docs/05-data-model.md` (Retention jobs), `docs/13-realtime-tracking.md` (Retention), `docs/15-env-setup.md` (Upstash and BullMQ budget)

```text
Day 18, Dev B (backend). Goal: observability, retention, backups with a restore drill, and a clean bill of health for jobs and costs.

1. Logs: every request log has requestId, userId (when known), route, status, duration. Error logs include the error code. Check redaction again. Add a correlation id to socket events and jobs.
2. Error tracking (optional, free tier): @sentry/node in api and worker with the environment tag, no PII, sample rate 1.0 on staging. Skip if it adds friction, and log the decision.
3. Health: GET /health reports db, redis, worker heartbeat age, queue depth per queue, and version (git sha). Set up a free uptime monitor on staging /health.
4. Retention jobs on the maintenance queue (daily 02:00 IST): gps_locations older than 30 days, otp_codes older than 24 h, expired or revoked refresh_tokens older than 30 days, notifications older than 90 days. Batched deletes (10,000 rows per batch). Tests with frozen time.
5. Failed jobs: retries with backoff for email jobs (3 attempts), a daily summary line in logs of failed jobs, and a small admin endpoint GET /admin/jobs/failed (state admin) listing the last 50 failed jobs with reason (already listed in docs/06 Admin).
6. Backups: create a Neon named branch snapshot of main, then do the restore drill from docs/17 (branch from the snapshot, point a local API at it, run the smoke test). Record the time taken in the daily log.
7. Costs and limits: record Upstash command usage per database, Neon compute hours and storage, Render and Vercel usage. Tune anything that trends past free limits before the demo.
8. Fix any bugs from Dev A's polish sweep that are API side.

Rules: no em dash or en dash. No new dependencies other than the optional Sentry SDK listed in docs/04.

Verify: kill the worker on staging and see health report the worker as stale within 3 minutes; restart and see it recover. Restore drill completed and timed.
```

## Sync point (end of day, 15 min)

- Walk the route checklist together, pick the last polish items for tomorrow morning.
- Review cost and limit numbers. Make sure nothing runs out during the demo.
- Merge order: Dev B `b/ops-readiness`, then Dev A `a/polish`.

## Done when

- [ ] Every route passes the screen checklist in docs/11 in both languages and themes.
- [ ] axe clean, Lighthouse targets met or documented.
- [ ] E2E-12 passes.
- [ ] Retention jobs, health with worker heartbeat, uptime monitor and restore drill done.
- [ ] Telugu review list sent to a native speaker.

## Not today

New features of any kind.

## Optional skill hints (Claude Code)

- Dev A: `/ship-check` on the web app, `/design-taste-frontend` for a last critical look.
- Dev B: `/engineering:incident-response` to write a one page runbook for demo day failures, `/cost-reducer` for provider usage.
