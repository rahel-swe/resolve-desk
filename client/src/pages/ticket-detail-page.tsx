import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { TicketConversation } from '#/components/tickets/ticket-conversation'
import { TicketWorkflow } from '#/components/tickets/ticket-workflow'
import { TicketAiAssist } from '#/components/tickets/ticket-ai-assist'
import {
  TicketPriorityBadge,
  TicketStatusBadge,
} from '#/components/tickets/ticket-badges'
import { TicketLoadingList } from '#/components/tickets/ticket-loading-list'
import { PageHeading } from '#/components/workspace/page-heading'
import { useRequireAuth } from '#/hooks/use-require-auth'
import { useTicketWorkspace } from '#/hooks/use-ticket-workspace'
import { toast } from '#/components/ui/toast'

export default function TicketDetailPage({ ticketId }: { ticketId: number }) {
  const authenticated = useRequireAuth()
  const workspace = useTicketWorkspace(ticketId)

  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!authenticated || !workspace.notice) return

    toast.add({
      description: workspace.notice,
    })
  }, [authenticated, workspace.notice])
  const errorMessage = workspace.actionError || workspace.error

  useEffect(() => {
    if (!authenticated || !errorMessage) return

    toast.add({
      description: errorMessage,
      type: 'error',
    })
  }, [errorMessage])

  if (!authenticated) return null

  const backAction = (
    <Button
      variant="outline"
      nativeButton={false}
      render={<Link to="/tickets" />}
    >
      Back to queue
    </Button>
  )

  return (
    <div className="mx-auto w-full max-w-360 px-5 py-9 sm:px-8 lg:px-10">
      {workspace.data ? (
        <>
          <PageHeading
            title={workspace.data.ticket.title}
            eyebrow={`Ticket #${workspace.data.ticket.id}`}
            action={backAction}
          />
          <div className="-mt-3 mb-8 flex gap-3">
            <TicketStatusBadge status={workspace.data.ticket.status} />
            <TicketPriorityBadge priority={workspace.data.ticket.priority} />
          </div>
        </>
      ) : (
        <PageHeading title="Ticket workspace" action={backAction} />
      )}

      {workspace.loading && !workspace.data ? (
        <TicketLoadingList />
      ) : (
        workspace.data && (
          <div className="grid gap-9 xl:grid-cols-[minmax(0,1fr)_300px]">
            <TicketConversation
              workspace={workspace}
              message={message}
              onMessage={setMessage}
            />
            <aside className="min-w-0 border-t pt-7 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-7">
              <TicketWorkflow workspace={workspace} />

              <TicketAiAssist
                workspace={workspace}
                onUseDraft={(draft) => {
                  setMessage(draft)
                  document.getElementById('ticket-comment')?.focus()
                }}
              />
            </aside>
          </div>
        )
      )}
    </div>
  )
}
