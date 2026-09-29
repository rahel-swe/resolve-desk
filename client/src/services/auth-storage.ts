export type StoredUser = {
  email: string
  role: string
}

export type StoredSession = {
  token: string
  refreshToken: string
  email: string
  role: string
}

export const TOKEN_KEY = 'resolvedesk.token'
export const USER_KEY = 'resolvedesk.user'
export const REFRESH_TOKEN_KEY = 'resolvedesk.refreshToken'
export const SESSION_CHANGED_EVENT = 'resolvedesk:session-changed'

function notifySessionChanged() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT))
}

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
  return raw ? (JSON.parse(raw) as StoredUser) : null
}

export function saveSession(session: StoredSession) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(TOKEN_KEY, session.token)
  window.localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken)
  window.localStorage.setItem(
    USER_KEY,
    JSON.stringify({ email: session.email, role: session.role }),
  )

  notifySessionChanged()
}

export function clearSession() {
  if (typeof window === 'undefined') return

  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)

  clearReadableAuthCookies()
  notifySessionChanged()
}

function clearReadableAuthCookies() {
  if (typeof document === 'undefined') return

  for (const cookieName of [TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]) {
    document.cookie = `${cookieName}=; Max-Age=0; path=/`
  }
}
