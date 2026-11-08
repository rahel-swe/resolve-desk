import { useState } from 'react'

import TicketDetailWorkspace from '#/components/tickets/ticket-detail-workspace'
import { TicketQueue } from '#/components/tickets/ticket-queue'
import TicketQueueDrawer from '#/components/tickets/ticket-queue-drawer'
import { useRequireAuth } from '#/hooks/use-require-auth'
import { useAuth } from '#/providers/auth-provider'
import { useWorkspace } from '#/providers/workspace-provider'

export default function TicketDetailPage({ ticketId }: { ticketId: number }) {
  const authenticated = useRequireAuth()
  const { user } = useAuth()
  const { queue } = useWorkspace()
  const [queueOpen, setQueueOpen] = useState(false)
  const isCustomer = user?.role === 'Customer'

  const queueProps = {
    tickets: queue.data,
    selectedTicketId: ticketId,
    loading: queue.loading,
    error: queue.error,
    isCustomer,
    onRetry: () => void queue.refresh(),
  }

  if (!authenticated) return null

  return (
    <div className="grid h-(--ticket-workspace-height) min-h-0 overflow-hidden [--ticket-workspace-height:calc(100dvh-var(--app-header-height))] xl:grid-cols-[250px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="hidden h-full min-h-0 border-r xl:block">
        <TicketQueue {...queueProps} className="h-full" />
      </aside>
      <TicketDetailWorkspace
        key={ticketId}
        ticketId={ticketId}
        onOpenQueue={() => setQueueOpen(true)}
      />
      <TicketQueueDrawer
        isCustomer={isCustomer}
        queueOpen={queueOpen}
        setQueueOpen={setQueueOpen}
        ticketQueueNode={
          <TicketQueue
            {...queueProps}
            onSelect={() => setQueueOpen(false)}
            className="min-h-0 flex-1"
          />
        }
      />
    </div>
  )
}
