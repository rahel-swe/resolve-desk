import type { ReactNode } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '../ui/drawer'
import { cn } from 'cn'

const TicketQueueDrawer = ({
  queueOpen,
  setQueueOpen,
  isCustomer,
  ticketQueueNode,
  className,
}: {
  queueOpen: boolean
  setQueueOpen: (open: boolean) => void
  isCustomer: boolean
  ticketQueueNode: ReactNode
  className?: string
}) => {
  return (
    <Drawer
      open={queueOpen}
      onOpenChange={setQueueOpen}
      showSwipeHandle
      swipeDirection="down"
    >
      <DrawerContent
        id="ticket-queue-drawer"
        className={cn(
          'h-[calc(100dvh-var(--app-header-height)-1rem)] max-h-[calc(100dvh-var(--app-header-height)-1rem)] max-w-lg mx-auto',
          className,
        )}
      >
        <DrawerHeader className="sr-only">
          <DrawerTitle>{isCustomer ? 'My requests' : 'My queue'}</DrawerTitle>
          <DrawerDescription>
            {isCustomer
              ? 'Search your requests and open a conversation with support.'
              : 'Search and sort tickets in your queue, then open a conversation.'}
          </DrawerDescription>
        </DrawerHeader>

        {ticketQueueNode}
      </DrawerContent>
    </Drawer>
  )
}

export default TicketQueueDrawer
