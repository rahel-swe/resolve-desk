import { createFileRoute } from '@tanstack/react-router'
import type { SearchSchemaInput } from '@tanstack/react-router'
import TicketsPage from '#/pages/tickets-page'

export const Route = createFileRoute('/tickets/')({
  validateSearch: (
    search: { q?: unknown; scope?: unknown } & SearchSchemaInput,
  ) => ({
    q: typeof search.q === 'string' ? search.q : '',
    scope:
      search.scope === 'mine' || search.scope === 'unassigned'
        ? search.scope
        : 'all',
  }),
  component: TicketsPage,
})
