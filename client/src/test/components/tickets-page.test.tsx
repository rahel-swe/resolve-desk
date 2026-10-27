import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { describe, expect, it, vi } from 'vitest'
import { http, HttpResponse } from 'msw/http'
import { API_BASE_URL } from '#/lib/http-client'
import { WorkspaceProvider } from '#/providers/workspace-provider'
import { QueryProvider } from '#/providers/query-provider'
import TicketsPage from '#/pages/tickets-page'
import { server } from '#/test/mocks/server'
import { envelope, session, ticket } from '#/test/fixtures'
import type { TicketStatus } from '#/types/ticket-enums'

vi.mock('#/providers/auth-provider', () => ({
  useAuth: () => ({
    user: { id: 1, email: 'seed.admin@example.test', role: 'Admin' },
    isAuthenticated: true,
    isLoading: false,
  }),
}))

const statuses: TicketStatus[] = [
  'Open',
  'InProgress',
  'WaitingForCustomer',
  'Resolved',
  'Closed',
]

async function renderQueue(count = 72) {
  const items = Array.from({ length: count }, (_, index) =>
    ticket(index + 1, {
      priority: 'High',
      status: statuses[index % statuses.length],
    }),
  )
  const backendPages: number[] = []

  server.use(
    http.get(`${API_BASE_URL}/api/tickets`, ({ request }) => {
      const page = Number(new URL(request.url).searchParams.get('page'))
      backendPages.push(page)

      return HttpResponse.json(
        envelope({
          items: items.slice((page - 1) * 50, page * 50),
          page,
          pageSize: 50,
          totalCount: count,
          totalPages: Math.ceil(count / 50),
        }),
      )
    }),

    http.get(`${API_BASE_URL}/api/knowledge`, () =>
      HttpResponse.json(envelope([])),
    ),
  )

  const root = createRootRoute({
    component: () => (
      <QueryProvider>
        <WorkspaceProvider>
          <Outlet />
        </WorkspaceProvider>
      </QueryProvider>
    ),
  })

  const route = createRoute({
    getParentRoute: () => root,
    path: '/tickets/',
    component: TicketsPage,
    validateSearch: (search: Record<string, unknown>) => ({
      q: typeof search.q === 'string' ? search.q : '',
      scope:
        search.scope === 'mine' || search.scope === 'unassigned'
          ? search.scope
          : 'all',
    }),
  })
  const router = createRouter({
    routeTree: root.addChildren([route]),
    history: createMemoryHistory({ initialEntries: ['/tickets/'] }),
  })

  render(<RouterProvider router={router} />)

  await router.load()

  if (count) await screen.findByRole('table')
  return { user: userEvent.setup(), items, backendPages }
}

function requestLinks() {
  return within(screen.getByRole('table')).getAllByRole('link')
}

describe('queue pagination and filtering through the client provider', () => {
  it('loads both backend pages and visits every UI page exactly once, including the final partial page', async () => {
    const { user, backendPages } = await renderQueue()
    expect(backendPages).toEqual([1, 2])
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    const seen = new Set<string>()
    for (let page = 1; page <= 8; page++) {
      expect(screen.getByText(`Page ${page} of 8`)).toBeInTheDocument()
      const links = requestLinks()
      expect(links.length).toBe(page === 8 ? 2 : 10)
      for (const link of links) {
        expect(seen.has(link.textContent)).toBe(false)
        seen.add(link.textContent)
      }
      if (page !== 8)
        await user.click(screen.getByRole('button', { name: 'Next page' }))
    }
    expect(seen.size).toBe(72)
    expect(screen.getByText('Showing 71–72 of 72 tickets')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Previous page' }))
    expect(screen.getByText('Page 7 of 8')).toBeInTheDocument()
  })

  it('resets pagination on search/scope/status changes and recovers from zero results', async () => {
    const { user, items } = await renderQueue()
    await user.click(screen.getByRole('button', { name: 'Next page' }))

    await user.type(
      screen.getByRole('textbox', { name: 'Search ticket queue' }),
      'Sample request 001',
    )
    await waitFor(() =>
      expect(screen.getByText('Page 1 of 1')).toBeInTheDocument(),
    )
    expect(requestLinks()).toHaveLength(1)
    await user.clear(
      screen.getByRole('textbox', { name: 'Search ticket queue' }),
    )
    await user.click(screen.getByRole('tab', { name: 'Unassigned' }))
    await waitFor(() =>
      expect(
        screen.getByText('Showing 1–10 of 24 tickets'),
      ).toBeInTheDocument(),
    )

    expect(
      requestLinks().every(
        (link) => Number(link.textContent.match(/\d+/)?.[0]) % 3 === 0,
      ),
    ).toBe(true)

    await user.click(screen.getByRole('tab', { name: 'Assigned to me' }))

    await waitFor(() =>
      expect(
        screen.getByText(
          `Showing 1–10 of ${items.filter((item) => item.assignedAgentEmail === session.email).length} tickets`,
        ),
      ).toBeInTheDocument(),
    )

    await user.click(screen.getByRole('combobox', { name: 'Filter by status' }))
    await user.click(await screen.findByRole('option', { name: /^Open$/ }))

    await waitFor(() =>
      expect(screen.getByText('Page 1 of 1')).toBeInTheDocument(),
    )
    await user.type(
      screen.getByRole('textbox', { name: 'Search ticket queue' }),
      'absent-request',
    )
    expect(await screen.findByText('No matching tickets')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Next page' }),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(await screen.findByText('Page 1 of 8')).toBeInTheDocument()
    expect(
      screen.getByRole('combobox', { name: 'Filter by status' }),
    ).toHaveTextContent('All statuses')
  })

  it('shows an empty state with no misleading pagination', async () => {
    await renderQueue(0)
    expect(await screen.findByText('A fresh start')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Next page' }),
    ).not.toBeInTheDocument()
  })
})
