import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomeRedirect,
})

function HomeRedirect() {
  return <Navigate to="/sign-in" replace />
}
