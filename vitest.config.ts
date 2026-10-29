import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    include: ['src/**/*.test.ts'],
    // The persistent module cache keeps stale `import.meta.glob` results, so newly
    // added question files would silently skip validation.
    fsModuleCache: false,
  },
})
