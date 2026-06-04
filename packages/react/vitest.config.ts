import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      all: true,
      include: ["src/**/*.{ts,tsx}"],
      thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
    },
  },
})
