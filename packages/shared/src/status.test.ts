import { describe, expect, it } from "vitest";
import { BusStatus, TicketStatus } from "./enums";
import {
  DisplayStatus,
  STATUS_MAP,
  TICKET_STATUS_MAP,
  busDisplayStatus,
  colourOfDay,
  deriveTripDisplayStatus,
} from "./status";

describe("deriveTripDisplayStatus priority (docs/09)", () => {
  it("CANCELLED wins over everything", () => {
    expect(
      deriveTripDisplayStatus({ status: "CANCELLED", hasOpenIncident: true, delayMinutes: 40 }),
    ).toBe("CANCELLED");
  });

  it("INCIDENT comes before COMPLETED and DELAYED", () => {
    expect(
      deriveTripDisplayStatus({ status: "RUNNING", hasOpenIncident: true, delayMinutes: 30 }),
    ).toBe("INCIDENT");
    expect(
      deriveTripDisplayStatus({ status: "COMPLETED", hasOpenIncident: true, delayMinutes: 0 }),
    ).toBe("INCIDENT");
  });

  it("COMPLETED comes before DELAYED", () => {
    expect(
      deriveTripDisplayStatus({ status: "COMPLETED", hasOpenIncident: false, delayMinutes: 25 }),
    ).toBe("COMPLETED");
  });

  it("DELAYED starts at exactly 5 minutes", () => {
    expect(
      deriveTripDisplayStatus({ status: "RUNNING", hasOpenIncident: false, delayMinutes: 4 }),
    ).toBe("RUNNING");
    expect(
      deriveTripDisplayStatus({ status: "RUNNING", hasOpenIncident: false, delayMinutes: 5 }),
    ).toBe("DELAYED");
    expect(
      deriveTripDisplayStatus({ status: "SCHEDULED", hasOpenIncident: false, delayMinutes: 12 }),
    ).toBe("DELAYED");
  });

  it("RUNNING, else UPCOMING", () => {
    expect(
      deriveTripDisplayStatus({ status: "RUNNING", hasOpenIncident: false, delayMinutes: 0 }),
    ).toBe("RUNNING");
    expect(
      deriveTripDisplayStatus({ status: "SCHEDULED", hasOpenIncident: false, delayMinutes: 0 }),
    ).toBe("UPCOMING");
  });
});

describe("status tables are complete", () => {
  it("every display status has tone, icon and i18n key", () => {
    for (const key of DisplayStatus.options) {
      const meta = STATUS_MAP[key];
      expect(meta.key).toBe(key);
      expect(meta.icon.length).toBeGreaterThan(0);
      expect(meta.i18nKey).toBe(`status.${key}`);
    }
  });

  it("every bus status maps to a display status", () => {
    for (const status of BusStatus.options) {
      expect(DisplayStatus.options).toContain(busDisplayStatus(status));
    }
    expect(busDisplayStatus("IDLE")).toBe("NOT_ASSIGNED");
  });

  it("every ticket status has a tone and label key", () => {
    for (const status of TicketStatus.options) {
      expect(TICKET_STATUS_MAP[status].i18nKey).toBe(`ticketStatus.${status}`);
    }
    expect(TICKET_STATUS_MAP.ACTIVE.tone).toBe("info");
  });
});

describe("colourOfDay uses the weekday in Asia/Kolkata", () => {
  it("Wednesday 23 Sep 2026 at noon IST is violet", () => {
    expect(colourOfDay(new Date("2026-09-23T06:30:00Z")).key).toBe("VIOLET");
  });

  it("20:00 UTC on Wednesday is already Thursday in IST (amber)", () => {
    expect(colourOfDay(new Date("2026-09-23T20:00:00Z")).key).toBe("AMBER");
  });

  it("Sunday is red", () => {
    expect(colourOfDay(new Date("2026-09-27T06:30:00Z")).key).toBe("RED");
  });
});
