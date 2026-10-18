import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw/http'
import { API_BASE_URL } from '#/lib/http-client'
import {
  getAuthToken,
  getCurrentUser,
  getRefreshToken,
  saveSession,
} from '#/services/auth-storage'
import {
  getCurrentUserProfile,
  logoutFromApi,
  registerWithApi,
  signInWithApi,
} from '#/services/auth-service'
import { server } from '#/test/mocks/server'
import { envelope, session } from '#/test/fixtures'

describe('authentication service', () => {
  it.each(['Admin', 'SupportAgent', 'Customer', 'User'])(
    'accepts the %s login contract without mutating storage',
    async (role) => {
      server.use(
        http.post(`${API_BASE_URL}/api/auth/login`, async ({ request }) => {
          expect(await request.json()).toEqual({
            email: session.email,
            password: 'test-password',
          })
          return HttpResponse.json(envelope({ ...session, role }))
        }),
      )
      expect(await signInWithApi(session.email, 'test-password')).toEqual({
        ...session,
        role,
      })
      expect(getAuthToken()).toBeNull()
    },
  )

  it('registers a customer using the name/email/password contract', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/auth/register`, async ({ request }) => {
        expect(await request.json()).toEqual({
          fullName: 'Sample Customer',
          email: 'new@example.test',
          password: 'test-password',
        })
        // The current register endpoint does not issue a refresh token.
        return HttpResponse.json(
          envelope({
            ...session,
            email: 'new@example.test',
            role: 'Customer',
            refreshToken: '',
          }),
        )
      }),
    )
    const registered = await registerWithApi(
      'Sample Customer',
      'new@example.test',
      'test-password',
    )
    expect(registered.role).toBe('Customer')
    expect(registered.refreshToken).not.toBe('')
  })

  it('maps the current-user string ID and sends the saved bearer token', async () => {
    saveSession(session)
    server.use(
      http.get(`${API_BASE_URL}/api/auth/me`, ({ request }) => {
        expect(request.headers.get('authorization')).toBe(
          `Bearer ${session.token}`,
        )
        return HttpResponse.json(
          envelope({ userId: '42', email: session.email, role: session.role }),
        )
      }),
    )
    expect(await getCurrentUserProfile()).toEqual({
      id: 42,
      email: session.email,
      role: session.role,
    })
  })

  it.each([200, 503])(
    'clears all local session state after logout, including HTTP %s',
    async (status) => {
      saveSession(session)
      server.use(
        http.post(`${API_BASE_URL}/api/auth/logout`, async ({ request }) => {
          expect(await request.json()).toEqual({
            refreshToken: session.refreshToken,
          })
          return HttpResponse.json(
            status === 200 ? envelope(null) : { title: 'Unavailable' },
            { status },
          )
        }),
      )
      if (status === 200) await logoutFromApi()
      else await expect(logoutFromApi()).rejects.toThrow('Unavailable')
      expect(getAuthToken()).toBeNull()
      expect(getRefreshToken()).toBeNull()
      expect(getCurrentUser()).toBeNull()
    },
  )

  it('signs out locally when registration supplied no refresh token', async () => {
    saveSession({ ...session, refreshToken: '' })
    await logoutFromApi()
    expect(getAuthToken()).toBeNull()
  })

  it('preserves API validation errors for the caller', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/auth/register`, () =>
        HttpResponse.json(
          {
            title: 'Validation failed',
            detail: 'Email is already registered.',
          },
          { status: 409 },
        ),
      ),
    )
    await expect(
      registerWithApi('Sample', 'used@example.test', 'test-password'),
    ).rejects.toThrow('Email is already registered.')
  })
})
