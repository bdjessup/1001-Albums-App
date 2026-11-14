import { defineConfig } from "vitest/config";

// Unit tests cover src/core only: pure TypeScript with no React Native imports,
// so they run in plain Node without mocks.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
