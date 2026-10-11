import { Link } from '@tanstack/react-router'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import {
  TicketPriorityBadge,
  TicketStatusBadge,
} from '#/components/tickets/ticket-badges'
import { formatDateTime, formatRelativeTime } from '#/lib/ticket-utils'
import { displayName } from '#/lib/user-utils'
import type { ApiTicket } from '#/services/ticket-service'

export function TicketTable({
  tickets,
  compact = false,
}: {
  tickets: ApiTicket[]
  compact?: boolean
}) {
  return (
    <Table className="table-fixed min-w-[630px]">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-24 pl-0 text-[10px] tracking-wider text-muted-foreground uppercase">
            Priority
          </TableHead>
          <TableHead
            className={
              compact
                ? 'w-[36%] text-[10px] tracking-wider text-muted-foreground uppercase'
                : 'w-[32%] text-[10px] tracking-wider text-muted-foreground uppercase'
            }
          >
            Ticket
          </TableHead>
          <TableHead className="text-[10px] tracking-wider text-muted-foreground uppercase">
            Requester
          </TableHead>
          <TableHead className="w-28 text-[10px] tracking-wider text-muted-foreground uppercase">
            Status
          </TableHead>
          {!compact && (
            <TableHead className="text-[10px] tracking-wider text-muted-foreground uppercase">
              Assignee
            </TableHead>
          )}
          <TableHead className="w-24 pr-0 text-right text-[10px] tracking-wider text-muted-foreground uppercase">
            Created
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tickets.map((ticket) => (
          <TableRow key={ticket.id} className="group">
            <TableCell className="py-5 pl-0">
              <TicketPriorityBadge priority={ticket.priority} />
            </TableCell>
            <TableCell className="py-5">
              <Link
                to="/tickets/$ticketId"
                params={{ ticketId: String(ticket.id) }}
                className="block truncate font-medium transition-colors group-hover:text-primary hover:underline"
                title={ticket.title}
              >
                {ticket.title}
              </Link>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {!compact && <span>#{ticket.id} · </span>}
                {ticket.description}
              </p>
            </TableCell>
            <TableCell className="py-5">
              <p className="truncate text-xs" title={ticket.createdByEmail}>
                {displayName(ticket.createdByEmail)}
              </p>
              <p
                className="mt-1 truncate text-[11px] text-muted-foreground"
                title={ticket.createdByEmail}
              >
                {ticket.createdByEmail}
              </p>
            </TableCell>
            <TableCell className="py-5">
              <TicketStatusBadge status={ticket.status} />
            </TableCell>
            {!compact && (
              <TableCell
                className="truncate py-5 text-xs text-muted-foreground"
                title={ticket.assignedAgentEmail || 'Unassigned'}
              >
                {ticket.assignedAgentEmail
                  ? displayName(ticket.assignedAgentEmail)
                  : 'Unassigned'}
              </TableCell>
            )}
            <TableCell className="py-5 pr-0 text-right text-xs text-muted-foreground">
              <time
                dateTime={ticket.createdAt}
                title={formatDateTime(ticket.createdAt)}
              >
                {formatRelativeTime(ticket.createdAt)}
              </time>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
