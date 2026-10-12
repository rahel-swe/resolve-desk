import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

const env: Record<string, string | undefined> = loadEnv(
  'test',
  process.cwd(),
  '',
)
const apiBase =
  process.env.VITE_API_BASE_URL ??
  env.VITE_API_BASE_URL ??
  'http://localhost:5051'

if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(apiBase).hostname))
  throw new Error(
    'Live smoke tests are restricted to a local development backend.',
  )
const password =
  process.env.RESOLVEDESK_TEST_PASSWORD ?? env.RESOLVEDESK_TEST_PASSWORD

if (!password)
  throw new Error(
    'Set RESOLVEDESK_TEST_PASSWORD in the environment or ignored .env.test.local before running live tests.',
  )

export default defineConfig({
  resolve: { alias: { '#': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'jsdom',
    include: ['src/test/live/**/*.test.ts'],
    setupFiles: ['./src/test/isolation.ts'],
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 20000,
    env: { VITE_API_BASE_URL: apiBase, RESOLVEDESK_TEST_PASSWORD: password },
  },
})
