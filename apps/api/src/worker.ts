import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { Logger } from "nestjs-pino";
import { AppModule } from "./app.module";

// Background worker entry (docs/03): same AppModule, no HTTP server.
// BullMQ consumers are registered here from Day 5 (prompts/day-05.md).

async function bootstrap(): Promise<void> {
  if (process.env.WORKER !== "1") {
    console.error("worker.ts must run with WORKER=1 (docs/15-env-setup.md).");
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);
  app.useLogger(logger);
  logger.log("Worker started. No queues yet, they arrive on Day 5.", "Worker");

  // Keeps the process alive until a stop signal. BullMQ workers replace this on Day 5.
  const keepAlive = setInterval(() => undefined, 60_000);
  const stop = async (): Promise<void> => {
    clearInterval(keepAlive);
    await app.close();
    process.exit(0);
  };
  process.once("SIGTERM", () => void stop());
  process.once("SIGINT", () => void stop());
}

void bootstrap();
