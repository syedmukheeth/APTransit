import { defineConfig } from "prisma/config";

// Prisma 7 does not read .env by itself. Load it with the Node 22 built in (no dotenv needed).
// CI and deploys pass real environment variables, so a missing file is fine.
try {
  process.loadEnvFile(".env");
} catch {
  // no .env file
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Direct (not pooled) Neon URL for migrations. Empty is fine for `prisma generate`.
    url: process.env.DIRECT_URL ?? "",
  },
});
