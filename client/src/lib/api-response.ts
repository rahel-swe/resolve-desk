import type { AxiosResponse } from 'axios'

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

export function isApiEnvelope<T>(payload: unknown): payload is ApiResponse<T> {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'isSuccess' in payload &&
    'message' in payload &&
    'data' in payload
  )
}

export function getErrorMessage(payload: unknown, status: number) {
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

export function readApiResponse<T>(response: AxiosResponse<unknown>): T {
  const { status, data } = response

  if (status < 200 || status >= 300) {
    throw new Error(getErrorMessage(data, status))
  }

  if (status === 204) return undefined as T

  if (isApiEnvelope<T>(data)) {
    if (!data.isSuccess) {
      throw new Error(data.message || 'Request failed.')
    }

    return data.data
  }

  return data as T
}
