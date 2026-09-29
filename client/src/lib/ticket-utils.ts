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
