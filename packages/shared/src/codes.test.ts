import { describe, expect, it } from "vitest";
import {
  CROCKFORD_ALPHABET,
  generateBookingCode,
  generateComplaintCode,
  generateCrockford,
  generateIncidentCode,
  generatePassCode,
  generateTicketCode,
  isValidCode,
} from "./codes";

describe("Crockford base32 codes", () => {
  it("does not include excluded letters I, L, O, U", () => {
    expect(CROCKFORD_ALPHABET).not.toContain("I");
    expect(CROCKFORD_ALPHABET).not.toContain("L");
    expect(CROCKFORD_ALPHABET).not.toContain("O");
    expect(CROCKFORD_ALPHABET).not.toContain("U");
    expect(CROCKFORD_ALPHABET).toHaveLength(32);
  });

  it("generates string of requested length", () => {
    const code = generateCrockford(10);
    expect(code).toHaveLength(10);
  });

  it("generates valid ticket code in APT-XXXX-XXXX format", () => {
    const code = generateTicketCode();
    expect(code).toMatch(/^APT-[0-9A-HJKMNP-Z]{4}-[0-9A-HJKMNP-Z]{4}$/);
    expect(isValidCode(code, "ticket")).toBe(true);
    expect(isValidCode("APT-1234-567I", "ticket")).toBe(false);
  });

  it("generates valid booking code in BKG-XXXXXX format", () => {
    const code = generateBookingCode();
    expect(code).toMatch(/^BKG-[0-9A-HJKMNP-Z]{6}$/);
    expect(isValidCode(code, "booking")).toBe(true);
    expect(isValidCode("BKG-12345", "booking")).toBe(false);
  });

  it("generates valid pass code in PAS-XXXXXX format", () => {
    const code = generatePassCode();
    expect(code).toMatch(/^PAS-[0-9A-HJKMNP-Z]{6}$/);
    expect(isValidCode(code, "pass")).toBe(true);
  });

  it("generates valid complaint code in CMP-XXXXXX format", () => {
    const code = generateComplaintCode();
    expect(code).toMatch(/^CMP-[0-9A-HJKMNP-Z]{6}$/);
    expect(isValidCode(code, "complaint")).toBe(true);
  });

  it("generates valid incident code in INC-XXXXXX format", () => {
    const code = generateIncidentCode();
    expect(code).toMatch(/^INC-[0-9A-HJKMNP-Z]{6}$/);
    expect(isValidCode(code, "incident")).toBe(true);
  });
});
