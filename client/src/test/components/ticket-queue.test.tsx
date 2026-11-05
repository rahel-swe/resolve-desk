import type { ComponentProps } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TicketQueue } from '#/components/tickets/ticket-queue'
import { ticket } from '#/test/fixtures'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    params,
    ...props
  }: ComponentProps<'a'> & { to: string; params?: { ticketId: string } }) => (
    <a href={params ? `/tickets/${params.ticketId}` : to} {...props} />
  ),
}))

describe('ticket workspace queue', () => {
  it('sorts, searches, and recovers from an empty result while marking the selected ticket', async () => {
    const user = userEvent.setup()
    render(
      <TicketQueue
        tickets={[ticket(1), ticket(2), ticket(3)]}
        selectedTicketId={2}
        loading={false}
        error=""
        isCustomer={false}
        onRetry={vi.fn()}
      />,
    )
    const queue = within(
      screen.getByRole('navigation', { name: 'Ticket queue' }),
    )

    expect(queue.getAllByRole('link')[0]).toHaveTextContent(
      'Sample request 003',
    )
    expect(queue.getByRole('link', { current: 'page' })).toHaveAttribute(
      'href',
      '/tickets/2',
    )

    await user.click(screen.getByRole('combobox', { name: 'Sort requests' }))
    await user.click(await screen.findByRole('option', { name: 'Oldest' }))
    expect(queue.getAllByRole('link')[0]).toHaveTextContent(
      'Sample request 001',
    )

    await user.type(
      screen.getByRole('textbox', { name: 'Search requests' }),
      'Sample request 002',
    )
    expect(queue.getAllByRole('link')).toHaveLength(1)
    await user.clear(screen.getByRole('textbox', { name: 'Search requests' }))
    await user.type(
      screen.getByRole('textbox', { name: 'Search requests' }),
      'missing request',
    )
    expect(
      screen.getByText('No requests match your search.'),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(queue.getAllByRole('link')).toHaveLength(3)
  })
})
