import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '#/providers/auth-provider'

export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !isAuthenticated)
      void navigate({ to: '/sign-in', replace: true })
  }, [isAuthenticated, isLoading, navigate])

  return isAuthenticated
}
