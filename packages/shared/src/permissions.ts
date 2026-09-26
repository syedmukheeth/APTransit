import type { Role } from "./enums";

export const PERMISSIONS = [
  "booking:create",
  "ticket:own",
  "pass:own",
  "feedback:create",
  "driver:trip",
  "ticket:validate",
  "conductor:manifest",
  "ops:read",
  "incident:manage",
  "trip:assign",
  "trip:replace-bus",
  "trip:cancel",
  "fleet:write",
  "staff:write",
  "device:approve",
  "complaint:manage",
  "gov:read",
  "report:export",
  "network:write",
  "policy:write",
  "user:roles",
  "user:roles:admin",
  "audit:read",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/**
 * Role to permissions mapping based on docs/08-roles-permissions.md
 */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  CITIZEN: [
    "booking:create",
    "ticket:own",
    "pass:own",
    "feedback:create",
  ],
  DRIVER: [
    "booking:create",
    "ticket:own",
    "pass:own",
    "feedback:create",
    "driver:trip",
  ],
  CONDUCTOR: [
    "booking:create",
    "ticket:own",
    "pass:own",
    "feedback:create",
    "ticket:validate",
    "conductor:manifest",
  ],
  DEPOT_STAFF: [
    "booking:create",
    "ticket:own",
    "pass:own",
    "feedback:create",
    "ops:read",
    "incident:manage",
    "trip:assign",
    "trip:replace-bus",
    "complaint:manage",
  ],
  DEPOT_MANAGER: [
    "booking:create",
    "ticket:own",
    "pass:own",
    "feedback:create",
    "ops:read",
    "incident:manage",
    "trip:assign",
    "trip:replace-bus",
    "trip:cancel",
    "fleet:write",
    "staff:write",
    "device:approve",
    "complaint:manage",
    "report:export",
    "audit:read",
  ],
  DISTRICT_OFFICER: [
    "booking:create",
    "ticket:own",
    "pass:own",
    "feedback:create",
    "ops:read",
    "complaint:manage",
    "gov:read",
    "report:export",
    "audit:read",
  ],
  TRANSPORT_OFFICER: [
    "booking:create",
    "ticket:own",
    "pass:own",
    "feedback:create",
    "ops:read",
    "gov:read",
    "report:export",
    "audit:read",
  ],
  STATE_ADMIN: [
    "booking:create",
    "ticket:own",
    "pass:own",
    "feedback:create",
    "ops:read",
    "incident:manage",
    "trip:assign",
    "trip:replace-bus",
    "trip:cancel",
    "fleet:write",
    "staff:write",
    "device:approve",
    "complaint:manage",
    "gov:read",
    "report:export",
    "network:write",
    "policy:write",
    "user:roles",
    "audit:read",
  ],
  SUPER_ADMIN: [
    "booking:create",
    "ticket:own",
    "pass:own",
    "feedback:create",
    "ops:read",
    "incident:manage",
    "trip:assign",
    "trip:replace-bus",
    "trip:cancel",
    "fleet:write",
    "staff:write",
    "device:approve",
    "complaint:manage",
    "gov:read",
    "report:export",
    "network:write",
    "policy:write",
    "user:roles",
    "user:roles:admin",
    "audit:read",
  ],
};

/**
 * Returns true if the user with given roles has the requested permission.
 */
export function can(roles: readonly Role[] | Role[], permission: Permission): boolean {
  if (!roles || roles.length === 0) {
    return false;
  }
  for (const role of roles) {
    const permissions = ROLE_PERMISSIONS[role];
    if (permissions && permissions.includes(permission)) {
      return true;
    }
  }
  return false;
}

/**
 * Returns all unique permissions granted to the given roles.
 */
export function getPermissionsForRoles(roles: readonly Role[] | Role[]): Set<Permission> {
  const result = new Set<Permission>();
  if (!roles) return result;
  for (const role of roles) {
    const list = ROLE_PERMISSIONS[role];
    if (list) {
      for (const perm of list) {
        result.add(perm);
      }
    }
  }
  return result;
}
