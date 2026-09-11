import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: '@nurblings/vue',
    environment: 'happy-dom',
  },
})
