# Day 09 · Citizen: gift, passes, free travel screens, and notifications

**Phase:** Citizen MVP · **Goal:** the whole citizen feature set exists: gifting, passes with countdown, free travel, and an updates inbox fed by real events and emails.

**Read first (both):** `docs/07-ticket-and-pass-rules.md` (sections 7 to 9), `docs/10-ux-writing.md` (Notifications), `docs/06-api-contract.md` (Notifications)

---

## Dev A (frontend)

**Read first:** `docs/11-screens.md` (`/tickets/[id]/gift`, `/passes`, `/passes/buy`, `/free-travel`, `/updates`), `docs/09-design-system.md` (Countdown), plan sec 16 to 21 and 43

```text
Day 09, Dev A (frontend). Goal: gift flow, passes, free travel and the updates inbox.

1. /tickets/[id]/gift: one field (phone or email, auto detected), one line rules summary from i18n ("Gift once, before {time}. Free tickets cannot be gifted."), Continue opens a Dialog "Gift seat 18 to +91 98xxxxx210? You will lose access to this ticket." then POST /tickets/:id/transfer. Map every denial code to its i18n message. Success returns to /tickets with a toast.
2. Countdown component in packages/ui: uses the shared countdown helper, shows "5 days 08 hours 21 minutes", switches to seconds under 24 hours, updates on its own (one interval, cleared on unmount, paused when the tab is hidden and re synced on visibility). aria-live off with a visually hidden summary updated once a minute.
3. /passes: active pass card (pass name, valid from and until, Countdown, LiveQr reused with GET /passes/:id/qr, valid services list), READY passes with Activate (confirmation Sheet with validity dates), history. Empty state with Buy pass.
4. /passes/buy: pass types from GET /pass-types as selectable cards (price, validity, services). Paid: create pass then pay with the same usePayment hook extended for { passId }. Free travel card links to /free-travel.
5. /free-travel: short explainer (who is eligible, which buses, carry photo ID) from i18n, consent checkbox with the consent text, category radio (Woman, Girl, Transgender), AP domicile confirmation, ID type select (Aadhaar, Voter ID, Ration card, Other photo ID) with a clear note "Do not enter any ID number. The conductor checks your ID on the bus." Submit calls POST /eligibility/stree-shakti. ELIGIBLE: success state and Get free travel pass (POST /passes). NOT_ELIGIBLE: reason in plain words and what to do, never a dead end.
6. Free travel booking: on /bus/[tripId] when the user has an active free travel pass and the trip is eligible, show a secondary "Book free seat" path that uses useFreeTravel (one passenger, no payment step).
7. Notifications: bell in the citizen top bar with unread count (GET /notifications/unread-count, poll 60 s for now), /updates inbox grouped by day with icon per type, title and body from the shared messages with params, relative time, unread dot, tap marks read and follows link, Mark all read. Empty state "You are all caught up."

Verify: gift a ticket from citizen to citizen2 (two browsers), buy and activate a weekly pass, run the free travel flow, see notifications for booking and activation. Telugu for all new screens. UI quality checklist. Write Playwright E2E-5 and E2E-6.
```

## Dev B (backend)

**Read first:** `docs/05-data-model.md` (notifications), `docs/10-ux-writing.md` (Notifications, exception about shared messages), `docs/15-env-setup.md` (Upstash and BullMQ budget), `docs/13-realtime-tracking.md` (notification triggers list)

```text
Day 09, Dev B (backend). Goal: notifications (in app and email) driven by domain events, and the expiry jobs that keep ticket and pass states honest.

1. NotificationService.notify(userId, type, params, link): writes a notifications row, then enqueues an email job on the notifications queue when the user has an email. Email rendering in the worker: subject and body from packages/shared/src/messages/{locale}.json (notifications.* and email.*) in the user's preferredLocale, simple accessible HTML template (plain layout, one link button, text version too), sent via the EmailProvider (Resend, .test addresses logged). Mark emailedAt.
2. Subscribers on DomainEventsService: booking.confirmed to BOOKING_CONFIRMED (one per booking, not per ticket), ticket.activated to TICKET_ACTIVATED, ticket.transferred to TICKET_RECEIVED for the recipient. Refunds get no notification type in the MVP: the ticket page shows the refund status. Use only the NotificationType values in docs/05.
3. Endpoints: GET /notifications (cursor pagination), GET /notifications/unread-count, POST /notifications/:id/read, POST /notifications/read-all. Owner only.
4. Expiry jobs (repeatable every 5 min on the expiry queue, one query each, batched updates with optimistic locking, audit not needed for system transitions but log counts):
   a. BOOKED tickets whose activation window closed: EXPIRED.
   b. ACTIVE tickets past validUntil and never scanned: EXPIRED.
   c. SCANNED tickets past validUntil: USED.
   d. READY passes past purchase + pass.activateWithinDays: EXPIRED. ACTIVE passes past validUntil: EXPIRED.
   e. PASS_EXPIRING notification once, 24 h before validUntil.
   f. PENDING_PAYMENT passes older than 30 min: CANCELLED.
5. Worker health: the worker writes worker:heartbeat in Redis every 60 s (TTL 180). GET /health reports worker: ok or stale.
6. Tests: each expiry rule with frozen time; notify creates the row and enqueues email; email template renders in en and te without missing keys; unread count and read all.

Rules: all notification copy from the shared message files, no strings in code. No em dash or en dash.

Verify: book, activate and gift as seed users and see the rows and the logged emails; run the worker for an hour and record Upstash command usage in the daily log.
```

## Sync point (end of day, 15 min)

- Walk the full citizen story together on one laptop: search, book, pay, activate, gift, pass, free travel, notifications.
- List every bug found in the daily log with S1 to S3. S1 bugs are fixed first thing tomorrow.
- Merge order: Dev B `b/notifications-jobs`, then Dev A `a/gift-passes-free-updates`.

## Done when

- [ ] Gift, passes, free travel and updates screens work in both languages.
- [ ] Notifications are created by events and emailed in the user's language.
- [ ] Expiry jobs keep statuses correct with tests.
- [ ] E2E-5 and E2E-6 pass.

## Not today

PWA, staging deploy (Day 10), live tracking.

## Optional skill hints (Claude Code)

- Dev A: `/frontend-design` for pass cards, `/motion-system` for countdown behaviour.
- Dev B: `/scalability` for the batched expiry updates.
