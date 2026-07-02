import { defineConfig } from "vitest/config";
import path from "node:path";

// Make .env.local available to integration tests (Node 21+ built-in).
try {
  process.loadEnvFile(path.resolve(__dirname, ".env.local"));
} catch {
  // No .env.local (e.g. CI) — integration tests skip themselves.
}

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
