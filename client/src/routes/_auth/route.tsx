import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex min-h-[calc(100svh-5rem)] items-center justify-center px-4 py-10">
      <Outlet />
    </div>
  )
}
