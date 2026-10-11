import { createFileRoute, Outlet } from '@tanstack/react-router'
import type { SearchSchemaInput } from '@tanstack/react-router'

export const Route = createFileRoute('/knowledge')({
  validateSearch: (search: { q?: unknown } & SearchSchemaInput) => ({
    q: typeof search.q === 'string' ? search.q : '',
  }),
  component: Outlet,
})
