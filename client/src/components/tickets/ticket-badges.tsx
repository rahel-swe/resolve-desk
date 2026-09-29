import { Badge } from '#/components/ui/badge'
import { formatTicketPriority, formatTicketStatus } from '#/lib/api'
import type { ApiTicket } from '#/lib/api'
import { cn } from '#/lib/utils'

const statusClasses: Record<string, string> = {
  Open: 'bg-destructive/10 text-destructive ring-1 ring-destructive/20',
  'In Progress': 'bg-primary/10 text-primary ring-1 ring-primary/20',
  Waiting: 'bg-secondary text-secondary-foreground ring-1 ring-border',
  Resolved: 'bg-muted text-foreground ring-1 ring-border',
  Closed: 'bg-muted text-muted-foreground ring-1 ring-border',
}

const priorityClasses: Record<string, string> = {
  Low: 'bg-muted text-muted-foreground ring-1 ring-border',
  Medium: 'bg-secondary text-secondary-foreground ring-1 ring-border',
  High: 'bg-primary/10 text-primary ring-1 ring-primary/20',
  Critical: 'bg-destructive/10 text-destructive ring-1 ring-destructive/20',
}

export function TicketStatusBadge({
  status,
  className,
}: {
  status: ApiTicket['status']
  className?: string
}) {
  const label = formatTicketStatus(status)

  return (
    <Badge
      className={cn(
        'rounded-md px-2.5 py-1 normal-case tracking-normal',
        statusClasses[label],
        className,
      )}
    >
      {label}
    </Badge>
  )
}

export function TicketPriorityBadge({
  priority,
  className,
}: {
  priority: ApiTicket['priority']
  className?: string
}) {
  const label = formatTicketPriority(priority)

  return (
    <Badge
      className={cn(
        'rounded-md px-2.5 py-1 normal-case tracking-normal',
        priorityClasses[label],
        className,
      )}
    >
      {label}
    </Badge>
  )
}
