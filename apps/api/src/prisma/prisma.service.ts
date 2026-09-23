import { Injectable, type OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";
import type { Env } from "../config/env";
import { PrismaClient } from "../generated/prisma/client";

/**
 * Prisma 7 client on the pooled Neon URL through the pg driver adapter.
 * It connects lazily on the first query, so the API still boots (and reports db: down)
 * when the database is unreachable.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(config: ConfigService<Env, true>) {
    super({
      adapter: new PrismaPg({ connectionString: config.get("DATABASE_URL", { infer: true }) }),
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
