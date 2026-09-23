import { HealthDto } from "@aptransit/shared";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../src/app.module";
import { configureHttpApp } from "../src/http-app";
import { RedisService } from "../src/redis/redis.service";

// Integration test against the real Neon test branch (docs/14).
// Runs only when TEST_DATABASE_URL is set (locally or as a CI secret).
// TEST_REDIS_URL is optional; without it Redis is stubbed so the test focuses on the database.
// test/setup-env.ts points DATABASE_URL and REDIS_URL at these before AppModule loads.

const databaseUrl = process.env.TEST_DATABASE_URL;
const redisUrl = process.env.TEST_REDIS_URL;

describe.skipIf(!databaseUrl)("GET /api/v1/health against the Neon test branch", () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    let builder = Test.createTestingModule({ imports: [AppModule] });
    if (!redisUrl) {
      builder = builder
        .overrideProvider(RedisService)
        .useValue({ client: { ping: async () => "PONG" }, onModuleDestroy: () => undefined });
    }
    const moduleRef = await builder.compile();
    app = moduleRef.createNestApplication<NestExpressApplication>({ bufferLogs: true });
    configureHttpApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it("returns 200 with db ok", async () => {
    const res = await request(app.getHttpServer()).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(HealthDto.parse(res.body).db).toBe("ok");
  });
});
