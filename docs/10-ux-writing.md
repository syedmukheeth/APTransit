# 10 · UX writing

**Status: LOCKED.** Source: plan sec 2, 43, 47, 48. Owner: Dev A. Applies to every visible word: UI, emails, notifications, errors, seed data.

## Voice

Clear, calm, helpful. Like a good bus stand announcer: short, exact, never rude, never cute.

## Rules

1. **Short.** Most labels are 1 to 3 words. Most sentences are under 15 words.
2. **Sentence case** everywhere: "Search buses", not "Search Buses".
3. **Buttons are verb + object**: "Activate ticket", "Pay ₹485", "Start trip". Never "OK", "Submit", "Yes".
4. **Say "you".** Active voice. "You can cancel until 5:30 AM", not "Cancellation is permitted until".
5. **Errors say what happened and what to do.** "Seat 18 was just booked by someone else. Pick another seat." No blame, no codes, no "Oops".
6. **Confirmations name the consequence.** "Cancel this ticket? You get ₹437 back in 5 to 7 working days."
7. **Digits for numbers.** "3 seats left", "Delayed 12 min".
8. **No dashes.** Never use an em dash or en dash. Ranges use "to" ("06:30 to 12:10"). Pauses use a comma, colon or a new sentence.
9. **No exclamation marks.** Not even on success. "Ticket booked" is enough.
10. **No jargon.** "Boarding point", not "pickup node". "Bus number", not "vehicle registration".
11. **No ALL CAPS** except scanner results (VALID, INVALID) and codes.
12. **Same word for the same thing** everywhere. Use the glossary below.
13. **Empty states help.** "No tickets yet. Search buses to book your first trip." plus a button.
14. **Never invent facts.** Fares, times, status and eligibility always come from the API.

## i18n keys

- File: `apps/web/messages/en.json` and `te.json`. Same keys in both, checked in CI (`pnpm i18n:check`).
- Key pattern: `<area>.<screen>.<element>`: `booking.seat.title`, `ticket.actions.activate`.
- Shared keys: `status.<KEY>`, `errors.<CODE>`, `notifications.<TYPE>.title` and `.body`, `serviceType.<TYPE>`, `common.*`.
- Plurals and variables with ICU: `"seatsLeft": "{count, plural, one {# seat left} other {# seats left}}"`.
- Never build sentences by joining fragments. Telugu word order is different.
- Exception: notification and email strings are needed by both the web inbox and the API (emails). They live in `packages/shared/src/messages/en.json` and `te.json` under `notifications.*` and `email.*`, and the web merges them into its next-intl messages at load time. Same key rules apply.

## Glossary (fixed terms)

Telugu must be reviewed by a native speaker before Day 20 (tracked in [18-open-decisions.md](18-open-decisions.md)).

| Key | English | తెలుగు |
| --- | --- | --- |
| common.appName | AP TransitOS | AP TransitOS |
| home.question | Where do you want to go? | మీరు ఎక్కడికి వెళ్లాలనుకుంటున్నారు? |
| common.from | From | నుండి |
| common.to | To | వరకు |
| common.date | Date | తేదీ |
| search.cta | Search buses | బస్సులు వెతకండి |
| nav.track | Track bus | బస్సును ట్రాక్ చేయండి |
| nav.tickets | My tickets | నా టికెట్లు |
| nav.passes | My passes | నా పాస్‌లు |
| nav.timetable | Timetable | టైమ్‌టేబుల్ |
| nav.updates | Updates | అప్‌డేట్‌లు |
| common.busStand | Bus stand | బస్ స్టాండ్ |
| common.departure | Departure | బయలుదేరు సమయం |
| common.arrival | Arrival | చేరుకునే సమయం |
| common.seat | Seat | సీటు |
| common.fare | Fare | ఛార్జీ |
| common.boardingPoint | Boarding point | ఎక్కే స్థలం |
| common.destination | Destination | గమ్యం |
| common.nextStop | Next stop | తదుపరి స్టాప్ |
| ticket.actions.book | Book ticket | టికెట్ బుక్ చేయండి |
| ticket.actions.activate | Activate ticket | టికెట్ యాక్టివేట్ చేయండి |
| ticket.actions.gift | Gift ticket | టికెట్ బహుమతిగా ఇవ్వండి |
| ticket.actions.cancel | Cancel ticket | టికెట్ రద్దు చేయండి |
| pass.weekly | Weekly pass | వారపు పాస్ |
| pass.monthly | Monthly pass | నెలవారీ పాస్ |
| pass.timeLeft | Time left | మిగిలిన సమయం |
| freeTravel.title | Free travel | ఉచిత ప్రయాణం |
| payment.pay | Pay | చెల్లించండి |
| refund.title | Refund | రీఫండ్ |
| feedback.title | Feedback | అభిప్రాయం |
| driver.startTrip | Start trip | ప్రయాణం ప్రారంభించండి |
| driver.endTrip | End trip | ప్రయాణం ముగించండి |
| driver.reportIssue | Report issue | సమస్యను తెలియజేయండి |
| conductor.scan | Scan ticket | టికెట్ స్కాన్ చేయండి |
| scan.valid | VALID | చెల్లుతుంది |
| scan.invalid | INVALID | చెల్లదు |
| auth.login | Log in | లాగిన్ |
| auth.enterOtp | Enter the 6 digit code | 6 అంకెల కోడ్‌ను నమోదు చేయండి |
| common.language | Language | భాష |

### Status labels

| Key | English | తెలుగు |
| --- | --- | --- |
| status.UPCOMING | Upcoming | రాబోయేది |
| status.RUNNING | Running | నడుస్తోంది |
| status.DELAYED | Delayed | ఆలస్యం |
| status.COMPLETED | Completed | పూర్తయింది |
| status.CANCELLED | Cancelled | రద్దయింది |
| status.INCIDENT | Incident | సంఘటన |
| status.BREAKDOWN | Breakdown | బస్సు చెడిపోయింది |
| status.MAINTENANCE | Maintenance | మరమ్మతులో ఉంది |
| status.NOT_ASSIGNED | Not assigned | కేటాయించలేదు |
| ticketStatus.BOOKED | Not active | యాక్టివ్ కాదు |
| ticketStatus.ACTIVE | Active | యాక్టివ్ |
| ticketStatus.SCANNED | Checked | తనిఖీ అయింది |
| ticketStatus.USED | Used | ఉపయోగించారు |
| ticketStatus.EXPIRED | Expired | గడువు ముగిసింది |
| ticketStatus.REFUNDED | Refunded | రీఫండ్ అయింది |

### Service types (brand names, transliterated)

| Key | English | తెలుగు |
| --- | --- | --- |
| serviceType.PALLEVELUGU | Pallevelugu | పల్లెవెలుగు |
| serviceType.ULTRA_PALLEVELUGU | Ultra Pallevelugu | అల్ట్రా పల్లెవెలుగు |
| serviceType.CITY_ORDINARY | City Ordinary | సిటీ ఆర్డినరీ |
| serviceType.METRO_EXPRESS | Metro Express | మెట్రో ఎక్స్‌ప్రెస్ |
| serviceType.EXPRESS | Express | ఎక్స్‌ప్రెస్ |
| serviceType.ULTRA_DELUXE | Ultra Deluxe | అల్ట్రా డీలక్స్ |
| serviceType.SUPER_LUXURY | Super Luxury | సూపర్ లగ్జరీ |
| serviceType.INDRA_AC | Indra AC | ఇంద్ర ఏసీ |
| serviceType.AMARAVATI_AC | Amaravati AC | అమరావతి ఏసీ |
| serviceType.GARUDA_AC | Garuda AC | గరుడ ఏసీ |

## Notifications (plan sec 43)

Icon + short title + one line body. Title under 30 characters.

| Type | Title (English) | Body (English) |
| --- | --- | --- |
| BOOKING_CONFIRMED | Ticket booked | {route}, {date} at {time}. Seat {seat}. |
| TICKET_ACTIVATED | Ticket activated | Show the QR code to the conductor. |
| TICKET_RECEIVED | You received a ticket | {sender} sent you a ticket for {route}. |
| TRIP_DEPARTED | Bus departed | {route} left {stop} at {time}. |
| TRIP_DELAYED | Bus delayed | Running {minutes} min late. New arrival {time}. |
| BUS_NEAR_STOP | Bus is near your stop | Arriving at {stop} in about {minutes} min. |
| TRIP_CANCELLED | Trip cancelled | {route} on {date} is cancelled. Full refund started. |
| REPLACEMENT_BUS | Bus changed | Your trip now runs on {busNo}. Same time, same seat. |
| ROUTE_UPDATE | Route update | {message} |
| PASS_EXPIRING | Pass expiring soon | Your {passName} ends {when}. |
| COMPLAINT_UPDATE | Complaint {code} updated | Status: {status}. |

## Error messages (examples, English)

| Code | Message |
| --- | --- |
| SEAT_TAKEN | Seat {seat} was just booked by someone else. Pick another seat. |
| HOLD_EXPIRED | Your seat hold ended. Pick your seat again to continue. |
| OTP_INVALID | That code is not right. Check the latest code and try again. |
| OTP_EXPIRED | That code has expired. Send a new code. |
| RATE_LIMITED | Too many tries. Wait a minute and try again. |
| ACTIVATION_WINDOW_CLOSED | You can activate this ticket from {time}. |
| TICKET_NOT_GIFTABLE | This ticket cannot be gifted. Free, active or used tickets stay with you. |
| RECIPIENT_NOT_FOUND | No account uses that phone or email. Ask them to sign up first. |
| PAYMENT_SIGNATURE_INVALID | We could not confirm your payment. You have not been charged twice. Try again. |
| NETWORK | You are offline. Your tickets still open. We will retry when you are back online. |
| INTERNAL | Something went wrong on our side. Try again in a moment. |

## Scanner reasons (conductor, large text)

| Reason | English | Helper line |
| --- | --- | --- |
| OK | VALID | Passenger verified |
| NOT_ACTIVATED | INVALID: not activated | Ask the passenger to activate the ticket |
| ALREADY_SCANNED | INVALID: already checked | Checked at {time} |
| EXPIRED | INVALID: expired | Valid until {time} |
| CANCELLED | INVALID: cancelled | This ticket was cancelled |
| WRONG_TRIP | INVALID: wrong bus | Ticket is for {route} at {time} |
| WRONG_DATE | INVALID: wrong date | Ticket is for {date} |
| STALE_CODE | INVALID: old QR code | Ask the passenger to open the live ticket, not a screenshot |
| BAD_SIGNATURE, NOT_FOUND | INVALID: not recognised | This is not an AP TransitOS ticket |
| SERVICE_NOT_ELIGIBLE | INVALID: not valid on this bus | Pass works on {services} |
