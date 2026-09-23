# Day 07 · Citizen: pay, confirm, my tickets, and the ticket engine

**Phase:** Citizen MVP · **Goal:** a citizen pays with Razorpay test mode and sees their tickets; the API can activate, sign rotating QR codes, cancel and refund.

**Read first (both):** `docs/07-ticket-and-pass-rules.md` (sections 1 to 6), `docs/adr/003-qr-signing.md`, `docs/06-api-contract.md` (Tickets)

---

## Dev A (frontend)

**Read first:** `docs/11-screens.md` (`/book/[tripId]/review`, `/book/done`, `/tickets`), `docs/12-security.md` (Web security headers for the Razorpay script), `docs/14-testing-qa.md` (E2E-2)

```text
Day 07, Dev A (frontend). Goal: real payment from the review page, a calm confirmation, and the My tickets list.

1. usePayment hook in apps/web/lib/payments.ts: loads https://checkout.razorpay.com/v1/checkout.js once (script tag with async, error handling if blocked). pay({ bookingId }) calls POST /payments/orders, opens Razorpay checkout with key, order id, amount, name "AP TransitOS", description (route and date), prefill from the order response, theme color from the primary token value, and handlers:
   a. success: POST /payments/verify with an Idempotency-Key, then navigate to /book/done/[bookingId].
   b. dismiss (modal closed): stay on review, hold timer keeps running, show a neutral info line "Payment not completed".
   c. failure: show the error from i18n and allow retry.
   d. network lost after success: poll GET /bookings/:id every 3 s for up to 30 s to catch the webhook confirmation, then show confirmation or a clear "We are checking your payment" state with support text.
   The Pay button shows loading and cannot be pressed twice.
2. When NEXT_PUBLIC_PAYMENTS_FAKE=1 (dev and CI only), pay() skips the popup and calls POST /payments/test/complete. This is what Playwright uses.
3. /book/done/[bookingId]: success icon, "Ticket booked" heading, one line summary, ticket preview cards (seat, route, departure), activation hint "You can activate from {time}" computed by the API field activationOpensAt, primary View ticket, secondary Book return journey (goes to home with From and To swapped).
4. /tickets: tabs Upcoming and Past (tab in the URL). TicketCard summary: route, date and departure, seat, status badge (ticketStatus labels from docs/07 section 3), code. Sorted by departure. Empty state per docs/11. Skeletons. refetchOnWindowFocus.
5. Write Playwright E2E-2 (login, book, pay with the fake flag, see the ticket in /tickets).

Verify: real Razorpay test checkout with UPI success@razorpay and card 4111 1111 1111 1111 at 360 px. Close the popup mid way and resume. Telugu. UI quality checklist.
```

## Dev B (backend)

**Read first:** `docs/07-ticket-and-pass-rules.md` (all sections 1 to 6 and 10), `docs/adr/003-qr-signing.md`, `docs/06-api-contract.md` (Tickets, Payments test endpoint), `docs/12-security.md` (A02)

```text
Day 07, Dev B (backend). Goal: the ticket rules engine, QR signing and rotating codes, activation, cancellation with refunds, and the dev only fake payment endpoint.

1. apps/api/src/modules/tickets/ticket-rules.ts: pure functions activationWindow(trip, boardingStop, settings), computeValidUntil(...), canActivate, canCancel, canGift (full rule list from docs/07 section 7, used on Day 8), nextStatusOnJob(now) for the expiry job. Unit tests for every row of the section 2 table and the activation time edges (before open, at open, inside, at close, after close, delay extends the window).
2. packages/shared/src/qr.ts: step(nowMs, offsetMs, periodSec), formatCode(hmacBytes) to 8 base32 chars, buildQrContent(token, code), parseQrContent(text). HMAC is injected so the web uses Web Crypto and the API uses Node crypto. Unit tests with fixed vectors.
3. apps/api/src/modules/tickets/qr.service.ts: signToken(payload) with Ed25519 (Node crypto, QR_SIGNING_PRIVATE_KEY, keyId QR_SIGNING_KEY_ID), verifyToken(token), encrypt and decrypt rotSecret (AES 256 GCM), verifyCode(rotSecret, code, now) accepting steps current minus 1 to plus 1. Tests: tampered payload fails, wrong key id fails, stale code fails, next step passes.
4. Endpoints (holder only, ownership check on every one): GET /tickets?scope, GET /tickets/:id (with displayStatus, canActivate, canCancel, canGift, activationOpensAt), GET /tickets/:id/qr (token always, rotSecret only when ACTIVE, periodSec 30, serverTime), GET /tickets/:id/refund-quote, POST /tickets/:id/activate (Idempotency-Key, optimistic lock on version, TICKET_ALREADY_ACTIVE on a second call, sets activatedAt and validUntil, audit ticket.activate, publish ticket.activated), POST /tickets/:id/cancel (canCancel, refundQuote from fare.ts, provider createRefund for the amount, refunds row PENDING, ticket CANCELLED, audit ticket.cancel and refund.create). Webhook refund.processed: refund PROCESSED, ticket REFUNDED, payment REFUNDED or PARTIALLY_REFUNDED.
5. POST /payments/test/complete: only registered when APP_ENV is not production and PAYMENTS_FAKE=1. Simulates a captured payment for the caller's order and runs confirmBooking. Refuse to boot if PAYMENTS_FAKE=1 or OTP_DEV_ECHO=1 while APP_ENV=production.
6. Every status change publishes a domain event and (from Day 12) a socket ticket:status. For now publish the event only.
7. Integration tests: activate inside the window, twice (409), outside the window (ACTIVATION_WINDOW_CLOSED); QR endpoint hides rotSecret before activation; cancel refunds the right amount per tier; another user gets 404 on someone else's ticket (do not leak existence).

Rules: rules only in ticket-rules.ts and fare.ts, never in controllers. No em dash or en dash.

Verify: book and pay (fake flag), activate by temporarily moving the trip departure into the window in the DB, fetch the QR, compute the code with the shared helper in a small script and verify it with the service.
```

## Sync point (end of day, 15 min)

- Dev B shows a live QR payload and code rotation from a script. Dev A confirms `serverTime` handling for clock offset.
- Agree how the web picks a demo trip inside the activation window (seed a trip departing in 30 min each morning, or an admin nudge; Dev B decides and documents in the daily log).
- Merge order: Dev B `b/tickets-engine`, then Dev A `a/pay-and-tickets`.

## Done when

- [ ] Real Razorpay test payment works end to end from the review page.
- [ ] E2E-2 passes with the fake payment flag in CI.
- [ ] Ticket rules, QR signing, rotating codes, activation, cancel and refund are implemented with tests.
- [ ] No ticket exists without a verified payment.

## Not today

Ticket detail with the live QR (Day 8), gifting, passes.

## Optional skill hints (Claude Code)

- Dev A: `/design-taste-frontend` on the confirmation page (calm, no confetti).
- Dev B: `/security` on qr.service and the cancel path.
