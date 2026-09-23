import type { HealthDto, ProbeState } from "@aptransit/shared";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { RedisService } from "../../redis/redis.service";

export const PROBE_TIMEOUT_MS = 1_000;

/** Runs a check and reports ok or down. Never throws, never waits longer than the timeout. */
export async function probe(check: () => Promise<unknown>, timeoutMs = PROBE_TIMEOUT_MS): Promise<ProbeState> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("probe timed out")), timeoutMs);
  });
  try {
    await Promise.race([check(), timeout]);
    return "ok";
  } catch {
    return "down";
  } finally {
    clearTimeout(timer);
  }
}

function appVersion(): string {
  const sha = process.env.RENDER_GIT_COMMIT ?? process.env.GIT_SHA;
  return sha ? sha.slice(0, 7) : "dev";
}

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async check(): Promise<HealthDto> {
    const [db, redis] = await Promise.all([
      probe(() => this.prisma.$queryRaw`SELECT 1`),
      probe(() => this.redis.client.ping()),
    ]);
    return {
      status: db === "ok" && redis === "ok" ? "ok" : "degraded",
      db,
      redis,
      version: appVersion(),
      time: new Date().toISOString(),
    };
  }
}
