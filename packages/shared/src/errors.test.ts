import { describe, expect, it } from "vitest";
import { ERROR_HTTP_STATUS, ErrorCode, ErrorResponse, isErrorCode } from "./errors";

describe("error codes", () => {
  it("every code maps to an HTTP status", () => {
    for (const code of Object.values(ErrorCode)) {
      expect(ERROR_HTTP_STATUS[code]).toBeGreaterThanOrEqual(400);
    }
  });

  it("key and value are identical for every code", () => {
    for (const [key, value] of Object.entries(ErrorCode)) {
      expect(key).toBe(value);
    }
  });

  it("isErrorCode narrows known codes only", () => {
    expect(isErrorCode("SEAT_TAKEN")).toBe(true);
    expect(isErrorCode("NOPE")).toBe(false);
    expect(isErrorCode(42)).toBe(false);
  });

  it("parses the error body from docs/06", () => {
    const body = {
      error: {
        code: "SEAT_TAKEN",
        message: "Seat 18 is no longer available",
        details: { seatNo: "18" },
        requestId: "req_1",
      },
    };
    expect(ErrorResponse.parse(body)).toEqual(body);
  });
});
