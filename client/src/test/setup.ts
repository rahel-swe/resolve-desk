import '@testing-library/jest-dom/vitest'
import { server } from '#/test/mocks/server'

import { afterAll, afterEach, beforeAll } from 'vitest'
import { httpClient } from '#/lib/http-client'

beforeAll(() => {
  httpClient.defaults.adapter = 'fetch'

  server.listen({
    onUnhandledFrame: 'error',
  })
})

afterEach(() => server.resetHandlers())

afterAll(() => server.close())
