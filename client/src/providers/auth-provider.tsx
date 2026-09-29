import {
  getCurrentUserProfile,
  getRefreshToken,
  logoutFromApi,
  registerWithApi,
  signInWithApi,
} from '#/services/auth-service'
import type { AuthResponse } from '#/services/auth-service'
import {
  SESSION_CHANGED_EVENT,
  getAuthToken,
  getCurrentUser,
  saveSession,
} from '#/services/auth-storage'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { PropsWithChildren } from 'react'

export type User = {
  id: number
  email: string
  role: 'Admin' | 'SupportAgent' | 'Customer' | 'User'
}

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<AuthResponse>
  register: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<AuthResponse>
  signOut: () => Promise<void>
  refresh: () => string | null
  reloadUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getStoredUserSnapshot(): User | null {
  const storedUser = getCurrentUser()

  if (!storedUser) return null

  return {
    id: 0,
    email: storedUser.email,
    role: storedUser.role as User['role'],
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User | null>(() => getStoredUserSnapshot())
  const [hasToken, setHasToken] = useState(() => Boolean(getAuthToken()))

  const syncFromStorage = useCallback(() => {
    setHasToken(Boolean(getAuthToken()))
    setUser(getStoredUserSnapshot())
  }, [])

  const reloadUser = useCallback(async () => {
    if (!getAuthToken()) {
      syncFromStorage()
      return
    }

    setIsLoading(true)

    try {
      const userData = await getCurrentUserProfile()
      setUser(userData)
      setHasToken(true)
    } catch {
      syncFromStorage()
    } finally {
      setIsLoading(false)
    }
  }, [syncFromStorage])

  useEffect(() => {
    void reloadUser()
  }, [reloadUser])

  useEffect(() => {
    window.addEventListener(SESSION_CHANGED_EVENT, syncFromStorage)
    window.addEventListener('storage', syncFromStorage)

    return () => {
      window.removeEventListener(SESSION_CHANGED_EVENT, syncFromStorage)
      window.removeEventListener('storage', syncFromStorage)
    }
  }, [syncFromStorage])

  const signIn = useCallback(
    async (email: string, password: string) => {
      const session = await signInWithApi(email, password)
      saveSession(session)
      setUser({
        id: 0,
        email: session.email,
        role: session.role as User['role'],
      })
      setHasToken(true)
      void reloadUser()

      return session
    },
    [reloadUser],
  )

  const register = useCallback(
    async (fullName: string, email: string, password: string) => {
      const session = await registerWithApi(fullName, email, password)
      saveSession(session)
      setUser({
        id: 0,
        email: session.email,
        role: session.role as User['role'],
      })
      setHasToken(true)
      void reloadUser()

      return session
    },
    [reloadUser],
  )

  const signOut = useCallback(async () => {
    await logoutFromApi()
    setUser(null)
    setHasToken(false)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      signIn,
      register,
      signOut,
      isLoading,
      refresh: getRefreshToken,
      isAuthenticated: hasToken,
      user,
      reloadUser,
    }),
    [hasToken, isLoading, reloadUser, register, signIn, signOut, user],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) throw new Error('useAuth must be used within AuthProvider')

  return context
}
