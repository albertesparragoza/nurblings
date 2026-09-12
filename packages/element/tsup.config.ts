import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/define.ts'],
  format: ['esm'],
  // every browser with custom elements runs es2022; private fields stay native
  target: 'es2022',
  // tsup's declaration build sets baseUrl, which TypeScript 6 deprecates
  dts: { compilerOptions: { ignoreDeprecations: '6.0' } },
  clean: true,
  treeshake: true,
})
