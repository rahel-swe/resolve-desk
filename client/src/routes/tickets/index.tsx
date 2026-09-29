import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { TicketCard } from '#/components/tickets/ticket-card'
import { TicketEmptyState } from '#/components/tickets/ticket-empty-state'
import { TicketLoadingList } from '#/components/tickets/ticket-loading-list'
import { formatTicketPriority, formatTicketStatus, getTickets } from '#/lib/api'
import type { ApiTicket } from '#/lib/api'

import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { getAuthToken } from '#/components/services/auth-service'

const statusFilters = [
  'All',
  'Open',
  'In Progress',
  'Waiting',
  'Resolved',
  'Closed',
]
const priorityFilters = ['All', 'Low', 'Medium', 'High', 'Critical']

export const Route = createFileRoute('/tickets/')({ component: TicketsPage })

function TicketsPage() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState<ApiTicket[]>([])
  const [activeStatus, setActiveStatus] = useState('All')
  const [activePriority, setActivePriority] = useState('All')
  const [search, setSearch] = useState('')
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

  const visibleTickets = useMemo(() => {
    const query = search.trim().toLowerCase()

    return tickets.filter((ticket) => {
      const statusName = formatTicketStatus(ticket.status)
      const priorityName = formatTicketPriority(ticket.priority)
      const statusMatch = activeStatus === 'All' || statusName === activeStatus
      const priorityMatch =
        activePriority === 'All' || priorityName === activePriority
      const searchMatch =
        query.length === 0 ||
        ticket.title.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query) ||
        ticket.category.toLowerCase().includes(query) ||
        ticket.createdByEmail.toLowerCase().includes(query) ||
        ticket.assignedAgentEmail?.toLowerCase().includes(query)

      return statusMatch && priorityMatch && searchMatch
    })
  }, [activePriority, activeStatus, search, tickets])

  const unassignedCount = tickets.filter(
    (ticket) => !ticket.assignedAgentEmail,
  ).length
  const criticalCount = tickets.filter(
    (ticket) => formatTicketPriority(ticket.priority) === 'Critical',
  ).length
  const waitingCount = tickets.filter(
    (ticket) => formatTicketStatus(ticket.status) === 'Waiting',
  ).length

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Ticket queue
          </p>
          <h1 className="mt-2 font-heading text-4xl font-semibold uppercase tracking-wider text-foreground">
            Work inbox
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Triage new requests, spot blocked work, and open the tickets that
            need support attention.
          </p>
        </div>

        <Link to="/tickets/new">
          <Button>Create ticket</Button>
        </Link>
      </div>

      <section className="mb-5 grid gap-3 md:grid-cols-3">
        <QueueSignal label="Unassigned" value={unassignedCount} />
        <QueueSignal label="Critical priority" value={criticalCount} />
        <QueueSignal label="Waiting on customer" value={waitingCount} />
      </section>

      <Card className="mb-6 border-border bg-card shadow-sm">
        <CardContent className="space-y-4 p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, requester, category, or assignee"
              className="w-full"
            />

            <div className="text-sm text-muted-foreground">
              Showing {visibleTickets.length} of {tickets.length}
            </div>
          </div>

          <FilterBar
            label="Status"
            values={statusFilters}
            activeValue={activeStatus}
            onChange={setActiveStatus}
          />
          <FilterBar
            label="Priority"
            values={priorityFilters}
            activeValue={activePriority}
            onChange={setActivePriority}
          />
        </CardContent>
      </Card>

      {error ? (
        <div className="mb-6 border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading ? (
        <TicketLoadingList />
      ) : visibleTickets.length === 0 ? (
        <TicketEmptyState
          title="No matching tickets"
          description="Try clearing a filter or changing the search. If this queue is empty, the support desk is caught up."
          showCreateAction={tickets.length === 0}
        />
      ) : (
        <div className="space-y-3">
          {visibleTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterBar({
  label,
  values,
  activeValue,
  onChange,
}: {
  label: string
  values: string[]
  activeValue: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      <div className="w-20 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <Button
            key={value}
            type="button"
            size="xs"
            variant={activeValue === value ? 'default' : 'secondary'}
            onClick={() => onChange(value)}
          >
            {value}
          </Button>
        ))}
      </div>
    </div>
  )
}

function QueueSignal({ label, value }: { label: string; value: number }) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="font-heading text-3xl font-semibold text-foreground">
          {value}
        </div>
      </CardContent>
    </Card>
  )
}
