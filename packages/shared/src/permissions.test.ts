import { describe, expect, it } from "vitest";
import { can, getPermissionsForRoles } from "./permissions";

describe("Roles and permissions", () => {
  it("allows citizens basic booking and ticket access only", () => {
    expect(can(["CITIZEN"], "booking:create")).toBe(true);
    expect(can(["CITIZEN"], "ticket:own")).toBe(true);
    expect(can(["CITIZEN"], "pass:own")).toBe(true);
    expect(can(["CITIZEN"], "feedback:create")).toBe(true);
    expect(can(["CITIZEN"], "driver:trip")).toBe(false);
    expect(can(["CITIZEN"], "ops:read")).toBe(false);
    expect(can(["CITIZEN"], "policy:write")).toBe(false);
  });

  it("gives drivers the driver:trip permission", () => {
    expect(can(["DRIVER"], "driver:trip")).toBe(true);
    expect(can(["DRIVER"], "ticket:validate")).toBe(false);
  });

  it("gives conductors the ticket:validate and conductor:manifest permissions", () => {
    expect(can(["CONDUCTOR"], "ticket:validate")).toBe(true);
    expect(can(["CONDUCTOR"], "conductor:manifest")).toBe(true);
    expect(can(["CONDUCTOR"], "driver:trip")).toBe(false);
  });

  it("distinguishes depot manager from depot staff", () => {
    // Both have ops:read, incident:manage, trip:assign, trip:replace-bus, complaint:manage
    expect(can(["DEPOT_STAFF"], "trip:assign")).toBe(true);
    expect(can(["DEPOT_MANAGER"], "trip:assign")).toBe(true);

    // Only depot manager can cancel trips, write fleet, write staff, approve devices, export reports
    expect(can(["DEPOT_STAFF"], "trip:cancel")).toBe(false);
    expect(can(["DEPOT_MANAGER"], "trip:cancel")).toBe(true);
    expect(can(["DEPOT_STAFF"], "fleet:write")).toBe(false);
    expect(can(["DEPOT_MANAGER"], "fleet:write")).toBe(true);
    expect(can(["DEPOT_STAFF"], "staff:write")).toBe(false);
    expect(can(["DEPOT_MANAGER"], "staff:write")).toBe(true);
    expect(can(["DEPOT_STAFF"], "device:approve")).toBe(false);
    expect(can(["DEPOT_MANAGER"], "device:approve")).toBe(true);
  });

  it("distinguishes state admin from super admin", () => {
    expect(can(["STATE_ADMIN"], "network:write")).toBe(true);
    expect(can(["STATE_ADMIN"], "policy:write")).toBe(true);
    expect(can(["STATE_ADMIN"], "user:roles")).toBe(true);
    expect(can(["STATE_ADMIN"], "user:roles:admin")).toBe(false);

    expect(can(["SUPER_ADMIN"], "user:roles:admin")).toBe(true);
  });

  it("aggregates permissions for multiple roles", () => {
    const permissions = getPermissionsForRoles(["DRIVER", "DEPOT_STAFF"]);
    expect(permissions.has("driver:trip")).toBe(true);
    expect(permissions.has("trip:assign")).toBe(true);
    expect(permissions.has("user:roles")).toBe(false);
  });

  it("returns false for empty roles", () => {
    expect(can([], "booking:create")).toBe(false);
  });
});
