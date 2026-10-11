import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '#': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts', './src/test/isolation.ts'],
    globals: true,
    restoreMocks: true,
    exclude: ['node_modules/**', 'src/test/live/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'src/services/**',
        'src/lib/api.ts',
        'src/hooks/use-api-resource.ts',
        'src/hooks/use-ticket-workspace.ts',
        'src/pages/tickets-page.tsx',
      ],
    },
  },
})
