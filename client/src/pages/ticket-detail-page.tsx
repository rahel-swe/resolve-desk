import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Menu01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '#/components/ui/button'

import { toast } from '#/components/ui/toast'
import { ArticlePreview } from '#/components/knowledge/article-preview'
import { TicketConversation } from '#/components/tickets/ticket-conversation'
import { TicketWorkflow } from '#/components/tickets/ticket-workflow'
import { TicketAiAssist } from '#/components/tickets/ticket-ai-assist'
import { TicketQueue } from '#/components/tickets/ticket-queue'
import { TicketLoadingList } from '#/components/tickets/ticket-loading-list'
import { ResourceError } from '#/components/workspace/state-panel-components'
import { useRequireAuth } from '#/hooks/use-require-auth'
import { useTicketWorkspace } from '#/hooks/use-ticket-workspace'
import { useWorkspace } from '#/providers/workspace-provider'
import { useAuth } from '#/providers/auth-provider'
import { formatDateTime } from '#/lib/ticket-utils'
import type { ApiKnowledgeArticle } from '#/services/ticket-service'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '#/components/ui/drawer'

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
    <div className="grid min-h-[calc(100svh-4.25rem)] xl:grid-cols-[220px_minmax(0,1fr)] 2xl:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="sticky top-17 hidden h-[calc(100svh-4.25rem)] min-h-0 border-r xl:block">
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

function TicketDetailWorkspace({
  ticketId,
  onOpenQueue,
}: {
  ticketId: number
  onOpenQueue: () => void
}) {
  const workspace = useTicketWorkspace(ticketId)
  const { library } = useWorkspace()
  const [message, setMessage] = useState('')
  const [selectedArticle, setSelectedArticle] =
    useState<ApiKnowledgeArticle | null>(null)
  const errorMessage = workspace.actionError || workspace.error

  useEffect(() => {
    if (workspace.notice) toast.add({ description: workspace.notice })
  }, [workspace.notice])

  useEffect(() => {
    if (errorMessage) toast.add({ description: errorMessage, type: 'error' })
  }, [errorMessage])

  const ticket = workspace.data?.ticket
  const isCustomer = workspace.user?.role === 'Customer'
  const isTeam =
    workspace.user?.role === 'Admin' || workspace.user?.role === 'Staff'
  const relatedArticles = ticket
    ? library.data
        .filter(
          (article) =>
            article.category.toLowerCase() === ticket.category.toLowerCase(),
        )
        .slice(0, 2)
    : []

  return (
    <>
      <div className="grid min-w-0 lg:grid-cols-[minmax(0,1fr)_270px] 2xl:grid-cols-[minmax(0,1fr)_310px]">
        <div className="min-w-0 px-5 pt-7 pb-10 sm:px-7 2xl:px-9">
          <header className="mb-7 sm:mb-9">
            <div className="mb-5 flex items-center justify-between gap-3">
              <nav
                aria-label="Breadcrumb"
                className="flex min-w-0 items-center gap-3 text-xs text-muted-foreground"
              >
                <Link to="/tickets" className="hover:text-foreground">
                  {isCustomer ? 'My requests' : 'Inbox'}
                </Link>
                <span aria-hidden="true">/</span>
                <span className="truncate" aria-current="page">
                  RD-{ticketId}
                </span>
              </nav>
              <Button
                variant="outline"
                size="sm"
                className="xl:hidden"
                aria-haspopup="dialog"
                aria-controls="ticket-queue-drawer"
                onClick={onOpenQueue}
              >
                <HugeiconsIcon icon={Menu01Icon} className="size-4" />
                Queue
              </Button>
            </div>
            <h1 className="font-heading text-4xl leading-[1.06] tracking-tight sm:text-5xl 2xl:text-[3.5rem]">
              {ticket?.title ||
                (isCustomer ? 'Request details' : 'Ticket workspace')}
            </h1>
            {ticket && (
              <p className="mt-4 text-xs leading-6 text-muted-foreground">
                {ticket.category}
                <span className="mx-2.5" aria-hidden="true">
                  ·
                </span>
                Opened {formatDateTime(ticket.createdAt)}
              </p>
            )}
            <a
              href="#ticket-details"
              className="mt-4 inline-block text-xs text-muted-foreground underline underline-offset-4 lg:hidden"
            >
              View ticket details
            </a>
          </header>

          {workspace.loading && !workspace.data ? (
            <TicketLoadingList />
          ) : workspace.data ? (
            <TicketConversation
              workspace={workspace}
              message={message}
              onMessage={setMessage}
              beforeComposer={
                isTeam ? (
                  <TicketAiAssist
                    workspace={workspace}
                    relatedArticle={relatedArticles[0]}
                    onOpenArticle={setSelectedArticle}
                    onUseDraft={(draft) => {
                      setMessage(draft)
                      document.getElementById('ticket-comment')?.focus()
                    }}
                  />
                ) : undefined
              }
            />
          ) : (
            <ResourceError
              message={workspace.error || 'This ticket could not be loaded.'}
              onRetry={() => void workspace.refresh()}
            />
          )}
        </div>

        <aside
          id="ticket-details"
          className="min-w-0 scroll-mt-24 border-t bg-card/15 px-5 py-8 sm:px-7 lg:border-t-0 lg:border-l lg:px-5 2xl:px-7"
        >
          {workspace.data ? (
            <TicketWorkflow
              key={ticketId}
              workspace={workspace}
              relatedArticles={relatedArticles}
              onOpenArticle={setSelectedArticle}
            />
          ) : workspace.loading ? (
            <div aria-label="Loading ticket details" className="space-y-6">
              <div className="h-8 w-40 animate-pulse rounded bg-muted" />
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded bg-muted"
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Ticket details are unavailable. Retry the conversation to load
              them.
            </p>
          )}
        </aside>
      </div>

      <ArticlePreview
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </>
  )
}
