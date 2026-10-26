import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { http, HttpResponse } from 'msw/http'
import { API_BASE_URL } from '#/lib/http-client'
import { TicketConversation } from '#/components/tickets/ticket-conversation'
import { useTicketWorkspace } from '#/hooks/use-ticket-workspace'
import { WorkspaceProvider } from '#/providers/workspace-provider'
import { QueryProvider } from '#/providers/query-provider'
import { saveSession } from '#/services/auth-storage'
import { server } from '#/test/mocks/server'
import { envelope, session, ticket } from '#/test/fixtures'

vi.mock('#/providers/auth-provider', () => ({
  useAuth: () => ({
    user: { id: 1, email: 'seed.admin@example.test', role: 'Admin' },
    isAuthenticated: true,
  }),
}))

function ConversationHarness() {
  const ticketId = 1
  const workspace = useTicketWorkspace(ticketId)
  const [message, setMessage] = useState('')

  return (
    <>
      {workspace.notice && <p role="status">{workspace.notice}</p>}
      {workspace.actionError && <p role="alert">{workspace.actionError}</p>}
      <TicketConversation
        workspace={workspace}
        message={message}
        onMessage={setMessage}
      />
    </>
  )
}

function setupConversation(status = 200) {
  saveSession(session)
  const comments: {
    id: number
    message: string
    createdAt: string
    ticketId: number
    userId: number
  }[] = []
  let posts = 0
  server.use(
    http.get(`${API_BASE_URL}/api/tickets`, () =>
      HttpResponse.json(
        envelope({
          items: [ticket(1, { priority: 'High', status: 'Resolved' })],
          page: 1,
          pageSize: 50,
          totalCount: 1,
          totalPages: 1,
        }),
      ),
    ),
    http.get(`${API_BASE_URL}/api/knowledge`, () =>
      HttpResponse.json(envelope([])),
    ),
    http.get(`${API_BASE_URL}/api/tickets/1`, () =>
      HttpResponse.json(
        envelope(ticket(1, { priority: 'High', status: 'Resolved' })),
      ),
    ),
    http.get(`${API_BASE_URL}/api/tickets/1/history`, () =>
      HttpResponse.json(envelope([])),
    ),
    http.get(`${API_BASE_URL}/api/tickets/1/comments`, () =>
      HttpResponse.json(envelope(comments)),
    ),
    http.post(`${API_BASE_URL}/api/tickets/1/comments`, async ({ request }) => {
      posts++
      const { message } = (await request.json()) as { message: string }
      if (status !== 200)
        return HttpResponse.json(
          { title: 'Comment was not saved. Please retry.' },
          { status },
        )
      comments.push({
        id: 1,
        message,
        ticketId: 1,
        userId: 1,
        createdAt: '2026-10-11T12:00:00Z',
      })
      return new HttpResponse(null, { status: 200 })
    }),
  )
  render(
    <QueryProvider>
      <WorkspaceProvider>
        <ConversationHarness />
      </WorkspaceProvider>
    </QueryProvider>,
  )
  return { posts: () => posts, user: userEvent.setup() }
}

describe('ticket conversation with client services', () => {
  it('posts one trimmed comment, refreshes the conversation, and clears the draft only after success', async () => {
    const { user, posts } = setupConversation()
    const input = await screen.findByLabelText('Add a comment')
    expect(screen.getByRole('button', { name: 'Add comment' })).toBeDisabled()
    await user.type(input, '  Investigating the login issue now.  ')
    await user.click(screen.getByRole('button', { name: 'Add comment' }))

    expect(
      await screen.findByText('Investigating the login issue now.'),
    ).toBeInTheDocument()
    expect(await screen.findByRole('status')).toHaveTextContent('Comment added')
    await waitFor(() => expect(input).toHaveValue(''))
    expect(posts()).toBe(1)
  })

  it('preserves the draft and shows the API error after a failed comment', async () => {
    const { user, posts } = setupConversation(503)
    const input = await screen.findByLabelText('Add a comment')
    await user.type(input, 'Please investigate the login issue.')
    await user.click(screen.getByRole('button', { name: 'Add comment' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Comment was not saved',
    )
    expect(input).toHaveValue('Please investigate the login issue.')
    expect(posts()).toBe(1)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add comment' })).toBeEnabled()
  })

  it('keeps whitespace-only and short comments disabled and applies the server length limit', async () => {
    const { user, posts } = setupConversation()
    const input = await screen.findByLabelText('Add a comment')
    await user.type(input, '    ok    ')
    expect(screen.getByRole('button', { name: 'Add comment' })).toBeDisabled()
    expect(input).toHaveAttribute('maxlength', '1000')
    expect(posts()).toBe(0)
  })
})
