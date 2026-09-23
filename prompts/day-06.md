# Day 06 · Citizen: booking flow and payments

**Phase:** Citizen MVP · **Goal:** a logged in citizen can pick points and seats, enter passengers and reach the review screen with a live hold; the API can take a Razorpay test payment and create tickets only after verifying it.

**Read first (both):** `docs/03-architecture.md` (Book and pay flow), `docs/06-api-contract.md` (Payments), `docs/07-ticket-and-pass-rules.md` (section 2, first row), `docs/12-security.md` (Payments)

---

## Dev A (frontend)

**Read first:** `docs/11-screens.md` (`/book/*`), `docs/09-design-system.md` (SeatMap, Stepper, Accessibility), `docs/10-ux-writing.md` (errors SEAT_TAKEN, HOLD_EXPIRED), plan sec 11

```text
Day 06, Dev A (frontend). Goal: the three step booking flow up to the Pay button, accessible and hard to break.

1. Stepper in packages/ui: steps Seat, Details, Pay. Current step has aria-current="step" and is announced.
2. SeatMap in packages/ui: renders from the SeatLayout schema. Each seat is a button with aria-label "Seat 18, available" (or taken, held, selected, blocked) and aria-pressed when selected. States differ by shape and icon as well as colour (taken seats show a cross, selected show a check). Legend under the map. Arrow keys move between seats, Enter or Space toggles. Driver cabin and aisle drawn. Handles 3+2 (60 seats) and 2+2 layouts at 360 px without horizontal scroll. Max selectable = booking.maxPassengers (comes from the API or a shared constant, not hardcoded in the component).
3. /book/[tripId] step 1: boarding point and destination selects (prefilled from ?from and ?to, only valid boarding before dropping combinations), SeatMap from GET /trips/:id/seats, polling every 15 s so newly taken seats appear. Sticky bottom bar: selected seats, total from GET /trips/:id/fare x seats, Continue (disabled with a reason when no seat is selected).
4. Step 2 /book/[tripId]/details: one card per seat with name, age, gender (react-hook-form + zod schema from shared). "Use my details" fills the first passenger from /me. Continue calls POST /bookings with an Idempotency-Key generated once per attempt. On SEAT_TAKEN: go back to step 1, mark that seat taken, show the error message from i18n. Keep entered names so the user does not type them again.
5. Step 3 /book/[tripId]/review: hold timer from holdExpiresAt (mm:ss, tabular, warning tone under 2 minutes, screen reader announcements at 5, 2 and 1 minute via a polite live region). Trip summary, passengers, fare breakdown, refund tiers from the fare endpoint written as plain sentences from i18n with variables, and a primary "Pay ₹X" button that is wired tomorrow (today it shows a toast "Payment comes on Day 7" only in development). On hold expiry: show HOLD_EXPIRED inline with a "Pick seats again" action. A Cancel link calls DELETE /bookings/:id and returns to bus details.
6. Browser back from step 3 keeps the booking and returns to step 2 with data intact. Refresh on step 3 reloads the booking from GET /bookings/:id.
7. Guests hitting /book are redirected to /login?next= (middleware from Day 4).

Verify: keyboard only booking of 2 seats on an Express, screen reader reads seat states, hold timer announces, SEAT_TAKEN path works (take the seat with curl in parallel), Telugu at 360 px. UI quality checklist.
```

## Dev B (backend)

**Read first:** `docs/06-api-contract.md` (Payments, Tickets rows for context), `docs/07-ticket-and-pass-rules.md` (sections 1, 2), `docs/12-security.md` (A08, Payments), `docs/05-data-model.md` (payments, tickets)

```text
Day 06, Dev B (backend). Goal: Razorpay test mode payments with server verification, webhook, idempotency, and ticket creation only after a verified payment.

1. PaymentProvider interface in payments/: createOrder({ amountPaise, receipt, notes }), fetchPayment(id), verifyCheckoutSignature({ orderId, paymentId, signature }), verifyWebhookSignature(rawBody, header), createRefund({ paymentId, amountPaise, notes }). RazorpayProvider implements it with the razorpay SDK and Node crypto (HMAC SHA 256, timingSafeEqual).
2. POST /payments/orders (user): accepts { bookingId } (passId comes on Day 8). Booking must be the caller's, PENDING_PAYMENT, hold not expired, else BOOKING_NOT_PAYABLE or HOLD_EXPIRED. Reuse an existing CREATED payment for the same booking. Amount always from booking.totalPaise. Save payments row CREATED with providerOrderId. Return { orderId, amountPaise, currency, keyId, prefill }.
3. POST /payments/verify (user, Idempotency-Key supported): verify the checkout signature, fetch the payment from Razorpay and check status captured (or authorized, then capture) and amount equals the booking total and order id matches, else PAYMENT_SIGNATURE_INVALID or PAYMENT_AMOUNT_MISMATCH. Then call a single confirmBooking(paymentId) function that is idempotent: in one DB transaction set payment CAPTURED, booking CONFIRMED, create one ticket per passenger (type SINGLE, status BOOKED, code APT-XXXX-XXXX, holder and original user = booker, farePaise per passenger, giftable true, expiresAt = activation close time per docs/07, qrSecret = random 32 bytes encrypted with AES 256 GCM using QR_SECRET_KEY). After commit: delete the Redis holds, publish booking.confirmed on DomainEventsService (create common/events now), write audit payment.verify. A second call returns the same ticket ids.
4. POST /payments/webhook (public, raw body, rawBody: true in Nest bootstrap): verify X-Razorpay-Signature with RAZORPAY_WEBHOOK_SECRET. payment.captured calls the same confirmBooking. payment.failed marks the payment FAILED (booking stays until its hold expires). refund.processed is handled on Day 7. Always 200 fast after verifying; ignore unknown events. Audit payment.webhook.
5. Edge cases: payment captured after the hold expired and seats were taken by someone else. Then do not create tickets; mark the booking EXPIRED and immediately refund the full amount through the provider (refunds row), and write an audit row. Unit test this path with a fake provider.
6. Tests with a FakePaymentProvider (in memory): verify happy path creates tickets; wrong signature; amount mismatch; double verify returns the same result; webhook then verify (either order) creates tickets once; webhook with a bad signature gets 400; late payment after hold expiry triggers a refund.
7. In the Razorpay dashboard (test mode): enable auto capture. Webhook URL is configured on Day 10 on staging. Locally, verify is the main path.

Rules: amounts only from the server, never log signatures or card or VPA data, redact raw payloads before storing. No em dash or en dash.

Verify: with the Razorpay test checkout in a scratch HTML page or Dev A's review page, pay with UPI success@razorpay, call verify, see tickets in the DB.
```

## Sync point (end of day, 15 min)

- Dev A shows the review page. Dev B confirms the exact response of `/payments/orders` so Dev A can open checkout tomorrow.
- Walk through the "payment succeeded but tab closed" case together: the webhook confirms, the web recovers by polling `GET /bookings/:id`.
- Merge order: Dev B `b/payments`, then Dev A `a/booking-flow`.

## Done when

- [ ] Booking steps 1 to 3 work with holds, SEAT_TAKEN and HOLD_EXPIRED paths.
- [ ] SeatMap is fully keyboard and screen reader usable.
- [ ] Tickets are created only inside `confirmBooking` after verification, idempotently, with tests.
- [ ] Late payment after hold expiry is refunded automatically.

## Not today

Opening Razorpay checkout from the web (Day 7), ticket screens, activation.

## Optional skill hints (Claude Code)

- Dev A: `/frontend-design` for SeatMap visuals.
- Dev B: `/security` on the payments module, focusing on A08 integrity.
