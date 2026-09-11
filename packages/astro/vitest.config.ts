import { getViteConfig } from 'astro/config'

// getViteConfig wires up Astro's Vite plugin so vitest can load and
// transform .astro files: plain `defineProject` cannot parse them.
export default getViteConfig({
  test: {
    name: '@nurblings/astro',
    environment: 'node',
  },
})
