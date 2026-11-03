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
import type { TicketPriority, TicketStatus } from '#/types/ticket-enums'

const pageSize = 10
export default function TicketsPage() {
  const authenticated = useRequireAuth()
  const { user } = useAuth()
  const { queue } = useWorkspace()
  const { q, scope } = Route.useSearch()
  const navigate = useNavigate({ from: '/tickets/' })
  const isCustomer = user?.role === 'Customer'
  const effectiveScope = isCustomer ? 'all' : scope

  const [status, setStatus] = useState<TicketStatus | 'all'>('all')
  const [priority, setPriority] = useState<TicketPriority | 'all'>('all')

  const [page, setPage] = useState(1)

  const visible = useMemo(
    () =>
      queue.data
        .filter((ticket) => {
          const query = q.trim().toLowerCase()

          const matchesScope =
            effectiveScope === 'all' ||
            (effectiveScope === 'mine'
              ? ticket.assignedStaffEmail === user?.email
              : !ticket.assignedStaffEmail)

          return (
            matchesScope &&
            (status === 'all' || ticket.status === status) &&
            (priority === 'all' || ticket.priority === priority) &&
            (!query ||
              [
                ticket.title,
                ticket.description,
                ticket.category,
                ticket.createdByEmail,
                ticket.assignedStaffEmail ?? '',
                String(ticket.id),
              ].some((value) => value.toLowerCase().includes(query)))
          )
        })
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
    [queue.data, q, effectiveScope, status, priority, user?.email],
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
        title={isCustomer ? 'My requests' : 'Tickets'}
        description={
          isCustomer
            ? 'Track the requests you have sent to support.'
            : 'A clear view of what needs your attention.'
        }
        action={
          <Button nativeButton={false} render={<Link to="/tickets/new" />}>
            <HugeiconsIcon icon={PlusSignIcon} />
            {isCustomer ? 'New request' : 'New ticket'}
          </Button>
        }
      />
      <QueueMetrics
        tickets={queue.data}
        loading={queue.loading}
        unavailable={Boolean(queue.error)}
        caption={isCustomer ? 'among your requests' : 'in your ticket queue'}
      />
      <TicketFilters
        query={q}
        scope={effectiveScope}
        status={status}
        priority={priority}
        user={user}
        onQuery={(value) => {
          setPage(1)
          void navigate({
            search: { q: value, scope: effectiveScope },
            replace: true,
          })
        }}
        onScope={(value) => {
          setPage(1)
          void navigate({
            search: {
              q,
              scope:
                !isCustomer && (value === 'mine' || value === 'unassigned')
                  ? value
                  : 'all',
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
        <TicketTable tickets={pageTickets} user={user} />
      ) : (
        <EmptyState
          title={
            queue.data.length
              ? isCustomer
                ? 'No matching requests'
                : 'No matching tickets'
              : isCustomer
                ? 'No requests yet'
                : 'A fresh start'
          }
          description={
            queue.data.length
              ? 'Try another search or clear the filters.'
              : isCustomer
                ? 'Send your first request to get help from support.'
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
                {isCustomer ? 'New request' : 'New ticket'}
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
            {visible.length} {isCustomer ? 'requests' : 'tickets'}
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
