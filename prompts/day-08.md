# Day 08 · Citizen: the live ticket, and gifting, passes, free travel APIs

**Phase:** Citizen MVP · **Goal:** the ticket screen is the best screen in the app (clear, live QR, hard to fake); the API supports gifting, passes and free travel eligibility.

**Read first (both):** `docs/07-ticket-and-pass-rules.md` (sections 3, 4, 7, 8, 9), `docs/06-api-contract.md` (Tickets, Passes and free travel)

---

## Dev A (frontend)

**Read first:** `docs/11-screens.md` (`/tickets/[id]`, `/tickets/[id]/cancel`), `docs/09-design-system.md` (TicketCard, Colour of the day, Motion), `docs/10-ux-writing.md` (ticketStatus labels, errors), plan sec 12 and 13

```text
Day 08, Dev A (frontend). Goal: ticket detail with a live rotating QR, activation, and cancellation with a refund quote.

1. TicketCard (full) in packages/ui per plan sec 12 and docs/09: route (From to To), date and departure, bus number (when assigned), seat, boarding point, destination, passenger name, fare, ticket code (copy button), StatusBadge. Layout like a real ticket: a top block with route and time, a perforation divider, a bottom block with the QR area. Radius xl, border, no heavy shadow.
2. LiveQr component: gets { token, rotSecret, periodSec, serverTime } from GET /tickets/:id/qr. Computes serverOffsetMs once from serverTime. Every period computes the code with the shared qr.ts helpers using Web Crypto HMAC, renders the QR as SVG with the qrcode library (error correction M, quiet zone 4, black on white always, even in dark mode), size at least 240 px. Below the QR: a live clock with seconds (tabular), the colour of the day as a band with its name in text, and a slow moving band animation (transform only). prefers-reduced-motion stops the band, keeps the clock and colour. A small "Raise screen brightness for faster scanning" hint.
3. /tickets/[id] states by status (docs/07 section 3):
   a. BOOKED: QR area shows a calm locked state "Activate to show your QR code", activation window text ("You can activate from 05:30 AM" or "Activate now"), primary Activate ticket, secondary Gift ticket and Cancel ticket in an overflow area (not three equal buttons).
   b. Activate flow: confirmation Sheet that states the consequence ("Valid until 01:10 PM. After activating you cannot cancel or gift this ticket."), Confirm activate button with loading. On success the QR appears with a short fade.
   c. ACTIVE and SCANNED: LiveQr, Track bus link.
   d. USED, EXPIRED, CANCELLED, REFUNDED: no QR, status explanation, relevant action (feedback link or refund status).
4. Offline: when the ticket is ACTIVE, save { ticket, token, rotSecret, serverOffset } in IndexedDB (small wrapper, try/catch everywhere), only until validUntil, deleted on logout. If the network is down the page renders from this cache and shows the OfflineBanner. The QR keeps rotating offline.
5. /tickets/[id]/cancel: GET refund-quote, show "You get ₹437 back" with the policy line, Cancel ticket (danger) opens a Dialog that names the consequence. After success show "Refund in progress" on the ticket.
6. Refetch ticket on focus and every 30 s while on the page (sockets replace this on Day 12).

Verify: activate a ticket in the window, watch the QR change every 30 s, screenshot it, and ask Dev B to validate the screenshot after 90 s (STALE_CODE once validate exists; today check with Dev B's script). Offline mode in DevTools keeps the QR working. Screen reader reads the ticket in a sensible order. UI quality checklist.
```

## Dev B (backend)

**Read first:** `docs/07-ticket-and-pass-rules.md` (sections 7, 8, 9), `docs/06-api-contract.md` (Tickets transfer, Passes and free travel, POST /bookings useFreeTravel), `docs/12-security.md` (Identity data)

```text
Day 08, Dev B (backend). Goal: gifting, passes with payments, free travel eligibility with a mock provider, and zero fare free travel tickets.

1. POST /tickets/:id/transfer (holder, Idempotency-Key): rules from ticket-rules canGift (docs/07 section 7, each failure mapped to its error code), recipient by phone or email (normalised), not self. One transaction: holderUserId, passenger name from the recipient profile (their masked phone or email when no name is set), transferCount + 1, new rotSecret, ticket_transfers row. After commit publish ticket.transferred. Audit ticket.transfer, and ticket.transfer_denied on rule failures. Tests for every rule row.
2. pass-rules.ts: activation within pass.activateWithinDays, validFrom and validUntil math (7 and 30 days), one active pass per kind per user, countdown parts helper in shared (days, hours, minutes, seconds) used by the web. Unit tests.
3. Passes endpoints: GET /pass-types (public), GET /passes, POST /passes (paid kinds: PENDING_PAYMENT; FREE_TRAVEL: READY only with a valid ELIGIBLE check, else ELIGIBILITY_REQUIRED), POST /passes/:id/activate, GET /passes/:id/qr (same shape as tickets, "t": "P"). Extend POST /payments/orders and verify and the webhook to support { passId } (confirm sets the pass READY). Passes are never giftable.
4. Eligibility: EligibilityProvider interface, MockEligibilityProvider (ELIGIBLE when consent is true, category is WOMAN, GIRL or TRANSGENDER and apDomicile is true; otherwise NOT_ELIGIBLE with a reasonCode). POST /eligibility/stree-shakti stores only scheme, result, reasonCode, provider, providerRef, consent version, checkedAt, expiresAt (365 days). No ID number accepted: the zod schema must reject unknown keys. GET /eligibility. Audit eligibility.check.
5. POST /bookings with useFreeTravel: only one passenger, caller has an ACTIVE FREE_TRAVEL pass, trip bus type freeTravelEligible, else PASS_NOT_ELIGIBLE. Creates the booking CONFIRMED and one FREE_TRAVEL ticket (farePaise 0, giftable false) without any payment, holds and releases like normal.
6. Integration tests: gift happy path and each denial; buy weekly pass with the fake payment endpoint, activate, second active weekly pass denied; free travel eligibility then free pass then zero fare booking on an Express; the same on a Super Luxury is denied.

Rules: pass and ticket rules only in the rule files. No em dash or en dash.

Verify: run the whole free travel path with curl as citizen@aptransit.test. Check the eligibility_checks row has no personal identifiers.
```

## Sync point (end of day, 15 min)

- Dev A shows the live ticket. Both check the QR scans quickly from a second phone camera app (content should read `APT1....~XXXXXXXX`).
- Dev B shows the pass countdown helper output. Dev A will use it tomorrow.
- Merge order: Dev B `b/gift-passes-eligibility`, then Dev A `a/ticket-detail`.

## Done when

- [ ] Ticket detail works in every status, QR rotates every 30 s, works offline once active.
- [ ] Activation and cancellation flows confirm consequences and handle errors.
- [ ] Gifting, passes and free travel APIs match docs/07 with tests for every rule.
- [ ] No identity numbers are accepted or stored.

## Not today

Gift and pass screens (Day 9), notifications.

## Optional skill hints (Claude Code)

- Dev A: `/motion-system` for the QR band and fade timing, `/frontend-design` for the ticket layout.
- Dev B: `/security` for the eligibility data handling.
