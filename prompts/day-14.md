# Day 14 · Operations: depot dashboard and admin API

**Phase:** Operations · **Goal:** a depot manager sees the depot live (KPIs, map, trips, incidents) and acts on incidents; the admin API manages the network, users and policies.

**Read first (both):** `docs/11-screens.md` (Depot operations, Admin), `docs/06-api-contract.md` (Operations, Admin), `docs/08-roles-permissions.md`

---

## Dev A (frontend)

**Read first:** `docs/11-screens.md` (Depot operations), `docs/09-design-system.md` (KpiTile, DataTable, MapView, Surfaces: Ops), plan sec 29 to 33

```text
Day 14, Dev A (frontend). Goal: the depot dashboard, fleet list, trips list and incidents inbox. Desktop first, still usable at 768 px.

1. DataTable in packages/ui: typed columns, sortable headers (aria-sort), sticky header, 44 px rows, row click or row actions menu (never both on the same row), selection not needed, loading rows (skeleton), empty row with EmptyState, cursor pagination controls, filters slot. Numbers right aligned and tabular.
2. KpiTile in packages/ui: label, value in display size (tabular), optional delta with tone and an icon, optional link. Loading skeleton that matches.
3. Ops shell: scope switcher in the top bar for district and state roles (depot list), hidden for depot roles. The chosen depot lives in the URL (?depot=).
4. /ops dashboard (plan sec 29): KPI row (Active buses, Total buses, Active trips, Delayed trips, Breakdowns) from GET /ops/dashboard, updated live from kpi:update. Bus status legend with counts using StatusBadge (Running, Delayed, Breakdown, Maintenance, Not assigned). Live map (MapView) with depot buses from GET /tracking/live and bus:position events, markers coloured by tone with an icon, click shows a small card (bus, route, driver, status, delay). Incidents panel: open incidents, newest first, live via incident:new and incident:update, each with type icon, bus, trip, time, Acknowledge button.
5. /ops/buses: DataTable (bus number, type, status badge, current route, driver, maintenance due) with status filter and search, Add bus dialog (form with validation).
6. /ops/trips: date picker in the URL, status and route filters, DataTable (code, route, departure, bus, driver, status, delay, passengers), Assign action opens a dialog with available buses and staff.
7. /ops/incidents: full list with filters (Open, Acknowledged, Resolved), detail drawer with a mini map, Acknowledge and Resolve (note required).
8. All states, both languages. Tables must stay readable in Telugu (column headers may wrap to two lines, never truncate silently).

Verify: open /ops as manager.knl on two browsers, start the simulator with --all --depot KNL and --breakdown-at on one trip; both dashboards update live, acknowledging on one updates the other. UI quality checklist at 1280 and 768 px.
```

## Dev B (backend)

**Read first:** `docs/06-api-contract.md` (Admin), `docs/05-data-model.md` (Network, fare_rules, refund_policies, settings, audit_logs), `docs/07-ticket-and-pass-rules.md` (section 1), `docs/12-security.md` (Audit events)

```text
Day 14, Dev B (backend). Goal: the admin API for the network, timetables, users and roles, policies and audit logs.

1. Stops: GET, POST, PATCH /admin/stops (bilingual names required, lat and lng inside AP bounds plus 50 km).
2. Routes: GET, POST, PATCH /admin/routes with ordered stops in one payload (stopId, kmFromOrigin, minutesFromOrigin, isBoarding, isDropping). Validate strictly increasing km and minutes. Regenerate the encoded polyline from stop coordinates. Changing stops on a route with future trips is allowed only when no BOOKED or ACTIVE tickets use removed stops; otherwise return a clear error.
3. Timetables: GET, POST, PATCH, DELETE (deactivate) /admin/timetables. POST /admin/trips/generate { from, to } runs trip-generator for that range (idempotent) and returns the count.
4. Users: GET /admin/users?q&role, POST /admin/users/:id/roles { role, depotId?, districtId? } with scope validation, DELETE /admin/users/:id/roles/:roleId. Only SUPER_ADMIN may grant or revoke STATE_ADMIN or SUPER_ADMIN (user:roles:admin). Nobody can remove their own last admin role.
5. Policies: GET and PUT /admin/fare-rules (new rows with validFrom, never edit history), /admin/refund-policies (tiers validated: sorted, percent 0 to 100, one active policy), /admin/settings (every key from docs/07 section 1 validated by its own zod schema, unknown keys rejected).
6. Audit: GET /admin/audit-logs with filters and cursor pagination, before and after JSON included. Make sure every sensitive action in docs/08 writes an audit row (add a test that lists them).
7. Tests: permission matrix for each endpoint (state admin vs depot manager vs super admin), route stop validation, policy validation, audit rows for each change.

Rules: all admin writes are audited with before and after, no em dash or en dash.

Verify: change the Express per km fare with a validFrom of tomorrow and confirm search for tomorrow uses it while today does not. Change a refund tier and confirm the refund quote follows.
```

## Sync point (end of day, 15 min)

- Dev A shows the live dashboard with the simulator. Dev B checks the socket load (events per second) in the logs.
- Agree the admin forms' payloads for tomorrow (route stop editor shape especially).
- Merge order: Dev B `b/admin-api`, then Dev A `a/ops-dashboard`.

## Done when

- [ ] Depot dashboard, fleet, trips and incidents screens work live.
- [ ] DataTable and KpiTile exist in packages/ui with tests.
- [ ] Admin API complete with the permission matrix enforced and audit rows written.
- [ ] Policy changes take effect only from validFrom.

## Not today

Bus profile, trip detail, replacement UI, admin screens (Day 15), analytics.

## Optional skill hints (Claude Code)

- Dev A: `/dataviz` rules for KPI tiles, `/frontend-design` for dense tables.
- Dev B: `/security` for role escalation paths in the users endpoints.
