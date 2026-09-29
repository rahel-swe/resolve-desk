export type ApiResponse<T> = {
  isSuccess: boolean
  message: string
  data: T
}

type ApiEnvelope<T> = {
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

function isApiEnvelope<T>(payload: unknown): payload is ApiEnvelope<T> {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'isSuccess' in payload &&
    'data' in payload
  )
}

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:5051'

export const TOKEN_KEY = 'resolvedesk.token'
export const USER_KEY = 'resolvedesk.user'
export const REFRESH_TOKEN_KEY = 'resolvedesk.refreshToken'

export function getAuthToken() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

const getHeaders = (init: RequestInit = {}) => {
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

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = getHeaders()

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get('content-type') ?? ''
  const payload =
    contentType.includes('application/json') || contentType.includes('+json')
      ? await response.json()
      : await response.text()

  if (isApiEnvelope<T>(payload) && !payload.isSuccess) {
    throw new Error(payload.message || 'Request failed.')
  }

  if (!response.ok) {
    const problem = payload as ProblemDetails

    throw new Error(
      problem.detail ||
        problem.title ||
        `Request failed with status ${response.status}`,
    )
  }

  if (isApiEnvelope<T>(payload)) {
    return payload.data
  }

  return payload as T
}
