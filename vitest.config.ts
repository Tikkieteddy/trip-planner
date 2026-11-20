import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Tests must never reach billable Google APIs or real Redis/Auth0.
    unstubEnvs: true,
    unstubGlobals: true,
    restoreMocks: true,
  },
});
