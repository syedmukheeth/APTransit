import { describe, expect, it } from "vitest";
import type { Coordinate } from "./polyline";
import { decodePolyline, encodePolyline } from "./polyline";

describe("Google encoded polyline", () => {
  it("encodes and decodes standard example points", () => {
    // Standard Google polyline example points
    const points: Coordinate[] = [
      [38.5, -120.2],
      [40.7, -120.95],
      [43.252, -126.453],
    ];

    const encoded = encodePolyline(points);
    expect(encoded).toBe("_p~iF~ps|U_ulLnnqC_mqNvxq`@");

    const decoded = decodePolyline(encoded);
    expect(decoded).toHaveLength(3);
    for (let i = 0; i < points.length; i++) {
      expect(decoded[i]?.[0]).toBeCloseTo(points[i]![0], 5);
      expect(decoded[i]?.[1]).toBeCloseTo(points[i]![1], 5);
    }
  });

  it("handles empty arrays", () => {
    expect(encodePolyline([])).toBe("");
    expect(decodePolyline("")).toEqual([]);
  });

  it("encodes and decodes Andhra Pradesh route coordinates accurately", () => {
    // Kurnool to Nandyal sample stops
    const apStops: Coordinate[] = [
      [15.8281, 78.0373], // Kurnool
      [15.67, 78.11], // Orvakal
      [15.526, 78.339], // Panyam
      [15.4786, 78.4836], // Nandyal
    ];

    const encoded = encodePolyline(apStops);
    expect(typeof encoded).toBe("string");
    expect(encoded.length).toBeGreaterThan(0);

    const decoded = decodePolyline(encoded);
    expect(decoded).toHaveLength(4);
    for (let i = 0; i < apStops.length; i++) {
      expect(decoded[i]?.[0]).toBeCloseTo(apStops[i]![0], 4);
      expect(decoded[i]?.[1]).toBeCloseTo(apStops[i]![1], 4);
    }
  });
});
