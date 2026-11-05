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
    expect(screen.getByRole('button', { name: 'Send reply' })).toBeDisabled()
    await user.type(input, '  Investigating the login issue now.  ')
    await user.click(screen.getByRole('button', { name: 'Send reply' }))

    expect(
      await screen.findByText('Investigating the login issue now.'),
    ).toBeInTheDocument()
    expect(await screen.findByRole('status')).toHaveTextContent('Comment added')
    await waitFor(() => expect(input).toHaveValue(''))
    expect(posts()).toBe(1)
    await user.click(input)
    await user.keyboard('{Control>}z{/Control}')
    expect(input).toHaveValue('')
  })

  it('preserves the draft and shows the API error after a failed comment', async () => {
    const { user, posts } = setupConversation(503)
    const input = await screen.findByLabelText('Add a comment')
    await user.type(input, 'Please investigate the login issue.')
    await user.click(screen.getByRole('button', { name: 'Send reply' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Comment was not saved',
    )
    expect(input).toHaveValue('Please investigate the login issue.')
    expect(posts()).toBe(1)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send reply' })).toBeEnabled()
  })

  it('keeps whitespace-only and short comments disabled and applies the server length limit', async () => {
    const { user, posts } = setupConversation()
    const input = await screen.findByLabelText('Add a comment')
    await user.type(input, '    ok    ')
    expect(screen.getByRole('button', { name: 'Send reply' })).toBeDisabled()
    expect(input).toHaveAttribute('maxlength', '1000')
    expect(posts()).toBe(0)
  })

  it('formats selected text and previews it without losing the draft', async () => {
    const { user, posts } = setupConversation()
    const input =
      await screen.findByLabelText<HTMLTextAreaElement>('Add a comment')
    await user.type(input, 'We can help with this.')
    input.setSelectionRange(0, 2)
    await user.click(screen.getByRole('button', { name: 'Bold' }))
    expect(input).toHaveValue('**We** can help with this.')

    await user.click(screen.getByRole('button', { name: 'Preview' }))
    expect(screen.getByText('We', { selector: 'strong' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Write' }))
    expect(screen.getByLabelText('Add a comment')).toHaveValue(
      '**We** can help with this.',
    )
    expect(posts()).toBe(0)
  })

  it('renders Markdown in both the preview and the saved reply', async () => {
    const { user, posts } = setupConversation()
    const input = await screen.findByLabelText('Add a comment')
    const markdown =
      '## Troubleshooting\n\n- **Check** your email\n- Try _again_\n\n[Help guide](https://example.com/help)\n\n> Keep your password private.\n\nUse `private mode`. ~~Old advice~~\n\n| Step | Result |\n| --- | --- |\n| Sign in | Done |'
    await user.click(input)
    await user.paste(markdown)
    await user.click(screen.getByRole('button', { name: 'Preview' }))
    expect(
      screen.getByRole('heading', { name: 'Troubleshooting', level: 2 }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Check', { selector: 'strong' }),
    ).toBeInTheDocument()
    expect(screen.getByText('again', { selector: 'em' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Help guide' })).toHaveAttribute(
      'href',
      'https://example.com/help',
    )
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(
      screen.getByText('Old advice', { selector: 'del' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Send reply' }))
    await screen.findByRole('status')
    expect(
      screen.getByRole('heading', { name: 'Troubleshooting', level: 2 }),
    ).toBeInTheDocument()
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByLabelText('Add a comment')).toHaveValue('')
    expect(posts()).toBe(1)
  })

  it.each([
    ['- Check your email', '- Check your email\n- '],
    ['9. Check your email', '9. Check your email\n10. '],
    ['- [x] Check your email', '- [x] Check your email\n- [ ] '],
    ['> Previous reply', '> Previous reply\n> '],
  ])(
    'continues %j with Enter and exits an empty item',
    async (initial, continued) => {
      const { user, posts } = setupConversation()
      const input = await screen.findByLabelText('Add a comment')
      await user.click(input)
      await user.paste(initial)
      await user.keyboard('{Enter}')
      expect(input).toHaveValue(continued)
      await user.keyboard('{Enter}')
      expect(input).toHaveValue(initial + '\n')
      expect(posts()).toBe(0)
    },
  )

  it('indents lists, allows a plain newline, and offers an escape from Tab indentation', async () => {
    const { user } = setupConversation()
    const input = await screen.findByLabelText('Add a comment')
    await user.click(input)
    await user.paste('- First item')
    await user.keyboard('{Tab}')
    expect(input).toHaveValue('    - First item')
    await user.keyboard('{Shift>}{Tab}{/Shift}')
    expect(input).toHaveValue('- First item')
    await user.keyboard('{Shift>}{Enter}{/Shift}')
    expect(input).toHaveValue('- First item\n')
    await user.keyboard('{Backspace}{Escape}{Tab}')
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveFocus()
    expect(input).toHaveValue('- First item')
  })

  it('supports formatting shortcuts, toggling, undo, and redo with the original selection', async () => {
    const { user } = setupConversation()
    const input =
      await screen.findByLabelText<HTMLTextAreaElement>('Add a comment')
    await user.click(input)
    await user.paste('Retry signing in')
    input.setSelectionRange(0, 5)
    await user.keyboard('{Control>}b{/Control}')
    expect(input).toHaveValue('**Retry** signing in')
    expect(input.value.slice(input.selectionStart, input.selectionEnd)).toBe(
      'Retry',
    )
    await user.keyboard('{Control>}z{/Control}')
    expect(input).toHaveValue('Retry signing in')
    await user.keyboard('{Control>}{Shift>}z{/Shift}{/Control}')
    expect(input).toHaveValue('**Retry** signing in')
    await user.keyboard('{Control>}b{/Control}')
    expect(input).toHaveValue('Retry signing in')
    await user.keyboard('{Meta>}i{/Meta}')
    expect(input).toHaveValue('_Retry_ signing in')
  })

  it('applies checklist formatting from the menu and keeps editing at the textarea', async () => {
    const { user } = setupConversation()
    const input =
      await screen.findByLabelText<HTMLTextAreaElement>('Add a comment')
    await user.click(input)
    await user.paste('Check email\nReset password')
    input.setSelectionRange(0, input.value.length)
    await user.click(screen.getByRole('button', { name: 'More formatting' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Checklist' }))
    expect(input).toHaveValue('- [ ] Check email\n- [ ] Reset password')
    await waitFor(() => expect(input).toHaveFocus())
    await user.click(screen.getByRole('button', { name: 'Preview' }))
    expect(screen.getAllByRole('checkbox')).toHaveLength(2)
    expect(screen.getAllByRole('checkbox')[0]).toBeDisabled()
  })

  it('keeps the bold shortcut from reaching the app sidebar shortcut', async () => {
    const { user } = setupConversation()
    const input = await screen.findByLabelText('Add a comment')
    await user.type(input, 'Retry signing in')
    const globalShortcut = vi.fn<(event: KeyboardEvent) => void>()
    document.addEventListener('keydown', globalShortcut)
    try {
      await user.keyboard('{Control>}b{/Control}')
      expect(input).toHaveValue('Retry signing in**text**')
      expect(
        globalShortcut.mock.calls.some(([event]) => event.key === 'b'),
      ).toBe(false)
    } finally {
      document.removeEventListener('keydown', globalShortcut)
    }
  })

  it('rejects formatting beyond the reply limit without losing the draft', async () => {
    const { user } = setupConversation()
    const input =
      await screen.findByLabelText<HTMLTextAreaElement>('Add a comment')
    await user.click(input)
    await user.paste('a'.repeat(1000))
    input.setSelectionRange(0, 5)
    await user.keyboard('{Control>}b{/Control}')
    expect(input).toHaveValue('a'.repeat(1000))
    expect(
      screen.getByText(/would exceed the 1,000-character reply limit/),
    ).toBeInTheDocument()
  })

  it('undoes typing and automatic list continuation separately, including after switching to preview', async () => {
    const { user } = setupConversation()
    const input = await screen.findByLabelText('Add a comment')
    await user.type(input, '- First')
    await user.keyboard('{Enter}')
    expect(input).toHaveValue('- First\n- ')
    await user.click(screen.getByRole('button', { name: 'Preview' }))
    await user.click(screen.getByRole('button', { name: 'Write' }))
    const restored = screen.getByLabelText('Add a comment')
    expect(restored).toHaveFocus()
    await user.keyboard('{Control>}z{/Control}')
    expect(restored).toHaveValue('- First')
    await user.keyboard('{Control>}z{/Control}')
    expect(restored).toHaveValue('')
  })
})
