# 09 · Design system

**Status: LOCKED.** Source: plan sec 2, 24, 29, 47, 95. Owner: Dev A. Built on Day 1 to 3, before any page.

## Direction: calm civic

A public service used by millions, many on low end Android phones in bright sunlight. It must feel trustworthy, quiet and fast.

- White space and clear hierarchy over decoration. One accent colour (transit blue).
- Content first: the departure time, the seat, the status. Chrome stays out of the way.
- Flat surfaces, 1 px borders, soft shadows only for floating layers.
- No gradients, glass effects, emoji, stock photos or illustrations. The only animated gradient is the live ticket band (anti screenshot).
- One primary button per view. Everything else is secondary or a text link.

## Tokens

Source of truth: `packages/ui/src/tokens.css`. Tailwind 4 reads them through `@theme inline`. Components use token classes only (`bg-surface`, `text-muted`, `border-default`), never raw hex. All text pairs below were checked for WCAG 2.2 AA (4.5:1 text, 3:1 UI boundaries).

### Colour: light

| Token | Hex | Use | Contrast |
| --- | --- | --- | --- |
| `--bg` | #FFFFFF | Page | |
| `--surface` | #F6F7F9 | Cards on grey areas, table header, input fill (optional) | |
| `--surface-raised` | #FFFFFF | Cards, sheets, popovers | |
| `--border` | #E4E7EC | Dividers, card borders (decorative) | |
| `--border-strong` | #7C8799 | Input and checkbox borders (must be seen) | 3.63 on bg |
| `--text` | #0E1621 | Primary text | 18.2 on bg |
| `--text-muted` | #475467 | Secondary text, labels | 7.7 on bg |
| `--text-subtle` | #667085 | Hints, timestamps (never for key info) | 5.0 on bg |
| `--primary` | #1D4ED8 | Primary buttons, links, focus ring, current step | 6.7 on bg, white text 6.7 |
| `--primary-hover` | #1E40AF | Hover and pressed | 8.7 |
| `--primary-soft` | #EEF3FF | Selected rows, chips | |
| `--on-primary` | #FFFFFF | Text on primary | |

### Colour: dark

Applied with `[data-theme="dark"]` and `prefers-color-scheme: dark` unless the user picked light.

| Token | Hex | Contrast |
| --- | --- | --- |
| `--bg` | #0B1118 | |
| `--surface` | #121A24 | |
| `--surface-raised` | #1A2431 | |
| `--border` | #2A3645 | |
| `--border-strong` | #6B7A90 | 4.0 on surface |
| `--text` | #E9EEF4 | 16.3 on bg |
| `--text-muted` | #A9B4C2 | 9.0 on bg |
| `--text-subtle` | #8A96A6 | 6.3 on bg |
| `--primary` | #7AA2FF | 7.6 on bg |
| `--on-primary` | #0B1118 | 7.6 on primary |

### Status tones (one map for the whole product)

The plan used different colours for the same idea in sec 24 and sec 29. This is the single resolved map. Colour is never the only signal: every status shows its label and icon.

| Tone | Light text / soft bg | Dark text / soft bg | Used for |
| --- | --- | --- | --- |
| `success` | #15803D / #EEF8F2 (4.6) | #4ADE80 / #12301F (8.2) | Completed, Checked, Valid, Resolved |
| `info` | #1D4ED8 / #EEF3FF (6.0) | #8AB0FF / #15244A (7.0) | Running, Current, Active |
| `warning` | #B45309 / #FEF6EA (4.7) | #FBBF24 / #33260A (8.8) | Delayed, Expiring soon |
| `danger` | #B91C1C / #FEF0F0 (5.8) | #FB8A8A / #3A1515 (7.0) | Incident, Breakdown, Cancelled, Invalid |
| `maintenance` | #6D28D9 / #F4F0FE (6.3) | #C4B5FD / #271D45 (8.4) | Maintenance |
| `neutral` | #475467 / #F2F4F7 (7.0) | #A9B4C2 / #1E2733 (7.2) | Upcoming, Not assigned, Not active, Used, Expired |

Solid variants (scanner result, map markers): white text on the light text colour of the tone (all at least 5.0:1).

### Status labels (plan sec 95, same words everywhere)

Defined in `packages/shared/src/status.ts` as `{ key, tone, icon, i18nKey }`.

| Key | English | Tone | lucide icon |
| --- | --- | --- | --- |
| UPCOMING | Upcoming | neutral | `clock` |
| RUNNING | Running | info | `bus` |
| DELAYED | Delayed | warning | `timer` |
| COMPLETED | Completed | success | `circle-check` |
| CANCELLED | Cancelled | danger | `circle-x` |
| INCIDENT | Incident | danger | `triangle-alert` |
| BREAKDOWN | Breakdown | danger | `wrench` |
| MAINTENANCE | Maintenance | maintenance | `settings` |
| NOT_ASSIGNED | Not assigned | neutral | `circle-dashed` |

Trip display status is derived in one function `deriveTripDisplayStatus(trip)`: CANCELLED wins, then INCIDENT when `hasOpenIncident`, then COMPLETED, then DELAYED when `delayMinutes >= 5`, then RUNNING, else UPCOMING.

### Route progress colours (plan sec 23, 24)

| Segment state | Visual |
| --- | --- |
| Done | success line, filled dot, stop name in muted text |
| Current | info line, pulsing bus marker (static when reduced motion), bold stop name |
| Upcoming | neutral dashed line, hollow dot |
| Delayed | warning chip next to ETA: "Delayed 12 min" |
| Incident | danger chip with the incident type |

### Colour of the day (ticket anti fraud)

| Day | Name | Hex |
| --- | --- | --- |
| Monday | Blue | #1D4ED8 |
| Tuesday | Green | #15803D |
| Wednesday | Violet | #6D28D9 |
| Thursday | Amber | #B45309 |
| Friday | Teal | #0E7490 |
| Saturday | Pink | #BE185D |
| Sunday | Red | #B91C1C |

The ticket shows the colour as a band **and** its name in text ("Colour of the day: Teal"), so it works for colour blind conductors.

## Typography

- Fonts: **Inter** for Latin, **Noto Sans Telugu** for Telugu. Stack: `Inter, "Noto Sans Telugu", system-ui, sans-serif`. Loaded with `next/font`, `display: swap`.
- Numbers use tabular figures (`font-variant-numeric: tabular-nums`) in times, fares, countdowns, tables and KPIs.
- Telugu glyphs are taller: when `lang="te"`, line heights go up one step (`--leading-te` multiplier 1.15).

| Token | Size / line height | Weight | Use |
| --- | --- | --- | --- |
| `display` | 36 / 44 | 600 | Scanner result, KPI numbers |
| `h1` | 28 / 36 | 600 | Page title (one per page) |
| `h2` | 22 / 30 | 600 | Section title |
| `h3` | 18 / 26 | 600 | Card title |
| `body-lg` | 17 / 26 | 400 | Driver and conductor body |
| `body` | 16 / 24 | 400 | Default body (never smaller on inputs, stops iOS zoom) |
| `small` | 14 / 20 | 400 | Secondary info |
| `caption` | 12 / 16 | 500 | Table meta, timestamps (never for key info) |

## Space, radius, elevation

| Scale | Values |
| --- | --- |
| Space (4 px grid) | 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 |
| Page gutter | 16 mobile, 24 tablet, 32 desktop |
| Radius | `sm` 6 (chips, badges), `md` 10 (inputs, buttons), `lg` 14 (cards), `xl` 20 (sheets, ticket), `full` (avatars, dots) |
| Shadow | `sm` for sticky bars, `md` for popovers and sheets, `lg` for dialogs. Cards use a border, not a shadow |
| Z index | base 0, sticky 10, header 20, overlay 40, sheet 50, dialog 60, toast 70 |

## Breakpoints and layout

| Name | Min width | Layout |
| --- | --- | --- |
| base | 0 (design at 360) | Single column, bottom nav (citizen) |
| `sm` | 640 | Single column, wider cards |
| `md` | 768 | Citizen: two columns where useful (results + filters). Ops and gov: collapsible sidebar |
| `lg` | 1024 | Ops and gov: fixed sidebar 248 px, content max 1280 |
| `xl` | 1280 | Gov: map plus side panel |

Surfaces:

| Surface | Shell |
| --- | --- |
| Citizen | Top bar (logo, language switch, notifications bell, account). Bottom nav on mobile: Home, Tickets, Track, Passes, Account. Content max width 560 on mobile, 1120 on desktop |
| Driver | No nav. Full screen cards, one primary action at the bottom, buttons 56 px tall, body-lg text, screen kept awake while a trip runs |
| Conductor | Scanner is the home screen. Big "Scan ticket" button 64 px. Trip counts always visible |
| Ops, Gov, Admin | Left sidebar (icons + labels), top bar with depot or district switcher, content area with page header (title, filters, primary action) |

## Components (`packages/ui`)

Each component: all variants, states (default, hover, focus visible, active, disabled, loading), keyboard support, dark mode, and a story on the `/design` page.

| Component | Variants and notes |
| --- | --- |
| Button | primary, secondary, ghost, danger, link. Sizes md 44, lg 52, xl 56 (driver). `loading` keeps width and shows a spinner. Disabled buttons always have a visible reason nearby |
| IconButton | Needs `aria-label`. 44 px hit area even if the icon is 20 |
| Input, Textarea, Select, Combobox | Label always visible above (never placeholder as label), hint, error text with icon, `aria-describedby` wiring |
| PlaceCombobox | From and To search with Telugu and English matching, recent places, swap button |
| DatePicker | Today, Tomorrow chips plus calendar. Min today, max today + 30 |
| OtpInput | 6 boxes, paste support, auto submit, `autocomplete="one-time-code"` |
| Card | Plain, interactive (whole card clickable with one link), selected |
| StatusBadge | Reads `status.ts`. Icon + label. Sizes sm, md |
| TripCard | Departure, service type, arrival, duration, seats left, fare, status. Tap target is the whole card |
| SeatMap | Grid from `seatLayout`. States free, selected, taken, held, blocked. Each seat is a button with `aria-label="Seat 18, available"`. Legend with shapes, not only colour |
| Stepper | Booking steps: Seat, Details, Pay. Current step announced to screen readers |
| RouteProgress | Vertical stop list with done, current, upcoming, delay chips (plan sec 23) |
| TicketCard | Full ticket (plan sec 12): route, bus, seat, boarding, departure, status, QR area, colour band |
| Countdown | Days, hours, minutes (seconds under 24 h). `aria-live="off"`, with a visually hidden summary that updates each minute |
| KpiTile | Label, value (display size, tabular), delta, optional sparkline |
| DataTable | Sticky header, sortable columns, row actions menu, empty and loading rows, 44 px rows, pagination |
| MapView | MapLibre wrapper, bus markers by status tone with icon, clustering in gov view |
| Sheet (vaul) | Mobile bottom sheet for short tasks (report issue, filters) |
| Dialog | Only for confirmations. Title, one sentence, two buttons (primary action names the action: "Cancel ticket", not "OK") |
| Toast (sonner) | Success and info only. Errors that need action stay on the page |
| Skeleton | Matches the final layout shape, no spinners for page loads |
| EmptyState | Icon, one line title, one line hint, one action |
| ErrorState | Plain message from the error code, Retry button, request id in small text |
| LanguageSwitch | "English" and "తెలుగు", each written in its own script |
| OfflineBanner | Shows when `navigator.onLine` is false |

## Motion

| Token | Value | Use |
| --- | --- | --- |
| `--dur-fast` | 120 ms | Hover, press |
| `--dur-base` | 200 ms | Sheets, dropdowns, tabs |
| `--dur-slow` | 320 ms | Page level transitions, scanner result |
| `--ease-out` | cubic-bezier(0.2, 0, 0, 1) | Enter |
| `--ease-in` | cubic-bezier(0.4, 0, 1, 1) | Exit |

- Motion explains change, never decorates. No parallax, no scroll triggered effects, no bouncing.
- `prefers-reduced-motion: reduce`: all transitions become opacity only, pulsing and the ticket band stop.
- Animate only `transform` and `opacity`.

## Formats (via `packages/shared/src/format.ts`, locale aware)

| Thing | English example | Rule |
| --- | --- | --- |
| Time | 06:30 AM | `Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })` |
| Date | Tue, 23 Sep | Weekday short, day, month short |
| Money | ₹485 | `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })` when whole rupees, Indian grouping (₹1,23,456) |
| Duration | 5 h 40 min | Never "340 minutes" |
| Distance | 412 km | Whole km |
| Countdown | 5 days 08 hours 21 minutes | Plan sec 16 |
| Bus number | AP 39 Z 1234 | Spaces kept |
| Ticket code | APT-7K3M-Q9XD | Monospace optional, always copyable |
| Phone | +91 98xxxxx210 | Masked everywhere except the owner's own profile |

## Accessibility (plan sec 47)

- WCAG 2.2 AA minimum. Checked by axe in Playwright on every main page (Day 18) and by hand with a screen reader (TalkBack or NVDA) on the core journey.
- Focus ring: 2 px `--primary` outline, 2 px offset, on every interactive element. Never removed.
- Touch targets: 44 px minimum, 56 px in driver and conductor apps.
- Every page has one `h1`, landmarks (`header`, `nav`, `main`), a skip link, and `lang` set to `en` or `te`.
- Forms: labels, errors linked with `aria-describedby`, error summary at the top on submit, focus moves to the first error.
- Live regions: booking hold timer announces at 5, 2 and 1 minutes left. Scanner result is announced (`role="status"`).
- Colour is never the only signal (sec 47): status always has a label and icon, seat states have shapes, map markers have icons.
- Text resizes to 200 percent without loss. No text in images.

## Do not

- No hardcoded colours, sizes or strings.
- No ALL CAPS body text. Allowed only for the scanner result word (VALID, INVALID) and ticket codes.
- No placeholder text as the only label.
- No more than one primary button in view.
- No modal on top of a modal.
- No disabled button without a visible reason.
- No toast for an error the user must act on.
- No infinite spinners: after 10 s show the error state with Retry.
- No layout shift: reserve space for images, maps, QR and async numbers.
- No ads or promotions near booking, tickets, scanning, tracking or safety info (plan sec 45).
- No em dash or en dash in any copy.
