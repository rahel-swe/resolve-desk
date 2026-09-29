import {
  getCurrentUserProfile,
  getRefreshToken,
  signInWithApi,
} from '#/components/services/auth-service'
import type { AuthResponse } from '#/components/services/auth-service'
import { logoutFromApi } from '#/lib/api'
import { createContext, useCallback, useContext, useState } from 'react'
import type { PropsWithChildren } from 'react'

export type User = {
  id: number
  name: string
  email: string
  role: 'Admin' | 'SupportAgent' | 'Customer'
}

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<AuthResponse>
  signOut: () => Promise<void>
  refresh: () => string | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useCallback(async () => {
    setIsLoading(true)
    try {
      const userData = await getCurrentUserProfile()
      setUser(userData)
    } catch (error) {
      console.log('Auth provider error', error)
    } finally {
      setIsLoading(false)
    }
    getCurrentUserProfile()
  }, [])

  return (
    <AuthContext
      value={{
        signIn: signInWithApi,
        isLoading,
        refresh: getRefreshToken,
        isAuthenticated: !!user,
        signOut: logoutFromApi,
        user,
      }}
    >
      {children}
    </AuthContext>
  )
}

const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) throw new Error('useAuth must be used within AuthProvider')

  return context
}
