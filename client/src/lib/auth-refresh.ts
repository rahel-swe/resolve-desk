import { httpClient } from '#/lib/http-client'
import { isApiEnvelope } from '#/lib/api-response'
import { getRefreshToken, saveSession } from '#/services/auth-storage'
import type { StoredSession } from '#/services/auth-storage'

let pendingRefresh: Promise<string | null> | null = null

async function requestRefreshedToken() {
  const refreshToken = getRefreshToken()

  if (!refreshToken) return null

  const response = await httpClient.post<unknown>(
    '/api/auth/refresh',
    { refreshToken },
    { validateStatus: () => true },
  )

  if (getRefreshToken() !== refreshToken)
    throw new DOMException(
      'The session changed during token refresh.',
      'AbortError',
    )

  if (response.status < 200 || response.status >= 300) return null

  const payload = response.data

  if (isApiEnvelope<unknown>(payload) && !payload.isSuccess) return null

  const session = isApiEnvelope<StoredSession | null>(payload)
    ? payload.data
    : (payload as StoredSession | null)

  if (
    !session?.token ||
    !session.refreshToken ||
    !session.email ||
    !session.role
  )
    return null

  saveSession(session)

  return session.token
}

export function refreshAccessToken() {
  if (!pendingRefresh) {
    pendingRefresh = requestRefreshedToken().finally(() => {
      pendingRefresh = null
    })
  }

  return pendingRefresh
}
