import { testEnv } from "./test-env";

// ConfigModule validates the environment when AppModule is imported, so the fake env
// must exist before any test file loads. Real test infrastructure URLs win when provided.
const overrides: Record<string, string> = {};
if (process.env.TEST_DATABASE_URL) {
  overrides.DATABASE_URL = process.env.TEST_DATABASE_URL;
  overrides.DIRECT_URL = process.env.TEST_DATABASE_URL;
}
if (process.env.TEST_REDIS_URL) {
  overrides.REDIS_URL = process.env.TEST_REDIS_URL;
}
Object.assign(process.env, testEnv(overrides));
