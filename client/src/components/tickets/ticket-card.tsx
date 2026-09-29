import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  TicketPriorityBadge,
  TicketStatusBadge,
} from '#/components/tickets/ticket-badges'
import { formatDateTime } from '#/lib/api'
import { Link } from '@tanstack/react-router'
import type { ApiTicket } from '#/services/ticket-service'

export function TicketCard({ ticket }: { ticket: ApiTicket }) {
  return (
    <Card className="border-border bg-card shadow-sm transition-colors hover:ring-foreground/10">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <CardDescription className="text-xs tracking-[0.18em]">
              Ticket #{ticket.id}
            </CardDescription>
            <CardTitle className="mt-2 text-xl normal-case tracking-normal">
              {ticket.title}
            </CardTitle>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.priority} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="line-clamp-2 leading-7 text-foreground/90">
          {ticket.description}
        </p>

        <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
          <div>
            <div className="text-xs uppercase tracking-[0.16em]">Requester</div>
            <div className="mt-1 truncate font-medium text-foreground">
              {ticket.createdByEmail || 'Unknown'}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.16em]">Assigned</div>
            <div className="mt-1 truncate font-medium text-foreground">
              {ticket.assignedAgentEmail || 'Unassigned'}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.16em]">Created</div>
            <div className="mt-1 font-medium text-foreground">
              {formatDateTime(ticket.createdAt)}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Link
            to="/tickets/$ticketId"
            params={{ ticketId: String(ticket.id) }}
          >
            <Button variant="secondary" size="sm">
              Open ticket
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
