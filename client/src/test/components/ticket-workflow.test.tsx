import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TicketWorkflow } from '#/components/tickets/ticket-workflow'
import { ticket } from '#/test/fixtures'
import type { TicketWorkspace } from '#/hooks/use-ticket-workspace'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}))

function workspace(role: 'Admin' | 'Customer' = 'Admin'): TicketWorkspace {
  return {
    user: { id: 1, email: 'seed.admin@example.test', role },
    data: { ticket: ticket(1), comments: [], history: [] },
    loading: false,
    refresh: vi.fn(async () => {}),
    busy: '',
    actionError: '',
    notice: '',
    prioritySuggestion: null,
    responseSuggestion: null,
    assign: vi.fn(async () => true),
    updateStatus: vi.fn(async () => true),
    addComment: vi.fn(async () => true),
    suggestPriority: vi.fn(async () => true),
    suggestResponse: vi.fn(async () => true),
  }
}

describe('ticket details controls', () => {
  it('keeps staff, priority, and category previews local without saving them', async () => {
    const user = userEvent.setup()
    const actions = workspace()
    render(<TicketWorkflow workspace={actions} />)

    await user.click(screen.getByRole('combobox', { name: 'Assignee' }))
    await user.click(await screen.findByRole('option', { name: 'Noah Ellis' }))
    expect(
      screen.getByRole('combobox', { name: 'Assignee' }),
    ).toHaveTextContent('Noah Ellis')

    await user.click(screen.getByRole('combobox', { name: 'Priority' }))
    await user.click(await screen.findByRole('option', { name: 'Critical' }))
    expect(
      screen.getByRole('combobox', { name: 'Priority' }),
    ).toHaveTextContent('Critical')

    await user.click(screen.getByRole('combobox', { name: 'Category' }))
    await user.click(await screen.findByRole('option', { name: 'Billing' }))
    expect(
      screen.getByRole('combobox', { name: 'Category' }),
    ).toHaveTextContent('Billing')
    expect(actions.assign).not.toHaveBeenCalled()
    expect(actions.updateStatus).not.toHaveBeenCalled()
    expect(
      screen.getByText('Priority and assignee previews are not saved.'),
    ).toBeInTheDocument()
  })

  it('continues to save an allowed status transition', async () => {
    const user = userEvent.setup()
    const actions = workspace()
    render(<TicketWorkflow workspace={actions} />)

    await user.click(screen.getByRole('combobox', { name: 'Status' }))
    await user.click(await screen.findByRole('option', { name: 'In Progress' }))

    expect(actions.updateStatus).toHaveBeenCalledExactlyOnceWith('InProgress')
  })

  it('keeps customer controls read only and hides staff actions', () => {
    render(<TicketWorkflow workspace={workspace('Customer')} />)

    for (const label of ['Status', 'Priority', 'Assignee', 'Category'])
      expect(screen.getByRole('combobox', { name: label })).toBeDisabled()
    expect(
      screen.queryByRole('button', { name: 'Assign to me' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Suggest priority with AI' }),
    ).not.toBeInTheDocument()
  })
})
