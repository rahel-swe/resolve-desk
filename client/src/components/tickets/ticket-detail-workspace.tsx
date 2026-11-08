import { useTicketWorkspace } from '#/hooks/use-ticket-workspace'
import { formatDateTime } from '#/lib/ticket-utils'
import { useWorkspace } from '#/providers/workspace-provider'
import type { ApiKnowledgeArticle } from '#/services/ticket-service'
import { InboxIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ArticlePreview } from '../knowledge/article-preview'
import { TicketListSkeleton } from '../skeletons/ticket-list-skeleton'
import { Button } from '../ui/button'
import { toast } from '../ui/toast'
import { ResourceError } from '../workspace/state-panel-components'
import { TicketAiAssist } from './ticket-ai-assist'
import { TicketConversation } from './ticket-conversation'
import { TicketWorkflow } from './ticket-workflow'
import TicketWorkflowDrawer from './ticket-workflow-drawer'

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
      <div className="grid h-full min-h-0 min-w-0 overflow-hidden lg:grid-cols-[minmax(0,1fr)_270px] 2xl:grid-cols-[minmax(0,1fr)_310px]">
        <div className="flex min-h-0 min-w-0 flex-col">
          <div
            role="region"
            aria-label="Ticket conversation"
            tabIndex={0}
            className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 pt-7 pb-10 md:pb-4 [scrollbar-color:var(--input)_transparent] scrollbar-thin scrollbar-gutter-stable focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/40 focus-visible:ring-inset sm:px-7 2xl:px-9"
          >
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="xl:hidden"
                    aria-haspopup="dialog"
                    aria-controls="ticket-queue-drawer"
                    onClick={onOpenQueue}
                  >
                    <HugeiconsIcon icon={InboxIcon} className="size-4" />
                    Queue
                  </Button>

                  <TicketWorkflowDrawer
                    isCustomer={isCustomer}
                    ticketWorkflowNode={
                      <TicketWorkflow
                        key={ticketId}
                        workspace={workspace}
                        relatedArticles={relatedArticles}
                      />
                    }
                  />
                </div>
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
            </header>

            {workspace.loading && !workspace.data ? (
              <TicketListSkeleton />
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
        </div>

        <aside
          id="ticket-details"
          className="hidden lg:block min-h-0 min-w-0 scroll-mt-24 border-t bg-card/15 lg:h-full lg:border-t-0 lg:border-s lg:overflow-hidden"
        >
          {workspace.data ? (
            <TicketWorkflow
              key={ticketId}
              workspace={workspace}
              relatedArticles={relatedArticles}
              onOpenArticle={setSelectedArticle}
            />
          ) : workspace.loading ? (
            <div
              aria-label="Loading ticket details"
              className="space-y-6 px-5 py-7 sm:px-7 lg:px-5 2xl:px-7"
            >
              <div className="h-8 w-40 animate-pulse rounded bg-muted" />
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded bg-muted"
                />
              ))}
            </div>
          ) : (
            <p className="px-5 py-7 text-sm text-muted-foreground sm:px-7 lg:px-5 2xl:px-7">
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

export default TicketDetailWorkspace
