import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: '@nurblings/react',
    environment: 'happy-dom',
  },
})
