# Day 19 · Release: full end to end, bug bash, release candidate

**Phase:** Release · **Goal:** every journey in docs/14 is green in CI, the manual QA script passes on real devices, no S1 or S2 bugs remain, and staging runs the release candidate `v0.2.0`.

**Read first (both):** `docs/14-testing-qa.md` (all), `docs/17-deployment.md` (Smoke test), `docs/01-product-brief.md` (What success looks like on Day 20)

Carry over from Day 18 comes first, but only polish items that affect the demo.

---

## Dev A (frontend)

**Read first:** `docs/14-testing-qa.md` (E2E journeys, Manual QA script), `prompts/_shared/definition-of-done.md`

```text
Day 19, Dev A (frontend). Goal: the web side of the release candidate.

1. E2E: make E2E-1 to E2E-12 all pass in CI on both Playwright projects, three runs in a row without flakes. Replace any sleep with web first assertions. Tag slow tests, keep the suite under 10 minutes.
2. Manual QA script from docs/14 on real devices with Dev B: Android Chrome (the main target), iPhone Safari if available, laptop Chrome and Firefox. Both languages, both themes. Log every issue with severity.
3. Fix all S1 and S2 web bugs today. S3 items go to the known issues list in progress/daily-log.md.
4. Final UI pass on the demo path only (home, search, bus, booking, review, pay, ticket, track, conductor result, ops dashboard, replacement, command center): spacing, alignment, copy, empty states, no console errors or warnings in the browser.
5. Build size check: citizen routes within the JS budget in docs/14. Record the numbers.
6. Run the ship check (lint, typecheck, test, build, check:dashes, i18n:check, e2e, axe) on the release branch.

Verify: the demo story from docs/01 runs start to finish on staging on a phone and a laptop without a single workaround.
```

## Dev B (backend)

**Read first:** `docs/14-testing-qa.md` (Performance targets), `docs/17-deployment.md` (all), `docs/18-open-decisions.md` (Internal items)

```text
Day 19, Dev B (backend). Goal: the API side of the release candidate and a clean staging.

1. Fix all S1 and S2 API bugs from the bug bash. S3 items go to the known issues list.
2. Integration test suite green, coverage of the rule files at 90 percent or more (ticket-rules, pass-rules, fare, progress, status). Record coverage numbers.
3. Staging reset for the demo: fresh seed on Neon main with base data, 14 days of history, rollups backfilled, today's trips, the open breakdown, demo accounts. Take a Neon snapshot named demo-backup-<date> after seeding.
4. Rerun the load tests from Day 17 on the reset staging, record numbers.
5. Check docs/18 item I2 (district names in the seed) and fix any wrong names.
6. Verify every endpoint in docs/06 exists and matches (write a small script that lists the Nest routes and compares with a list you keep in the script). Any mismatch: fix code or log a decision.
7. Smoke test from docs/17. Then tag v0.2.0 on main.

Rules: no schema changes today unless they fix an S1. No em dash or en dash.

Verify: smoke test green, e2e green against staging for the core journeys, snapshot created, tag pushed.
```

## Sync point (end of day, 30 min today)

- Full dress rehearsal of the demo story on staging, timed. Target 12 minutes.
- Agree the demo roles: who presents, who drives the simulator, which devices.
- Merge freeze after this sync. Only S1 fixes tomorrow.

## Done when

- [ ] E2E-1 to E2E-12 green in CI three times in a row.
- [ ] Manual QA script passed on real devices, no open S1 or S2.
- [ ] Staging reset, snapshot taken, `v0.2.0` tagged.
- [ ] Every endpoint matches docs/06 or has a logged decision.
- [ ] Known issues list written.

## Not today

New features, refactors, dependency upgrades.

## Optional skill hints (Claude Code)

- Both: `/ship-check`, then `/code-review` on anything merged today.
- Dev B: `/engineering:deploy-checklist` before tagging.
