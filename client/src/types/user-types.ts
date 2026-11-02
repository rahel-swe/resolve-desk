export type AuthenticatedUser = {
  id: number
  email: string
  role: 'Admin' | 'SupportAgent' | 'Customer' | 'User'
}

export interface UserProfile {
  id: number
  fullName: string
  email: string
  role: AuthenticatedUser['role']
  //   role: 'Admin' | 'Agent' | 'Customer'
  bio: string | null
}

export interface UpdateUserProfileInput {
  fullName: string
  bio: string | null
}
