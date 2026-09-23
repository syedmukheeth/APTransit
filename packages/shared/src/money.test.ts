import { describe, expect, it } from "vitest";
import { isPaise, paiseToRupees, roundToRupee, rupeesToPaise } from "./money";

describe("money helpers", () => {
  it("converts rupees and paise", () => {
    expect(rupeesToPaise(541)).toBe(54100);
    expect(rupeesToPaise(1.4)).toBe(140);
    expect(paiseToRupees(54100)).toBe(541);
  });

  it("rejects bad input", () => {
    expect(() => rupeesToPaise(Number.NaN)).toThrow(RangeError);
    expect(() => paiseToRupees(10.5)).toThrow(RangeError);
    expect(isPaise(-1)).toBe(false);
    expect(isPaise(1.5)).toBe(false);
    expect(isPaise(0)).toBe(true);
  });

  it("rounds to the nearest rupee, half up", () => {
    expect(roundToRupee(51100)).toBe(51100);
    expect(roundToRupee(51149)).toBe(51100);
    expect(roundToRupee(51150)).toBe(51200);
    expect(roundToRupee(0)).toBe(0);
    expect(() => roundToRupee(-100)).toThrow(RangeError);
  });
});
