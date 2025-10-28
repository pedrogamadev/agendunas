import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    dir: 'tests',
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.ts'],
  },
})
