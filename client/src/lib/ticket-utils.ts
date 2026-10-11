export function formatTicketStatus(value: number) {
  switch (value) {
    case 0:
      return 'Open'
    case 1:
      return 'In Progress'
    case 2:
      return 'Waiting'
    case 3:
      return 'Resolved'
    case 4:
      return 'Closed'
    default:
      return 'Open'
  }
}

export function formatTicketPriority(value: number) {
  switch (value) {
    case 0:
      return 'Low'
    case 1:
      return 'Medium'
    case 2:
      return 'High'
    case 3:
      return 'Critical'
    default:
      return 'Medium'
  }
}

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

export function formatRelativeTime(value: string) {
  const timestamp = new Date(value).getTime()
  if (!Number.isFinite(timestamp)) return 'Unknown date'
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
  if (minutes < 10_080) return `${Math.floor(minutes / 1440)}d ago`
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(timestamp)
}

export function ticketCounts(tickets: { status: number }[]) {
  return [
    { label: 'Open', value: tickets.filter((ticket) => ticket.status === 0).length },
    { label: 'In progress', value: tickets.filter((ticket) => ticket.status === 1).length },
    { label: 'Waiting', value: tickets.filter((ticket) => ticket.status === 2).length },
    { label: 'Resolved', value: tickets.filter((ticket) => ticket.status >= 3).length },
  ]
}
