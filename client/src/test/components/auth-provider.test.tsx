import { render, screen, waitFor, act } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw/http'
import { API_BASE_URL } from '#/lib/http-client'
import { AuthProvider, useAuth } from '#/providers/auth-provider'
import { clearSession, saveSession } from '#/services/auth-storage'
import { server } from '#/test/mocks/server'
import { envelope, session } from '#/test/fixtures'

function Identity() {
  const { user, isLoading } = useAuth()
  return (
    <p>
      {isLoading
        ? 'Loading identity'
        : user
          ? `${user.email}: ${user.id}`
          : 'Signed out'}
    </p>
  )
}

describe('authenticated identity lifecycle', () => {
  it('preserves the resolved agent ID when a refresh rotates tokens for the same account', async () => {
    saveSession(session)

    server.use(
      http.get(`${API_BASE_URL}/api/auth/me`, () =>
        HttpResponse.json(
          envelope({ userId: '42', email: session.email, role: session.role }),
        ),
      ),
    )

    render(
      <AuthProvider>
        <Identity />
      </AuthProvider>,
    )
    expect(await screen.findByText(`${session.email}: 42`)).toBeInTheDocument()
    act(() =>
      saveSession({
        ...session,
        token: 'rotated-token',
        refreshToken: 'rotated-refresh',
      }),
    )
    expect(screen.getByText(`${session.email}: 42`)).toBeInTheDocument()
    act(() => clearSession())
    expect(screen.getByText('Signed out')).toBeInTheDocument()
  })

  it('does not restore a delayed profile after sign-out', async () => {
    saveSession(session)
    let releaseProfile!: () => void
    const gate = new Promise<void>((resolve) => {
      releaseProfile = resolve
    })
    let requested = false
    server.use(
      http.get(`${API_BASE_URL}/api/auth/me`, async () => {
        requested = true
        await gate
        return HttpResponse.json(
          envelope({ userId: '42', email: session.email, role: session.role }),
        )
      }),
    )
    render(
      <AuthProvider>
        <Identity />
      </AuthProvider>,
    )
    await waitFor(() => expect(requested).toBe(true))
    act(() => clearSession())
    releaseProfile()
    expect(await screen.findByText('Signed out')).toBeInTheDocument()
  })
})
