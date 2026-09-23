# Definition of done

A task is done only when every box is ticked.

## Everyone

- [ ] Matches the locked docs. Any deviation is logged in `progress/decisions-log.md`.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm check:dashes` pass locally and in CI.
- [ ] No em dash or en dash anywhere in the diff.
- [ ] No secrets, no stray `console.log`, no commented out code.
- [ ] PR reviewed by the other dev and merged to `main`.
- [ ] Commit titles follow `AGENTS.md`. No AI attribution.

## Frontend (Dev A)

- [ ] Loading, empty, error and success states built.
- [ ] Works at 360, 768 and 1280 px, no horizontal scroll.
- [ ] Every string is an i18n key in both `en.json` and `te.json`. Telugu checked for overflow.
- [ ] Tokens only. Status only through `status.ts` and `StatusBadge`.
- [ ] Keyboard reachable, visible focus, labels and `aria` wired, one `h1`.
- [ ] [UI quality checklist](ui-quality-checklist.md) passes.

## Backend (Dev B)

- [ ] Request and response are zod schemas in `packages/shared`, used by the controller.
- [ ] Auth guard, permission and scope check, rate limit where listed in `docs/12-security.md`.
- [ ] Business rules only in the rule files, with unit tests for every rule row.
- [ ] Integration test: happy path, unauthorised, one rule failure.
- [ ] Audit event written when listed in `docs/12-security.md`.
- [ ] Errors use codes from `packages/shared/src/errors.ts`.
- [ ] Endpoint matches `docs/06-api-contract.md` exactly (or a decision is logged).
