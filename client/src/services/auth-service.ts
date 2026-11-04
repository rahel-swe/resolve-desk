import { apiRequest } from '#/lib/api-request'
import {
  clearSession,
  getAuthToken,
  getStoredUserSnapshot,
  getRefreshToken,
  saveSession,
} from '#/services/auth-storage'
import type { AuthenticatedUser } from '#/types/user-types'

export type AuthResponse = {
  userId: number
  token: string
  email: string
  role: string
  refreshToken: string
}

export {
  clearSession,
  getAuthToken,
  getStoredUserSnapshot,
  getRefreshToken,
  saveSession,
}

export async function registerWithApi(
  fullName: string,
  email: string,
  password: string,
) {
  const session = await apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    data: { fullName, email, password },
    skipAuthRefresh: true,
  })
  // The registration contract issues only an access token. Obtain the same
  // renewable session as sign-in rather than expiring a new account after 15 minutes.
  return session.refreshToken ? session : signInWithApi(email, password)
}

export async function signInWithApi(email: string, password: string) {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    data: { email, password },
    skipAuthRefresh: true,
  })
}

export async function getCurrentAuthenticatedUser() {
  const profile = await apiRequest<{
    userId: number
    email: string
    role: AuthenticatedUser['role']
  }>('/api/auth/me')

  return {
    id: profile.userId,
    email: profile.email,
    role: profile.role,
  } satisfies AuthenticatedUser
}

export async function logoutFromApi() {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    clearSession()
    return
  }

  try {
    await apiRequest('/api/auth/logout', {
      method: 'POST',
      data: { refreshToken },
      skipAuthRefresh: true,
    })
  } finally {
    clearSession()
  }
}
