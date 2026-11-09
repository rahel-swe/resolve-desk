import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../ui/drawer'
import { Task01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '../ui/button'
import type { ReactNode } from 'react'

const TicketWorkflowDrawer = ({
  isCustomer,
  ticketWorkflowNode,
}: {
  isCustomer: boolean
  ticketWorkflowNode: ReactNode
}) => {
  return (
    <Drawer showSwipeHandle swipeDirection="down">
      <DrawerTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="lg:hidden"
            aria-haspopup="dialog"
            aria-controls="ticket-workflow-drawer"
          />
        }
      >
        <HugeiconsIcon icon={Task01Icon} className="size-4" />
        Details
      </DrawerTrigger>
      <DrawerContent
        id="ticket-workflow-drawer"
        className="h-[calc(100dvh-var(--app-header-height)-1rem)] max-h-[calc(100dvh-var(--app-header-height)-1rem)] max-w-lg mx-auto"
      >
        <DrawerHeader className="sr-only">
          <DrawerTitle>
            {isCustomer ? 'Request details' : 'Ticket details'}
          </DrawerTitle>
          <DrawerDescription>
            {isCustomer
              ? 'View your request’s status, details, and related help articles.'
              : 'Review ticket properties and the actions available to your role.'}
          </DrawerDescription>
        </DrawerHeader>

        {ticketWorkflowNode}
      </DrawerContent>
    </Drawer>
  )
}

export default TicketWorkflowDrawer
