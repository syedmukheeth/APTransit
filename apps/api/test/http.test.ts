import { ErrorResponse, HealthDto } from "@aptransit/shared";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../src/app.module";
import { configureHttpApp } from "../src/http-app";
import { PrismaService } from "../src/prisma/prisma.service";
import { RedisService } from "../src/redis/redis.service";

// Runs the real HTTP pipeline (prefix, helmet, CORS, filter, request ids) with fake dependencies.
// No database or Redis needed, so it always runs in CI.

describe("HTTP pipeline", () => {
  let app: NestExpressApplication;
  let dbUp = true;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue({
        $queryRaw: async () => (dbUp ? [1] : Promise.reject(new Error("db down"))),
        onModuleDestroy: async () => undefined,
      })
      .overrideProvider(RedisService)
      .useValue({ client: { ping: async () => "PONG" }, onModuleDestroy: () => undefined })
      .compile();
    app = moduleRef.createNestApplication<NestExpressApplication>({ bufferLogs: true });
    configureHttpApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it("GET /api/v1/health returns 200 and the HealthDto shape when all is up", async () => {
    dbUp = true;
    const res = await request(app.getHttpServer()).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(HealthDto.parse(res.body)).toMatchObject({ status: "ok", db: "ok", redis: "ok" });
    expect(res.headers["cache-control"]).toBe("no-store");
  });

  it("GET /api/v1/health returns 503 when the database is down", async () => {
    dbUp = false;
    const res = await request(app.getHttpServer()).get("/api/v1/health");
    expect(res.status).toBe(503);
    expect(res.body).toMatchObject({ status: "degraded", db: "down", redis: "ok" });
    dbUp = true;
  });

  it("unknown routes return the docs/06 error shape with a request id", async () => {
    const res = await request(app.getHttpServer()).get("/api/v1/nope");
    expect(res.status).toBe(404);
    const body = ErrorResponse.parse(res.body);
    expect(body.error.code).toBe("NOT_FOUND");
    expect(body.error.requestId).toMatch(/^req_/);
    expect(res.headers["x-request-id"]).toBe(body.error.requestId);
  });

  it("reuses a safe incoming x-request-id", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/v1/health")
      .set("x-request-id", "abc12345-test");
    expect(res.headers["x-request-id"]).toBe("abc12345-test");
  });

  it("sets security headers and hides the framework", async () => {
    const res = await request(app.getHttpServer()).get("/api/v1/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });

  it("allows CORS only for the web origin", async () => {
    const allowed = await request(app.getHttpServer())
      .options("/api/v1/health")
      .set("Origin", "http://localhost:3000")
      .set("Access-Control-Request-Method", "GET");
    expect(allowed.headers["access-control-allow-origin"]).toBe("http://localhost:3000");

    const blocked = await request(app.getHttpServer())
      .options("/api/v1/health")
      .set("Origin", "https://evil.example")
      .set("Access-Control-Request-Method", "GET");
    // The API always answers with the one allowed origin, so the browser blocks any other site.
    expect(blocked.headers["access-control-allow-origin"]).not.toBe("https://evil.example");
    expect(blocked.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
  });

  it("rejects bodies over 100 kb with VALIDATION_FAILED", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/health")
      .set("Content-Type", "application/json")
      .send(JSON.stringify({ blob: "x".repeat(120 * 1024) }));
    expect(res.status).toBe(413);
    expect(ErrorResponse.parse(res.body).error.code).toBe("VALIDATION_FAILED");
  });
});
