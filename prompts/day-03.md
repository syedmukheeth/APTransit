# Day 03 · Foundation: app shells, i18n and auth

**Phase:** Foundation · **Goal:** every surface has its shell in English and Telugu, the `/design` gallery exists, and users can log in with OTP and get role based access.

**Read first (both):** `docs/08-roles-permissions.md`, `docs/10-ux-writing.md`, `docs/12-security.md` (A01, A07, Rate limits)

---

## Dev A (frontend)

**Read first:** `docs/adr/005-i18n.md`, `docs/10-ux-writing.md` (all), `docs/11-screens.md` (Shared, and each surface header), `docs/09-design-system.md` (Breakpoints and layout, LanguageSwitch)

```text
Day 03, Dev A (frontend). Goal: i18n wired, layout shells for all six surfaces, the /design gallery, 404 and error pages.

1. next-intl with a cookie based locale (cookie "locale", values en or te, default from Accept-Language then en), no URL prefix. apps/web/i18n/request.ts loads apps/web/messages/{locale}.json and merges packages/shared/src/messages/{locale}.json (create that folder with notifications.* and email.* keys from docs/10). Set html lang and a data-locale attribute; when te, apply the taller Telugu line height token.
2. Messages: add every glossary key, status key, ticketStatus key, serviceType key, notification key and error message from docs/10 to en.json and te.json. Use ICU for plurals.
3. scripts i18n:check (root script, runs in CI): both files have identical key sets (web and shared), no empty values, no em dash or en dash, ICU parses. Fail with a clear list.
4. LanguageSwitch component: shows "English" and "తెలుగు", each in its own script, sets the cookie and refreshes. Later (Day 4) it also calls PATCH /me when logged in.
5. Theme: data-theme on html from a "theme" cookie (light, dark, system), no flash on load (set it in the root layout on the server).
6. Shells in apps/web/app (route groups per docs/03):
   a. (citizen): top bar (wordmark "AP TransitOS", LanguageSwitch, bell placeholder, account button), bottom nav on mobile (Home, Tickets, Track, Passes, Account) with active state and aria-current, top nav on md and up. Content width per docs/09.
   b. driver: no nav, full screen, large type, a slim top bar with name and a menu for logout.
   c. conductor: same as driver with trip counts area placeholder.
   d. ops, gov, admin: left sidebar with icon + label items per docs/11, collapsible at md, fixed 248 px at lg, top bar with a scope switcher placeholder and account menu. Page header component: title, optional description, filters slot, primary action slot.
   Each shell has a skip link, header, nav and main landmarks.
7. /design page (only when NODE_ENV is development): every component from Day 2 with every state, both themes side by side toggle, both languages, and the status badge grid. Delete the Day 1 token page and put a simple placeholder home that says the home screen comes on Day 4 (i18n key).
8. not-found.tsx and error.tsx with EmptyState and ErrorState, Retry and Home actions, all copy from i18n.
9. Page title pattern "{Page} · AP TransitOS" via metadata in each layout.

Verify: switch language and theme on every shell at 360, 768, 1280 px. Telugu labels do not overflow the bottom nav (shorten keys with the glossary if needed and tell me). pnpm i18n:check, lint, typecheck, test, check:dashes pass.
```

## Dev B (backend)

**Read first:** `docs/06-api-contract.md` (Basics, Error shape, Health and auth), `docs/08-roles-permissions.md` (all), `docs/12-security.md` (all)

```text
Day 03, Dev B (backend). Goal: OTP login, tokens with refresh rotation, role and scope guards, rate limiting, audit logging.

1. common/zod-validation.pipe.ts: validates body, query and params with schemas from @aptransit/shared, returns VALIDATION_FAILED with field details.
2. Shared schemas in packages/shared/src/schemas/auth.ts: OtpRequestInput, OtpVerifyInput, MeDto, UpdateMeInput. Phone format +91 and 10 digits; email lower cased and trimmed.
3. Auth module:
   a. POST /auth/otp/request: generates a 6 digit code, stores SHA 256 of (code + OTP_PEPPER) in otp_codes with 5 min expiry, sends by email through an EmailProvider interface (ResendEmailProvider; for addresses ending in .test and for PHONE channel it logs instead of sending). When OTP_DEV_ECHO=1 and APP_ENV is not production, include devCode in the response. Returns 202 with expiresInSec and resendInSec.
   b. POST /auth/otp/verify: constant time compare, max 5 attempts then OTP_TOO_MANY_ATTEMPTS and a 15 min lock (Redis otp:lock:{target}), creates the user on first login (role CITIZEN), issues an access token (jose, HS256 with JWT_SECRET, 15 min, claims sub, roles with scopes) and a refresh token (random 32 bytes, stored hashed, new familyId) in the apt_rt cookie with the attributes in docs/06.
   c. POST /auth/refresh: rotates the token (old one revoked, replacedById set). If a revoked token is reused, revoke the whole family, write audit auth.refresh_reuse_detected, return 401.
   d. POST /auth/logout: revokes the family, clears the cookie, 204.
   e. GET /me and PATCH /me (name, preferredLocale). Phone masked in MeDto.
4. Guards and decorators in common/: global JwtAuthGuard with @Public() opt out; @Can(permission) using packages/shared permissions.ts; a ScopeService with helpers assertDepotAccess(user, depotId) and assertDistrictAccess(user, districtId) for services to call; @CurrentUser() param decorator.
5. Rate limiting: @nestjs/throttler with a Redis storage backed by our RedisService, limits per docs/12 table, keyed by user id when logged in else IP, 429 RATE_LIMITED with Retry-After.
6. Audit: AuditService.log({ action, entityType, entityId, before, after }) that fills actor, role, ip and user agent from the request context, and an @Audit(action) decorator for simple cases. Log auth.login and auth.logout now.
7. Tests: unit tests for OTP hashing, attempts, lock, refresh rotation and reuse detection, can() for a few roles. Integration tests: request and verify happy path (use devCode), wrong code, expired code, refresh rotation, reuse detection revokes family, /me unauthorised, a DEPOT_MANAGER of Kurnool gets 403 on a Nandyal scoped check.

Rules: never log OTP codes, tokens or cookies (check pino redact paths), timingSafeEqual for every secret compare, no em dash or en dash.

Verify: with curl or the REST client of your choice, log in as citizen@aptransit.test using the OTP from the log, call /me, refresh twice, reuse the first refresh token and confirm the family is revoked. pnpm test green.
```

## Sync point (end of day, 15 min)

- Dev B demos the login flow with curl. Dev A confirms the cookie attributes work through the Next rewrite on localhost (same origin).
- Agree how the web learns roles: from `MeDto.roles` after login and after refresh.
- Merge order: Dev B `b/auth`, then Dev A `a/shells-i18n`.

## Done when

- [ ] Language and theme switch work on every shell without a flash.
- [ ] `/design` shows every component and state.
- [ ] `pnpm i18n:check` runs in CI.
- [ ] OTP login, refresh rotation, reuse detection, logout, `/me` work with tests.
- [ ] Guards and scope checks in place. Rate limits active on auth routes.
- [ ] Audit rows written for login and logout.

## Not today

Real pages (home, login UI), network APIs.

## Optional skill hints (Claude Code)

- Dev A: `/design-taste-frontend` to review the shells for generic looking layout before they spread.
- Dev B: `/security` on the auth module before opening the PR.
