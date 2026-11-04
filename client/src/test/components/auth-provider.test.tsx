import { render, screen, waitFor, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw/http'
import { API_BASE_URL } from '#/lib/http-client'
import { AuthProvider, useAuth } from '#/providers/auth-provider'
import { clearSession, saveSession, USER_KEY } from '#/services/auth-storage'
import { server } from '#/test/mocks/server'
import { envelope, session } from '#/test/fixtures'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => async () => {},
}))

function renderIdentity() {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Identity />
      </AuthProvider>
    </QueryClientProvider>,
  )
}

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
  it('preserves the resolved user ID when a refresh rotates tokens for the same account', async () => {
    saveSession(session)

    server.use(
      http.get(`${API_BASE_URL}/api/auth/me`, () =>
        HttpResponse.json(
          envelope({
            userId: session.userId,
            email: session.email,
            role: session.role,
          }),
        ),
      ),
    )

    renderIdentity()
    expect(
      await screen.findByText(`${session.email}: ${session.userId}`),
    ).toBeInTheDocument()
    act(() =>
      saveSession({
        ...session,
        token: 'rotated-token',
        refreshToken: 'rotated-refresh',
      }),
    )
    expect(
      screen.getByText(`${session.email}: ${session.userId}`),
    ).toBeInTheDocument()

    act(() => clearSession())

    expect(screen.getByText('Signed out')).toBeInTheDocument()
  })

  it('does not restore a delayed identity after sign-out', async () => {
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
          envelope({
            userId: session.userId,
            email: session.email,
            role: session.role,
          }),
        )
      }),
    )
    renderIdentity()

    await waitFor(() => expect(requested).toBe(true))

    act(() => clearSession())
    releaseProfile()
    expect(await screen.findByText('Signed out')).toBeInTheDocument()
  })

  it('restores a valid token when the stored identity predates user IDs', async () => {
    saveSession(session)

    window.localStorage.setItem(
      USER_KEY,
      JSON.stringify({ email: session.email, role: session.role }),
    )

    server.use(
      http.get(`${API_BASE_URL}/api/auth/me`, () =>
        HttpResponse.json(
          envelope({
            userId: session.userId,
            email: session.email,
            role: session.role,
          }),
        ),
      ),
    )

    renderIdentity()

    expect(
      await screen.findByText(`${session.email}: ${session.userId}`),
    ).toBeInTheDocument()
  })
})
