import { describe, expect, it } from "vitest";
import { testEnv } from "../../test/test-env";
import { validateEnv } from "./env";

describe("validateEnv", () => {
  it("accepts a complete environment and parses flags and numbers", () => {
    const env = validateEnv(testEnv());
    expect(env.PORT).toBe(4000);
    expect(env.OTP_DEV_ECHO).toBe(true);
    expect(env.PAYMENTS_FAKE).toBe(false);
    expect(env.BULLMQ_DRAIN_DELAY_SEC).toBe(60);
  });

  it("refuses to boot when a required variable is missing", () => {
    const raw: Record<string, string> = testEnv();
    delete raw.DATABASE_URL;
    expect(() => validateEnv(raw)).toThrow(/DATABASE_URL/);
  });

  it("refuses a live Razorpay key", () => {
    expect(() => validateEnv(testEnv({ RAZORPAY_KEY_ID: "rzp_live_abc123" }))).toThrow(
      /RAZORPAY_KEY_ID: only Razorpay test keys/,
    );
  });

  it("refuses dev only features in production", () => {
    expect(() =>
      validateEnv(testEnv({ APP_ENV: "production", OTP_DEV_ECHO: "1", PAYMENTS_FAKE: "1" })),
    ).toThrow(/OTP_DEV_ECHO: must be 0 in production[\s\S]*PAYMENTS_FAKE: must be 0 in production/);
  });

  it("refuses a QR key that is not Ed25519 and a short QR secret", () => {
    expect(() =>
      validateEnv(
        testEnv({
          QR_SIGNING_PRIVATE_KEY: Buffer.from("not a key").toString("base64"),
          QR_SECRET_KEY: Buffer.from("short").toString("base64"),
        }),
      ),
    ).toThrow(/QR_SIGNING_PRIVATE_KEY[\s\S]*QR_SECRET_KEY/);
  });

  it("never prints secret values in the error", () => {
    const secret = "rzp_live_super_secret_value";
    try {
      validateEnv(testEnv({ RAZORPAY_KEY_ID: secret }));
    } catch (error) {
      expect(String(error)).not.toContain(secret);
    }
  });
});
