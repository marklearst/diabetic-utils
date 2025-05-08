import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': './src',
    },
  },
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['node_modules'],
      all: true,
      include: ['src/**/*.ts'],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
})
