import { defineConfig, type Options } from 'tsup'

const base: Options = {
  format: ['esm'],
  target: 'es2020',
  jsx: 'automatic',
  external: ['react', 'nurblings'],
  // tsup's declaration build sets baseUrl, which TypeScript 6 deprecates
  dts: { compilerOptions: { ignoreDeprecations: '6.0' } },
  treeshake: true,
}

export default defineConfig([
  // the server-safe component: no directive, usable in React Server Components
  { ...base, entry: ['src/index.tsx'], clean: true },
  // bundling drops module directives, so the client entry gets it as a banner;
  // rollup's tree-shaking pass would strip even that, so it is off here
  { ...base, entry: ['src/client.tsx'], banner: { js: "'use client'" }, treeshake: false },
])
