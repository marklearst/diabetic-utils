import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts", "src/bin.ts"],
  format: ["esm", "cjs"],
  dts: { entry: "src/index.ts" },
  clean: true,
  target: "es2022",
  sourcemap: true,
  external: ["@glucoseiq/core"],
})
