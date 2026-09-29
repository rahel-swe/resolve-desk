import { apiRequest } from '#/lib/api'
import type { User } from '#/providers/auth-provider'

export type AuthResponse = {
  token: string
  email: string
  role: string
  refreshToken: string
}

const TOKEN_KEY = 'resolvedesk.token'
const USER_KEY = 'resolvedesk.user'
const REFRESH_TOKEN_KEY = 'resolvedesk.refreshToken'

export function getAuthToken() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function getRefreshToken() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function getCurrentUser() {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(USER_KEY)
  return raw ? (JSON.parse(raw) as { email: string; role: string }) : null
}

export function clearSession() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
}

export async function registerWithApi(
  fullName: string,
  email: string,
  password: string,
) {
  return apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ fullName, email, password }),
  })
}

export async function signInWithApi(email: string, password: string) {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function saveSession(session: AuthResponse) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(TOKEN_KEY, session.token)
  window.localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken)
  window.localStorage.setItem(
    USER_KEY,
    JSON.stringify({ email: session.email, role: session.role }),
  )
}

export async function getCurrentUserProfile() {
  return apiRequest<User>('/api/auth/me')
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
    })
  } finally {
    clearSession()
  }
}
