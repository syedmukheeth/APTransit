# Day 20 · Demo and handover

**Phase:** Demo · **Goal:** a confident live demo of the full story, a clean handover package, and a prioritised Phase 2 backlog. Tag `v1.0.0-demo`.

**Read first (both):** `docs/01-product-brief.md`, `docs/02-mvp-scope.md` (Out of scope, Stretch), `docs/18-open-decisions.md`, `progress/daily-log.md` (known issues)

Merge freeze is on. Only S1 fixes, reviewed by both.

---

## Dev A (frontend)

**Read first:** `docs/01-product-brief.md` (What success looks like on Day 20), `docs/11-screens.md`

```text
Day 20, Dev A (frontend). Goal: demo materials and the web half of the handover.

1. Write progress/demo-script.md: the 12 minute demo story from docs/01 as numbered steps. For each step: who does it, which device, which account, which URL, what to click, what the audience should notice (one line), and a fallback if something fails (for example, a pre recorded clip or a second prepared ticket). Include the warm up checklist at the top (open staging health, wait for 200, start the simulator, log in on each device, set brightness, turn off notifications, charge devices).
2. Prepare devices: citizen phone (logged in, ticket for the demo trip booked and ready to activate), conductor phone (logged in, camera permission granted), driver phone or the simulator, laptop with /ops and /gov open in two tabs.
3. Record a 3 to 4 minute screen capture of the full story as a backup (phone mirrored or recorded on device), stored outside the repo.
4. Write docs for the web in apps/web/README.md: how to run, env vars, folder structure, how to add a screen (route, i18n keys, states, test), how to add a component to packages/ui, design system rules in one page with links to docs/09 and docs/10.
5. Screenshots of every main screen at 360 and 1280 px in both languages, saved to progress/screenshots/ for the presentation.
6. Present the demo with Dev B.

Verify: rehearse the script once in the morning end to end on staging, timed.
```

## Dev B (backend)

**Read first:** `docs/17-deployment.md`, `docs/18-open-decisions.md`, `docs/02-mvp-scope.md`

```text
Day 20, Dev B (backend). Goal: a stable demo environment and the backend half of the handover.

1. Demo readiness: warm up Render (health), confirm the worker heartbeat, run the smoke test, start pnpm simulate --all --depot KNL 10 minutes before the demo, keep the logs open. Have the Neon snapshot ready to restore if data gets messy (practice the restore command once in the morning).
2. Write apps/api/README.md: how to run, env vars, module map, how to add an endpoint (schema in shared, guard, permission, rule file, test, docs/06 decision), jobs and queues, seed and simulator commands, deploy steps.
3. Write progress/handover.md (both devs review it): what exists (by surface), what is stubbed (mock eligibility, phone OTP, fake payments flag), accounts and where secrets live (never the secrets themselves), costs and limits observed, known issues from the daily log with severity, and the open decisions from docs/18 that the authority must answer.
4. Write progress/phase-2-backlog.md: everything from docs/02 Out of scope and Stretch not done, plus parked items from the decisions log, each with one line of why it matters, a rough size (S, M, L) and the plan section it comes from. Put native driver app, real identity provider, SMS, production hosting in India and map provider choice at the top.
5. After the demo: tag v1.0.0-demo on main, final daily log entry, retrospective notes (what worked, what to change) in progress/daily-log.md.

Rules: merge freeze, only S1 fixes reviewed by both. No em dash or en dash in any document.

Verify: pnpm check:dashes passes on the whole repo including the new documents.
```

## Sync point (before and after the demo)

- Morning: 30 minute rehearsal, timed, with the fallback plan checked.
- After the demo: 30 minute retrospective, then tag `v1.0.0-demo`.

## Done when

- [ ] Live demo done (or the recorded backup shown if the network failed).
- [ ] `progress/demo-script.md`, `progress/handover.md`, `progress/phase-2-backlog.md`, both app READMEs written.
- [ ] Screenshots saved for the presentation.
- [ ] `v1.0.0-demo` tagged. Final daily log and retrospective written.

## Optional skill hints (Claude Code)

- Dev A: `anthropic-skills:pptx` if a slide deck is needed for the presentation.
- Dev B: `/engineering:documentation` for the READMEs and handover.
