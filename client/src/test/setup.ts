import '@testing-library/jest-dom/vitest'
import { server } from '#/test/mocks/server'

import { afterAll, afterEach, beforeAll } from 'vitest'

beforeAll(() => {
  server.listen({
    onUnhandledFrame: 'error',
  })
})

afterEach(() => server.resetHandlers())

afterAll(() => server.close())
