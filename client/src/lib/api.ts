import {
  clearSession,
  getAuthToken,
  getRefreshToken,
  saveSession,
} from '#/services/auth-storage'
import type { StoredSession } from '#/services/auth-storage'
import { httpClient } from '#/lib/http-client'
import { AxiosHeaders } from 'axios'
import type { AxiosRequestConfig } from 'axios'

export type ApiResponse<T> = {
  isSuccess: boolean
  message: string
  data: T
}

type ProblemDetails = {
  title?: string
  detail?: string
  status?: number
  traceId?: string
}

type ApiRequestOptions = Omit<AxiosRequestConfig<unknown>, 'url'> & {
  skipAuthRefresh?: boolean
}

function isApiEnvelope<T>(payload: unknown): payload is ApiResponse<T> {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'isSuccess' in payload &&
    'message' in payload &&
    'data' in payload
  )
}

function getErrorMessage(payload: unknown, status: number) {
  if (isApiEnvelope<unknown>(payload)) {
    return payload.message || `Request failed with status ${status}`
  }

  if (typeof payload === 'object' && payload !== null) {
    const problem = payload as ProblemDetails
    return (
      problem.detail || problem.title || `Request failed with status ${status}`
    )
  }

  if (typeof payload === 'string' && payload.trim()) {
    return payload
  }

  return `Request failed with status ${status}`
}

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

  // A completed refresh must not restore a session after sign-out or account switching.
  if (getRefreshToken() !== refreshToken)
    throw new DOMException(
      'The session changed during token refresh.',
      'AbortError',
    )

  saveSession(session)

  return session.token
}

function refreshAccessToken() {
  if (!pendingRefresh)
    pendingRefresh = requestRefreshedToken().finally(() => {
      pendingRefresh = null
    })

  return pendingRefresh
}

export async function apiRequestEnvelope<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  const { skipAuthRefresh, ...requestConfig } = options

  const response = await httpClient.request<unknown>({
    ...requestConfig,
    url: path,
    validateStatus: () => true,
  })

  if (response.status === 401 && !skipAuthRefresh) {
    const currentToken = getAuthToken()
    const sentAuthorization = response.config.headers.get('Authorization')

    // A slower 401 can arrive after another request already rotated the token.
    const newToken =
      currentToken && sentAuthorization !== `Bearer ${currentToken}`
        ? currentToken
        : await refreshAccessToken()

    if (!newToken) {
      clearSession()
      if (typeof window !== 'undefined') window.location.assign('/sign-in')

      throw new Error('Session expired. Please sign in again.')
    }

    const retryHeaders = new AxiosHeaders(response.config.headers)
    retryHeaders.setAuthorization(`Bearer ${newToken}`)

    return apiRequestEnvelope<T>(path, {
      ...requestConfig,
      headers: retryHeaders,
      skipAuthRefresh: true,
    })
  }

  const payload = response.status === 204 ? undefined : response.data

  if (response.status < 200 || response.status >= 300) {
    if (response.status === 401) clearSession()

    throw new Error(getErrorMessage(payload, response.status))
  }

  if (isApiEnvelope<T>(payload)) {
    if (!payload.isSuccess) {
      throw new Error(payload.message || 'Request failed.')
    }

    return payload
  }

  return {
    isSuccess: true,
    message: 'Request completed successfully.',
    data: payload as T,
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const response = await apiRequestEnvelope<T>(path, options)

  return response.data
}
