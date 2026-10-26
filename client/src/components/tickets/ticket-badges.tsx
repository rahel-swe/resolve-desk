import { Badge } from '#/components/ui/badge'
import { formatTicketPriority, formatTicketStatus } from '#/lib/ticket-utils'
import { cn } from '#/lib/utils'
import type { ApiTicket } from '#/services/ticket-service'
import type { TicketPriority, TicketStatus } from '#/types/ticket-enums'
import { CircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

const statusClasses: Record<TicketStatus, string> = {
  Open: 'bg-chart-1/15 text-chart-1',
  InProgress: 'bg-chart-1/15 text-chart-1',
  WaitingForCustomer: 'bg-chart-2/15 text-chart-2',
  Resolved: 'bg-chart-3/15 text-chart-3',
  Closed: 'bg-muted text-muted-foreground ring-1 ring-border',
}

const priorityClasses: Record<TicketPriority, string> = {
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
  return (
    <Badge
      className={cn(
        'px-2.5 py-1 text-[11px] font-medium normal-case tracking-normal',
        statusClasses[status],
        className,
      )}
    >
      {formatTicketStatus(status)}
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
  return (
    <Badge
      className={cn(
        'gap-2 text-[11px] font-medium normal-case tracking-normal',
        priorityClasses[priority],
        className,
      )}
    >
      <HugeiconsIcon
        icon={CircleIcon}
        fill="currentColor"
        className="size-2!"
      />
      {formatTicketPriority(priority)}
    </Badge>
  )
}
