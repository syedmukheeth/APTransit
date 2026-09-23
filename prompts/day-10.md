# Day 10 · Integration: PWA, end to end tests, staging

**Phase:** Integration (midpoint) · **Goal:** the citizen MVP is installable, covered by end to end tests, and live on staging. Tag `v0.1.0`.

**Read first (both):** `docs/14-testing-qa.md` (all), `docs/17-deployment.md` (all), `docs/02-mvp-scope.md` (Demo story)

This is a buffer day too. **Carry over from days 1 to 9 comes first.** Only then start the tasks below.

---

## Dev A (frontend)

**Read first:** `docs/14-testing-qa.md` (E2E-1 to E2E-6, Manual QA script), `docs/11-screens.md` (`/offline`), Next.js docs on PWA (manifest and service worker)

```text
Day 10, Dev A (frontend). Goal: installable PWA with an offline fallback, the citizen end to end suite green in CI, and a bug bash.

1. PWA:
   a. app/manifest.ts: name "AP TransitOS", short_name "TransitOS", description, start_url "/", scope "/", display standalone, background_color and theme_color from the tokens (light values), lang en, icons 192, 512 and a maskable 512 (a simple bus glyph on the primary colour, made as SVG then exported to PNG, stored in public/icons).
   b. public/sw.js written by hand: versioned cache names; precache /offline and the app icons; navigation requests network first with a 4 s timeout, fall back to cache, then /offline; static assets under /_next/static cache first; never cache /api/v1 except GET /api/v1/tickets/* and /api/v1/passes/* which use network first with cache fallback (so tickets open offline); clean old caches on activate; skipWaiting behind a user visible "Update available" toast with Reload.
   c. Register the service worker only in production builds, in a small client component.
   d. /offline page: calm message, list of cached active tickets (from IndexedDB), Retry.
   e. Account page: "Install app" button that uses beforeinstallprompt when available (never a pop up on load).
2. Playwright: projects Desktop Chrome and Pixel 7. Fixtures for login via OTP dev echo, seeded users, and NEXT_PUBLIC_PAYMENTS_FAKE=1. Make E2E-1 to E2E-6 from docs/14 pass reliably (no fixed sleeps, use web first assertions). Add @axe-core/playwright checks on /, /search, /bus/[id], /tickets/[id], /passes with zero serious or critical violations.
3. Run the manual QA script in docs/14 with Dev B on real phones against staging once it is up. Log bugs with severity. Fix all S1 and as many S2 as possible today.

Verify: Lighthouse PWA checks pass on staging, app installs on Android Chrome, tickets open in airplane mode, CI e2e job is green.
```

## Dev B (backend)

**Read first:** `docs/17-deployment.md` (all), `docs/15-env-setup.md`, `docs/12-security.md` (Secrets)

```text
Day 10, Dev B (backend). Goal: staging on Vercel and Render with real Razorpay webhooks, the e2e job in CI, and bug fixes.

1. Render: aptransit-api (web service) and aptransit-worker (background worker) from the repo with the build and start commands in docs/17. All env vars from docs/15 with staging values (OTP_DEV_ECHO=0 except when we explicitly run a demo session, PAYMENTS_FAKE=0, WEB_ORIGIN set to the Vercel URL). Health check path /api/v1/health.
2. Vercel: project with root apps/web, env vars from docs/17, API_URL and NEXT_PUBLIC_WS_URL pointing at Render.
3. Neon main branch: migrate deploy, then seed (base data and next 7 days). Keep a note of the seed device keys in the password manager.
4. Razorpay test dashboard: webhook to https://<render-api>/api/v1/payments/webhook with the events in docs/17 and the webhook secret. Do a real test payment on staging, close the tab before the redirect, confirm the webhook created the tickets.
5. CI e2e job: build web and api, start the api against the Neon test branch with PAYMENTS_FAKE=1 and OTP_DEV_ECHO=1, start web with NEXT_PUBLIC_PAYMENTS_FAKE=1, run Playwright, upload the report as an artifact on failure. Reset the test branch data before the run with a fast seed.
6. Run the smoke test from docs/17 and fix what breaks. Warm up routine written in progress/daily-log.md.
7. Bug bash with Dev A: fix every S1 and S2 in the API today.
8. When staging passes the smoke test and CI is green: tag v0.1.0 on main.

Rules: only rzp_test_ keys anywhere, secrets only in Render and Vercel env settings and the password manager. No em dash or en dash.

Verify: smoke test passes on staging from a phone on mobile data; a real Razorpay test payment on staging creates tickets via both verify and webhook paths (check audit rows).
```

## Sync point (end of day, 30 min today)

- Run the demo story steps 1 and 6 from `docs/01-product-brief.md` on staging on a phone, in English and Telugu.
- Review the bug list together, agree what carries over.
- Merge order: Dev B deploy config and fixes, then Dev A PWA and e2e. Tag `v0.1.0`.

## Done when

- [ ] Staging URL works on a phone, citizen journey complete with real Razorpay test checkout.
- [ ] Webhook path verified on staging.
- [ ] PWA installable, tickets open offline.
- [ ] E2E-1 to E2E-6 green in CI with axe checks.
- [ ] No open S1 bugs. `v0.1.0` tagged.

## Not today

Driver, conductor, ops, gov features.

## Optional skill hints (Claude Code)

- Both: `/ship-check` against staging.
- Dev B: `/engineering:deploy-checklist` before the first staging deploy.
- Dev A: `/engineering:testing-strategy` to review the e2e suite for gaps.
