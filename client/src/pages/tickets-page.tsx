import { useMemo, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  PlusSignIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '#/components/ui/button'
import { TicketTable } from '#/components/tickets/ticket-table'
import { TicketFilters } from '#/components/tickets/ticket-filters'
import { QueueMetrics } from '#/components/tickets/queue-metrics'
import { TicketLoadingList } from '#/components/tickets/ticket-loading-list'
import {
  EmptyState,
  ResourceError,
} from '#/components/workspace/state-panel-components'
import { PageHeading } from '#/components/workspace/page-heading'
import { useRequireAuth } from '#/hooks/use-require-auth'
import { useAuth } from '#/providers/auth-provider'
import { useWorkspace } from '#/providers/workspace-provider'
import { Route } from '#/routes/tickets/index'

const pageSize = 10
export default function TicketsPage() {
  const authenticated = useRequireAuth()
  const { user } = useAuth()
  const { queue } = useWorkspace()
  const { q, scope } = Route.useSearch()
  const navigate = useNavigate({ from: '/tickets/' })
  const [status, setStatus] = useState('all')
  const [priority, setPriority] = useState('all')
  const [page, setPage] = useState(1)
  const visible = useMemo(
    () =>
      queue.data
        .filter((ticket) => {
          const query = q.trim().toLowerCase()
          const matchesScope =
            scope === 'all' ||
            (scope === 'mine'
              ? ticket.assignedAgentEmail === user?.email
              : !ticket.assignedAgentEmail)
          return (
            matchesScope &&
            (status === 'all' || ticket.status === Number(status)) &&
            (priority === 'all' || ticket.priority === Number(priority)) &&
            (!query ||
              [
                ticket.title,
                ticket.description,
                ticket.category,
                ticket.createdByEmail,
                ticket.assignedAgentEmail ?? '',
                String(ticket.id),
              ].some((value) => value.toLowerCase().includes(query)))
          )
        })
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
    [queue.data, q, scope, status, priority, user?.email],
  )

  if (!authenticated) return null

  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageTickets = visible.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-9 sm:px-8 lg:px-10">
      <PageHeading
        title="Tickets"
        description="A clear view of what needs your attention."
        action={
          <Button nativeButton={false} render={<Link to="/tickets/new" />}>
            <HugeiconsIcon icon={PlusSignIcon} />
            New ticket
          </Button>
        }
      />
      <QueueMetrics
        tickets={queue.data}
        loading={queue.loading}
        unavailable={Boolean(queue.error)}
      />
      <TicketFilters
        query={q}
        scope={scope}
        status={status}
        priority={priority}
        onQuery={(value) => {
          setPage(1)
          void navigate({ search: { q: value, scope }, replace: true })
        }}
        onScope={(value) => {
          setPage(1)
          void navigate({
            search: {
              q,
              scope: value === 'mine' || value === 'unassigned' ? value : 'all',
            },
            replace: true,
          })
        }}
        onStatus={(value) => {
          setStatus(value)
          setPage(1)
        }}
        onPriority={(value) => {
          setPriority(value)
          setPage(1)
        }}
      />
      {queue.error ? (
        <ResourceError
          message={queue.error}
          onRetry={() => void queue.refresh()}
        />
      ) : queue.loading ? (
        <TicketLoadingList />
      ) : pageTickets.length ? (
        <TicketTable tickets={pageTickets} />
      ) : (
        <EmptyState
          title={queue.data.length ? 'No matching tickets' : 'A fresh start'}
          description={
            queue.data.length
              ? 'Try another search or clear the filters.'
              : 'Create your first ticket to start the conversation.'
          }
          action={
            queue.data.length ? (
              <Button
                variant="outline"
                onClick={() => {
                  setStatus('all')
                  setPriority('all')
                  setPage(1)
                  void navigate({
                    search: { q: '', scope: 'all' },
                    replace: true,
                  })
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Button nativeButton={false} render={<Link to="/tickets/new" />}>
                New ticket
              </Button>
            )
          }
        />
      )}
      {!queue.loading && !queue.error && visible.length > 0 && (
        <footer className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t pt-5 text-xs text-muted-foreground">
          <p>
            Showing {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, visible.length)} of{' '}
            {visible.length} tickets
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Previous page"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} />
            </Button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Next page"
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
            >
              <HugeiconsIcon icon={ArrowRight01Icon} />
            </Button>
          </div>
        </footer>
      )}
    </div>
  )
}
