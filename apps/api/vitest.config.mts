import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

// SWC compiles Nest decorators and emits decorator metadata, which esbuild cannot do.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "test/**/*.test.ts"],
    environment: "node",
    setupFiles: ["test/setup-env.ts"],
    testTimeout: 20000,
    hookTimeout: 30000,
  },
  plugins: [swc.vite({ module: { type: "es6" } })],
});
