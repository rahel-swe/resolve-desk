import { describe, expect, it, vi } from 'vitest'
import {
  clearSession,
  getAuthToken,
  getCurrentUser,
  getRefreshToken,
  saveSession,
  SESSION_CHANGED_EVENT,
  USER_KEY,
} from '#/services/auth-storage'
import { session } from '#/test/fixtures'

describe('session storage', () => {
  it('stores and clears one complete session and notifies the app', () => {
    const listener = vi.fn()
    window.addEventListener(SESSION_CHANGED_EVENT, listener)
    try {
      saveSession(session)
      expect(getAuthToken()).toBe(session.token)
      expect(getRefreshToken()).toBe(session.refreshToken)
      expect(getCurrentUser()).toEqual({
        email: session.email,
        role: session.role,
      })
      clearSession()
      expect(getAuthToken()).toBeNull()
      expect(getRefreshToken()).toBeNull()
      expect(getCurrentUser()).toBeNull()
      expect(listener).toHaveBeenCalledTimes(2)
    } finally {
      window.removeEventListener(SESSION_CHANGED_EVENT, listener)
    }
  })

  it.each([
    '{broken',
    'null',
    '{}',
    '{"email":false,"role":"Admin"}',
    '{"email":"user@example.test","role":"Owner"}',
  ])('recovers from malformed stored identity %s', (value) => {
    window.localStorage.setItem(USER_KEY, value)
    expect(getCurrentUser()).toBeNull()
    expect(window.localStorage.getItem(USER_KEY)).toBeNull()
  })
})
