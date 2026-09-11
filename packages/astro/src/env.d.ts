// astro check requires the extra @astrojs/check dependency, which this
// package does not install (see README). This shim lets plain tsc resolve
// the .astro import in index.ts instead.
declare module '*.astro' {
  import type { AstroComponentFactory } from 'astro/runtime/server/index.js'

  const Component: AstroComponentFactory
  export default Component
}
