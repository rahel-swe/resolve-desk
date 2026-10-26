import type { TicketPriority, TicketStatus } from '#/types/ticket-enums'

export function formatDateTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function formatTicketStatus(value: TicketStatus) {
  switch (value) {
    case 'Open':
      return 'Open'
    case 'InProgress':
      return 'In Progress'
    case 'WaitingForCustomer':
      return 'Waiting'
    case 'Resolved':
      return 'Resolved'
    case 'Closed':
      return 'Closed'
    default:
      return 'Open'
  }
}

export function formatTicketPriority(value: TicketPriority) {
  switch (value) {
    case 'Low':
      return 'Low'
    case 'Medium':
      return 'Medium'
    case 'High':
      return 'High'
    case 'Critical':
      return 'Critical'
    default:
      return 'Medium'
  }
}

export function formatRelativeTime(value: string) {
  const timestamp = new Date(value).getTime()
  if (!Number.isFinite(timestamp)) return 'Unknown date'
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
  if (minutes < 10_080) return `${Math.floor(minutes / 1440)}d ago`
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(timestamp)
}

export function ticketCounts(tickets: { status: TicketStatus }[]) {
  return [
    {
      label: 'Open',
      value: tickets.filter((ticket) => ticket.status === 'Open').length,
    },
    {
      label: 'In progress',
      value: tickets.filter((ticket) => ticket.status === 'InProgress').length,
    },
    {
      label: 'Waiting',
      value: tickets.filter((ticket) => ticket.status === 'WaitingForCustomer')
        .length,
    },
    {
      label: 'Resolved',
      value: tickets.filter((ticket) => ticket.status === 'Resolved').length,
    },
  ]
}
