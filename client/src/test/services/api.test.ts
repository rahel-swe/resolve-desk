import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw/http'
import { API_BASE_URL, apiRequest } from '#/lib/api'
import {
  clearSession,
  getAuthToken,
  getRefreshToken,
  saveSession,
} from '#/services/auth-storage'
import { server } from '#/test/mocks/server'
import { envelope, session } from '#/test/fixtures'

describe('shared API transport', () => {
  it.each(['envelope', 'raw'])(
    'decodes a successful %s response',
    async (shape) => {
      server.use(
        http.get(`${API_BASE_URL}/transport`, () =>
          HttpResponse.json(
            shape === 'envelope' ? envelope({ value: 7 }) : { value: 7 },
          ),
        ),
      )
      expect(await apiRequest('/transport')).toEqual({ value: 7 })
    },
  )

  it('handles a 204 response without trying to parse JSON', async () => {
    server.use(
      http.post(
        `${API_BASE_URL}/transport`,
        () => new HttpResponse(null, { status: 204 }),
      ),
    )
    expect(await apiRequest('/transport', { method: 'POST' })).toBeUndefined()
  })

  it('rejects a failed application envelope even when HTTP status is 200', async () => {
    server.use(
      http.get(`${API_BASE_URL}/transport`, () =>
        HttpResponse.json({
          isSuccess: false,
          message: 'Operation rejected.',
          data: null,
        }),
      ),
    )
    await expect(apiRequest('/transport')).rejects.toThrow(
      'Operation rejected.',
    )
  })

  it('surfaces ProblemDetails and plain-text failures', async () => {
    server.use(
      http.get(`${API_BASE_URL}/transport`, () =>
        HttpResponse.json(
          { title: 'Invalid request', detail: 'Comment is too long.' },
          {
            status: 400,
            headers: { 'Content-Type': 'application/problem+json' },
          },
        ),
      ),
    )
    await expect(apiRequest('/transport')).rejects.toThrow(
      'Comment is too long.',
    )
    server.use(
      http.get(
        `${API_BASE_URL}/transport`,
        () => new HttpResponse('Service unavailable.', { status: 503 }),
      ),
    )
    await expect(apiRequest('/transport')).rejects.toThrow(
      'Service unavailable.',
    )
  })

  it('keeps a valid session on 403 and does not refresh permissions', async () => {
    saveSession(session)
    server.use(
      http.get(
        `${API_BASE_URL}/transport`,
        () => new HttpResponse(null, { status: 403 }),
      ),
    )
    await expect(apiRequest('/transport')).rejects.toThrow('403')
    expect(getAuthToken()).toBe(session.token)
  })

  it('shares one token refresh across simultaneous expired requests and retries each once', async () => {
    saveSession(session)
    let refreshCalls = 0
    const calls: string[] = []
    let releaseRefresh!: () => void
    const refreshGate = new Promise<void>((resolve) => {
      releaseRefresh = resolve
    })
    server.use(
      http.get(`${API_BASE_URL}/transport/:id`, ({ request }) => {
        const token = request.headers.get('authorization')
        calls.push(`${new URL(request.url).pathname}:${token}`)
        return token === 'Bearer rotated-access'
          ? HttpResponse.json(envelope({ ok: true }))
          : new HttpResponse(null, { status: 401 })
      }),
      http.post(`${API_BASE_URL}/api/auth/refresh`, async ({ request }) => {
        refreshCalls++
        expect(await request.json()).toEqual({
          refreshToken: session.refreshToken,
        })
        await refreshGate
        return HttpResponse.json(
          envelope({
            ...session,
            token: 'rotated-access',
            refreshToken: 'rotated-refresh',
          }),
        )
      }),
    )
    const pending = Promise.all([
      apiRequest('/transport/a'),
      apiRequest('/transport/b'),
      apiRequest('/transport/c'),
    ])
    await expect
      .poll(() => calls.filter((call) => call.endsWith(session.token)).length)
      .toBe(3)
    await expect.poll(() => refreshCalls).toBeGreaterThanOrEqual(1)
    releaseRefresh()
    expect(await pending).toEqual([{ ok: true }, { ok: true }, { ok: true }])
    expect(refreshCalls).toBe(1)
    expect(calls).toHaveLength(6)
    expect(getAuthToken()).toBe('rotated-access')
    expect(getRefreshToken()).toBe('rotated-refresh')
  })

  it('bounds retries and clears a session when even the rotated token is rejected', async () => {
    saveSession(session)
    let reads = 0
    let refreshes = 0
    server.use(
      http.get(`${API_BASE_URL}/transport`, () => {
        reads++
        return new HttpResponse(null, { status: 401 })
      }),
      http.post(`${API_BASE_URL}/api/auth/refresh`, () => {
        refreshes++
        return HttpResponse.json(
          envelope({ ...session, token: 'rotated-access' }),
        )
      }),
    )
    await expect(apiRequest('/transport')).rejects.toThrow('401')
    expect(reads).toBe(2)
    expect(refreshes).toBe(1)
    expect(getAuthToken()).toBeNull()
  })

  it('does not resurrect a signed-out session when an in-flight refresh completes', async () => {
    saveSession(session)
    let requested = false
    let releaseRefresh!: () => void
    const gate = new Promise<void>((resolve) => {
      releaseRefresh = resolve
    })
    server.use(
      http.get(
        `${API_BASE_URL}/transport`,
        () => new HttpResponse(null, { status: 401 }),
      ),
      http.post(`${API_BASE_URL}/api/auth/refresh`, async () => {
        requested = true
        await gate
        return HttpResponse.json(
          envelope({
            ...session,
            token: 'rotated-token',
            refreshToken: 'rotated-refresh',
          }),
        )
      }),
    )
    const pending = apiRequest('/transport')
    const rejected = expect(pending).rejects.toMatchObject({
      name: 'AbortError',
    })
    await expect.poll(() => requested).toBe(true)
    clearSession()
    releaseRefresh()
    await rejected
    expect(getAuthToken()).toBeNull()
  })

  it.each([200, 401])(
    'preserves a new account when an old refresh finishes with HTTP %s',
    async (status) => {
      saveSession(session)
      let requested = false
      let releaseRefresh!: () => void
      const gate = new Promise<void>((resolve) => {
        releaseRefresh = resolve
      })
      server.use(
        http.get(
          `${API_BASE_URL}/transport`,
          () => new HttpResponse(null, { status: 401 }),
        ),
        http.post(`${API_BASE_URL}/api/auth/refresh`, async () => {
          requested = true
          await gate
          return status === 200
            ? HttpResponse.json(
                envelope({
                  ...session,
                  token: 'old-rotated-token',
                  refreshToken: 'old-rotated-refresh',
                }),
              )
            : new HttpResponse(null, { status })
        }),
      )
      const pending = apiRequest('/transport')
      const rejected = expect(pending).rejects.toMatchObject({
        name: 'AbortError',
      })
      await expect.poll(() => requested).toBe(true)
      saveSession({
        ...session,
        email: 'another@example.test',
        token: 'new-account-token',
        refreshToken: 'new-account-refresh',
      })
      releaseRefresh()
      await rejected
      expect(getAuthToken()).toBe('new-account-token')
      expect(getRefreshToken()).toBe('new-account-refresh')
    },
  )

  it('passes through explicit headers and network failures without erasing a valid session', async () => {
    saveSession(session)
    server.use(
      http.get(`${API_BASE_URL}/transport`, ({ request }) => {
        expect(request.headers.get('authorization')).toBe(
          'Bearer explicit-token',
        )
        expect(request.headers.get('x-request-id')).toBe('test-request')
        return HttpResponse.error()
      }),
    )
    await expect(
      apiRequest('/transport', {
        headers: {
          Authorization: 'Bearer explicit-token',
          'X-Request-ID': 'test-request',
        },
      }),
    ).rejects.toThrow()
    expect(getAuthToken()).toBe(session.token)
  })
})
