import { describe, expect, it } from "vitest";
import {
  computeTripSchedule,
  formatIstDate,
  formatIstTime,
  localTimeToUtc,
  utcToIstParts,
} from "./time";

describe("IST time helpers", () => {
  it("converts morning local IST time to UTC Date", () => {
    // 06:30 IST is 01:00 UTC
    const date = localTimeToUtc("2026-09-24", "06:30");
    expect(date.toISOString()).toBe("2026-09-24T01:00:00.000Z");
  });

  it("converts night departure 21:30 IST to UTC Date", () => {
    // 21:30 IST is 16:00 UTC
    const date = localTimeToUtc("2026-09-24", "21:30");
    expect(date.toISOString()).toBe("2026-09-24T16:00:00.000Z");
  });

  it("converts midnight 00:00 IST to UTC Date", () => {
    // 00:00 IST on 2026-09-24 is 18:30 UTC on 2026-09-23
    const date = localTimeToUtc("2026-09-24", "00:00");
    expect(date.toISOString()).toBe("2026-09-23T18:30:00.000Z");
  });

  it("extracts IST parts correctly from UTC Date", () => {
    const utcDate = new Date("2026-09-24T16:00:00.000Z");
    const parts = utcToIstParts(utcDate);
    expect(parts.year).toBe(2026);
    expect(parts.month).toBe(9);
    expect(parts.day).toBe(24);
    expect(parts.hours).toBe(21);
    expect(parts.minutes).toBe(30);
    expect(parts.dateStr).toBe("2026-09-24");
    expect(parts.timeStr).toBe("21:30");
    expect(formatIstTime(utcDate)).toBe("21:30");
    expect(formatIstDate(utcDate)).toBe("2026-09-24");
  });

  it("handles night trips that cross midnight into next day", () => {
    // Kurnool to Vijayawada night trip: 21:30 departure, 340 minutes (5h 40m) duration
    // Arrival should be at 03:10 IST on 2026-09-25
    const schedule = computeTripSchedule("2026-09-24", "21:30", 340);
    expect(schedule.scheduledDepartureAt.toISOString()).toBe("2026-09-24T16:00:00.000Z");
    expect(schedule.scheduledArrivalAt.toISOString()).toBe("2026-09-24T21:40:00.000Z");
    expect(schedule.arrivalLocal).toBe("03:10");
    expect(schedule.arrivalDateStr).toBe("2026-09-25");
    expect(schedule.crossesMidnight).toBe(true);
  });

  it("handles day trips that do not cross midnight", () => {
    // 05:30 departure, 340 minutes -> 11:10 arrival same day
    const schedule = computeTripSchedule("2026-09-24", "05:30", 340);
    expect(schedule.arrivalLocal).toBe("11:10");
    expect(schedule.arrivalDateStr).toBe("2026-09-24");
    expect(schedule.crossesMidnight).toBe(false);
  });
});
