import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/transition.ts'],
  format: ['esm'],
  target: 'es2020',
  // tsup's declaration build sets baseUrl, which TypeScript 6 deprecates
  dts: { compilerOptions: { ignoreDeprecations: '6.0' } },
  clean: true,
  treeshake: true,
})
