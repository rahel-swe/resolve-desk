import { profileKeys } from '#/queries/keys/profile-keys'
import {
  getCurrentAuthenticatedUser,
  getRefreshToken,
  logoutFromApi,
  registerWithApi,
  signInWithApi,
} from '#/services/auth-service'
import type { AuthResponse } from '#/services/auth-service'
import {
  SESSION_CHANGED_EVENT,
  getAuthToken,
  getStoredUserSnapshot,
  saveSession,
} from '#/services/auth-storage'
import type { AuthenticatedUser } from '#/types/user-types'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { PropsWithChildren } from 'react'

type AuthContextValue = {
  user: AuthenticatedUser | null
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
  isSigningOutPending: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  // Start with the same snapshot during SSR and hydration, then restore the session.
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<AuthenticatedUser | null>(null)
  const [hasToken, setHasToken] = useState(false)
  const [isSigningOutPending, setIsSigningOutPending] = useState(false)
  const queryClient = useQueryClient()

  const navigate = useNavigate()

  const syncFromStorage = useCallback(() => {
    setHasToken(Boolean(getAuthToken()))
    const stored = getStoredUserSnapshot()

    setUser((current) =>
      current &&
      stored &&
      current.id === stored.id &&
      current.email === stored.email &&
      current.role === stored.role
        ? current
        : stored,
    )
  }, [])

  const reloadUser = useCallback(async () => {
    if (!getAuthToken()) {
      syncFromStorage()
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      const userData = await getCurrentAuthenticatedUser()

      const stored = getStoredUserSnapshot()
      if (!getAuthToken() || (stored && userData.email !== stored.email)) return
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
        id: session.userId,
        email: session.email,
        role: session.role as AuthenticatedUser['role'],
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
        id: session.userId,
        email: session.email,
        role: session.role as AuthenticatedUser['role'],
      })
      setHasToken(true)

      void reloadUser()

      return session
    },
    [reloadUser],
  )

  const signOut = useCallback(async () => {
    setIsSigningOutPending(true)
    try {
      await logoutFromApi()
    } catch {
      // logoutFromApi clears the local session even if the server is unavailable.
    } finally {
      queryClient.removeQueries({
        queryKey: profileKeys.all,
      })
      setUser(null)
      setHasToken(false)
      setIsSigningOutPending(false)
    }
    await navigate({ to: '/sign-in', replace: true })
  }, [navigate, queryClient])

  const value = useMemo<AuthContextValue>(
    () => ({
      signIn,
      register,
      signOut,
      isSigningOutPending,
      isLoading,
      refresh: getRefreshToken,
      isAuthenticated: hasToken,
      user,
      reloadUser,
    }),
    [
      hasToken,
      isLoading,
      reloadUser,
      register,
      signIn,
      signOut,
      user,
      isSigningOutPending,
    ],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) throw new Error('useAuth must be used within AuthProvider')

  return context
}
