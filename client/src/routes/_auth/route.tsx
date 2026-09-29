import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4">
      <Outlet />
    </main>
  )
}
