import { Navigate, createFileRoute } from '@tanstack/react-router'
import { useAuth } from '#/providers/auth-provider'

export const Route = createFileRoute('/')({
  component: HomeRedirect,
})

function HomeRedirect() {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  return <Navigate to={isAuthenticated ? '/dashboard' : '/sign-in'} replace />
}
