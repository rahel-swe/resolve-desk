import { useState } from 'react'

import TicketDetailWorkspace from '#/components/tickets/ticket-detail-workspace'
import { TicketQueue } from '#/components/tickets/ticket-queue'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '#/components/ui/drawer'
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
    <div className="grid min-h-(--ticket-workspace-height) [--ticket-workspace-height:calc(100dvh-var(--app-header-height))] lg:h-(--ticket-workspace-height) lg:min-h-0 lg:overflow-hidden xl:grid-cols-[250px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="hidden h-full min-h-0 border-r xl:block">
        <TicketQueue {...queueProps} className="h-full" />
      </aside>
      <TicketDetailWorkspace
        key={ticketId}
        ticketId={ticketId}
        onOpenQueue={() => setQueueOpen(true)}
      />
      <Drawer
        open={queueOpen}
        onOpenChange={setQueueOpen}
        showSwipeHandle
        swipeDirection="down"
      >
        <DrawerContent id="ticket-queue-drawer" className="rounded-2xl">
          <DrawerHeader className="sr-only">
            <DrawerTitle>{isCustomer ? 'My requests' : 'My queue'}</DrawerTitle>
            <DrawerDescription>
              Search your requests and open a conversation.
            </DrawerDescription>
          </DrawerHeader>

          <TicketQueue
            {...queueProps}
            onSelect={() => setQueueOpen(false)}
            className="min-h-0 flex-1"
          />
        </DrawerContent>
      </Drawer>
    </div>
  )
}
