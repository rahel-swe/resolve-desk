import { apiRequest } from '#/lib/api'
import {
  clearSession,
  getAuthToken,
  getCurrentUser,
  getRefreshToken,
  saveSession,
} from '#/services/auth-storage'
import type { User } from '#/providers/auth-provider'

export type AuthResponse = {
  token: string
  email: string
  role: string
  refreshToken: string
}

export {
  clearSession,
  getAuthToken,
  getCurrentUser,
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
    body: JSON.stringify({ fullName, email, password }),
    skipAuthRefresh: true,
  })
  // The registration contract issues only an access token. Obtain the same
  // renewable session as sign-in rather than expiring a new account after 15 minutes.
  return session.refreshToken ? session : signInWithApi(email, password)
}

export async function signInWithApi(email: string, password: string) {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    skipAuthRefresh: true,
  })
}

export async function getCurrentUserProfile() {
  const profile = await apiRequest<{
    userId: string
    email: string
    role: User['role']
  }>('/api/auth/me')

  return {
    id: Number(profile.userId),
    email: profile.email,
    role: profile.role,
  } satisfies User
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
      body: JSON.stringify({ refreshToken }),
      skipAuthRefresh: true,
    })
  } finally {
    clearSession()
  }
}
