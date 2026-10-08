import {
  clearSession,
  getAuthToken,
  getRefreshToken,
  saveSession,
} from '#/services/auth-storage'
import type { StoredSession } from '#/services/auth-storage'

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

type ApiRequestOptions = RequestInit & {
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

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5051'

function buildHeaders(init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  const token = getAuthToken()

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (
    !headers.has('Content-Type') &&
    init.body &&
    typeof init.body === 'string'
  ) {
    headers.set('Content-Type', 'application/json')
  }

  return headers
}

async function parseResponsePayload(response: Response) {
  if (response.status === 204) return undefined

  const contentType = response.headers.get('content-type') ?? ''

  return contentType.includes('application/json') ||
    contentType.includes('+json')
    ? await response.json()
    : await response.text()
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

async function refreshAccessToken() {
  const refreshToken = getRefreshToken()

  if (!refreshToken) return null

  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) return null

  const payload = await response.json()
  const session = isApiEnvelope<StoredSession>(payload)
    ? payload.data
    : (payload as StoredSession)

  saveSession(session)

  return session.token
}

export async function apiRequestEnvelope<T>(
  path: string,
  init: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  const { skipAuthRefresh, ...requestInit } = init
  const headers = buildHeaders(requestInit)

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestInit,
    headers,
  })

  if (response.status === 401 && !skipAuthRefresh) {
    const newToken = await refreshAccessToken()

    if (!newToken) {
      clearSession()
      if (typeof window !== 'undefined') window.location.assign('/sign-in')

      throw new Error('Session expired. Please sign in again.')
    }

    const retryHeaders = new Headers(requestInit.headers)
    retryHeaders.set('Authorization', `Bearer ${newToken}`)

    return apiRequestEnvelope<T>(path, {
      ...requestInit,
      headers: retryHeaders,
      skipAuthRefresh: true,
    })
  }

  const payload = await parseResponsePayload(response)

  if (!response.ok) {
    if (response.status === 401) {
      clearSession()
    }

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
  init: ApiRequestOptions = {},
): Promise<T> {
  const response = await apiRequestEnvelope<T>(path, init)

  return response.data
}
