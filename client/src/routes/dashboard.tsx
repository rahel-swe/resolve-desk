import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { TicketCard } from '#/components/tickets/ticket-card'
import { TicketEmptyState } from '#/components/tickets/ticket-empty-state'
import { TicketLoadingList } from '#/components/tickets/ticket-loading-list'
import { formatTicketPriority, getTickets } from '#/lib/api'
import type { ApiTicket } from '#/lib/api'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { getAuthToken } from '#/components/services/auth-service'

export const Route = createFileRoute('/dashboard')({ component: DashboardPage })

function DashboardPage() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState<ApiTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!getAuthToken()) {
      navigate({ to: '/sign-in' })
      return
    }

    let isMounted = true

    const loadTickets = async () => {
      try {
        const apiTickets = await getTickets()
        if (isMounted) setTickets(apiTickets)
      } catch (caughtError) {
        if (isMounted) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : 'Unable to load tickets.',
          )
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void loadTickets()

    return () => {
      isMounted = false
    }
  }, [navigate])

  const stats = useMemo(() => {
    const open = tickets.filter((ticket) => ticket.status === 0).length
    const inProgress = tickets.filter((ticket) => ticket.status === 1).length
    const waiting = tickets.filter((ticket) => ticket.status === 2).length
    const resolved = tickets.filter(
      (ticket) => ticket.status === 3 || ticket.status === 4,
    ).length

    return [
      { label: 'Open', value: open, note: 'New work' },
      { label: 'In progress', value: inProgress, note: 'Agent owned' },
      { label: 'Waiting', value: waiting, note: 'Customer reply' },
      { label: 'Resolved', value: resolved, note: 'Fixed or closed' },
    ]
  }, [tickets])

  const urgentTickets = tickets
    .filter((ticket) => formatTicketPriority(ticket.priority) === 'Critical')
    .slice(0, 3)
  const queuePreview = tickets.slice(0, 4)

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Operations
          </p>
          <h1 className="mt-2 font-heading text-4xl font-semibold uppercase tracking-wider text-foreground">
            Support dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            A quick command view for queue health, urgent issues, and the next
            tickets your team should open.
          </p>
        </div>

        <div className="flex gap-2">
          <Link to="/tickets">
            <Button variant="secondary">View queue</Button>
          </Link>
          <Link to="/tickets/new">
            <Button>New ticket</Button>
          </Link>
        </div>
      </div>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border bg-card shadow-sm">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{stat.label}</div>
              <div className="mt-3 flex items-end justify-between gap-2">
                <span className="font-heading text-4xl font-semibold text-foreground">
                  {stat.value}
                </span>
                <span className="text-xs text-muted-foreground">
                  {stat.note}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {error ? (
        <div className="mb-6 border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle>Queue snapshot</CardTitle>
                <CardDescription>
                  The newest tickets from the live support queue.
                </CardDescription>
              </div>
              <Link
                to="/tickets"
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                View all
              </Link>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <TicketLoadingList />
            ) : queuePreview.length === 0 ? (
              <TicketEmptyState
                title="No tickets yet"
                description="When customers create requests, the newest tickets will appear here."
                showCreateAction
              />
            ) : (
              <div className="space-y-3">
                {queuePreview.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Critical watch</CardTitle>
            <CardDescription>
              High-risk tickets that should not wait in the queue.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                <div className="h-16 bg-muted" />
                <div className="h-16 bg-muted" />
                <div className="h-16 bg-muted" />
              </div>
            ) : urgentTickets.length === 0 ? (
              <div className="border border-border bg-background p-4 text-sm leading-6 text-muted-foreground">
                No critical tickets right now. Keep watching new intake and
                unassigned work.
              </div>
            ) : (
              urgentTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  to="/tickets/$ticketId"
                  params={{ ticketId: String(ticket.id) }}
                  className="block border border-border bg-background p-3 transition-colors hover:border-primary/40"
                >
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    #{ticket.id}
                  </div>
                  <div className="mt-2 text-sm font-medium text-foreground">
                    {ticket.title}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {ticket.assignedAgentEmail || 'Unassigned'}
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
