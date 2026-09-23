import { ConfigService } from "@nestjs/config";
import type { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";
import { Logger } from "nestjs-pino";
import type { Env } from "./config/env";

export const API_PREFIX = "api/v1";

/** HTTP setup shared by main.ts and the integration tests, so tests hit the real pipeline. */
export function configureHttpApp(app: NestExpressApplication): void {
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  app.useLogger(app.get(Logger));
  app.set("trust proxy", 1); // Render and Vercel sit in front of us; needed for real client IPs
  app.use(helmet());
  app.enableCors({ origin: config.get("WEB_ORIGIN", { infer: true }), credentials: true });
  app.useBodyParser("json", { limit: "100kb" });
  app.setGlobalPrefix(API_PREFIX);
  app.enableShutdownHooks();
}
