import type { updateUserProfileSchema } from '#/schemas/user-schemas'
import type { z } from 'zod'

export type AuthenticatedUser = {
  id: number
  email: string
  role: 'Admin' | 'Staff' | 'Customer'
}

export interface UserProfile {
  id: number
  fullName: string
  email: string
  role: AuthenticatedUser['role']
  bio: string | null
}

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>
