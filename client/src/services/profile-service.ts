import { apiRequest } from '#/lib/api-request'
import type { UpdateUserProfileInput, UserProfile } from '#/types/user-types'

export function getMyProfile(signal?: AbortSignal) {
  return apiRequest<UserProfile>('/api/users/me', {
    method: 'GET',
    signal,
  })
}

export function updateMyProfile(input: UpdateUserProfileInput) {
  return apiRequest<UserProfile>('/api/users/me', {
    method: 'PATCH',
    data: input,
  })
}
