import { Link } from '@tanstack/react-router'
import { PlusSignIcon, ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '#/components/ui/button'
import { QueueMetrics } from '#/components/tickets/queue-metrics'
import { TicketTable } from '#/components/tickets/ticket-table'
import { TicketLoadingList } from '#/components/tickets/ticket-loading-list'
import { PageHeading } from '#/components/workspace/page-heading'
import {
  EmptyState,
  ResourceError,
} from '#/components/workspace/state-panel-components'
import { WorkspaceSummary } from '#/components/workspace/workspace-summary'
import { useRequireAuth } from '#/hooks/use-require-auth'
import { displayName } from '#/lib/user-utils'
import { useAuth } from '#/providers/auth-provider'
import { useWorkspace } from '#/providers/workspace-provider'
import { greetingUtils } from '#/lib/greeting-utils'

export default function DashboardPage() {
  const authenticated = useRequireAuth()
  const { user } = useAuth()
  const { queue } = useWorkspace()

  if (!authenticated) return null

  const { greeting, currentDate } = greetingUtils()

  const attention = queue.data
    .filter((ticket) => {
      const result =
        ticket.status === 'Open' ||
        ticket.status === 'InProgress' ||
        ticket.status === 'WaitingForCustomer'

      return result && !ticket.assignedAgentEmail
    })
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 5)

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-9 sm:px-8 lg:px-10">
      <PageHeading
        title={`${greeting}, ${displayName(user?.email).split(' ')[0]}.`}
        description={
          <span className="font-heading text-2xl">
            Let's make support feel a little simpler.
          </span>
        }
        eyebrow={new Intl.DateTimeFormat('en', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }).format(currentDate)}
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
      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_285px]">
        <section className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-3xl sm:text-4xl">
              Needs your attention
            </h2>
            <Button variant={'secondary'}>
              <Link
                to="/tickets"
                className="inline-flex items-center gap-2 hover:underline decoration-[0.5px]  underline-offset-4"
              >
                All tickets
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
              </Link>
            </Button>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Unassigned requests
          </p>
          {queue.error ? (
            <ResourceError
              message={queue.error}
              onRetry={() => void queue.refresh()}
            />
          ) : queue.loading ? (
            <TicketLoadingList />
          ) : attention.length > 0 ? (
            <TicketTable tickets={attention} compact />
          ) : (
            <EmptyState
              title="You're all caught up"
              description="There are no unassigned active tickets. Open the queue to see the rest of your work."
              action={
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={<Link to="/tickets" />}
                >
                  View queue
                </Button>
              }
            />
          )}
        </section>
        <WorkspaceSummary />
      </div>
    </div>
  )
}
