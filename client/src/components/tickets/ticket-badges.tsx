import { Badge } from '#/components/ui/badge'
import { formatTicketPriority, formatTicketStatus } from '#/lib/ticket-utils'
import { cn } from '#/lib/utils'
import type { ApiTicket } from '#/services/ticket-service'
import { CircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

const statusClasses: Record<string, string> = {
  Open: 'bg-chart-1/15 text-chart-1',
  'In Progress': 'bg-chart-1/15 text-chart-1',
  Waiting: 'bg-chart-2/15 text-chart-2',
  Resolved: 'bg-chart-3/15 text-chart-3',
  Closed: 'bg-muted text-muted-foreground ring-1 ring-border',
}

const priorityClasses: Record<string, string> = {
  Low: 'text-chart-3',
  Medium: 'text-chart-1',
  High: 'text-chart-2',
  Critical: 'text-primary',
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
        'px-2.5 py-1 text-[11px] font-medium normal-case tracking-normal',
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
        'gap-2 text-[11px] font-medium normal-case tracking-normal',
        priorityClasses[label],
        className,
      )}
    >
      <HugeiconsIcon
        icon={CircleIcon}
        fill="currentColor"
        className="size-2!"
      />
      {label}
    </Badge>
  )
}
