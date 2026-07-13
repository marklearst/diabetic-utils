// tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'metrics/index': 'src/metrics/index.ts',
    'connectors/index': 'src/connectors/index.ts',
    'interop/index': 'src/interop/index.ts',
    'render/index': 'src/render/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  target: 'es2022',
  sourcemap: true,
  minify: true,
  treeshake: true,
  splitting: true,
  outDir: 'dist',
})
