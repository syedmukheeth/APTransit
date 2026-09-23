import { Injectable, Logger, type OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Redis } from "ioredis";
import type { Env } from "../config/env";

const ERROR_LOG_INTERVAL_MS = 30_000;

/**
 * One shared ioredis client (TLS when the URL is rediss://, as with Upstash).
 * Lazy connect: the first command opens the connection. Redis is never the record (docs/13).
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);
  private lastErrorLoggedAt = 0;

  constructor(config: ConfigService<Env, true>) {
    this.client = new Redis(config.get("REDIS_URL", { infer: true }), {
      lazyConnect: true,
      connectTimeout: 5_000,
      maxRetriesPerRequest: 2,
      retryStrategy: (attempt) => Math.min(attempt * 200, 2_000),
    });
    this.client.on("error", (error: Error) => {
      // Upstash and network errors retry forever; log at most once every 30 s.
      const now = Date.now();
      if (now - this.lastErrorLoggedAt >= ERROR_LOG_INTERVAL_MS) {
        this.lastErrorLoggedAt = now;
        this.logger.warn(`Redis error: ${error.message}`);
      }
    });
  }

  onModuleDestroy(): void {
    this.client.disconnect();
  }
}
