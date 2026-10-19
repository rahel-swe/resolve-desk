import { getErrorMessage, readApiResponse } from '#/lib/api-response'
import { httpClient } from '#/lib/http-client'
import { clearSession, getAuthToken } from '#/services/auth-storage'
import type { AxiosRequestConfig } from 'axios'
import { AxiosHeaders } from 'axios'
import { refreshAccessToken } from './auth-refresh'

type ApiRequestOptions = Omit<AxiosRequestConfig<unknown>, 'url'> & {
  skipAuthRefresh?: boolean
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
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

    return apiRequest<T>(path, {
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

  return readApiResponse<T>(response)
}
