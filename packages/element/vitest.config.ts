import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: '@nurblings/element',
    environment: 'happy-dom',
  },
})
