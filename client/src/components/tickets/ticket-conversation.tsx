import type { ReactNode } from 'react'
import { TicketReplyComposer } from '#/components/tickets/ticket-reply-composer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { UserAvatar } from '#/components/workspace/user-identity'
import { MarkdownContent } from '#/components/markdown-content'
import { formatDateTime, formatTicketStatus } from '#/lib/ticket-utils'
import { cn } from '#/lib/utils'
import type { TicketWorkspace } from '#/hooks/use-ticket-workspace'

type TicketConversationProps = {
  workspace: TicketWorkspace
  message: string
  onMessage: (value: string) => void
  beforeComposer?: ReactNode
}

function ConversationMessage({
  name,
  message,
  createdAt,
  own = false,
}: {
  name: string
  message: string
  createdAt: string
  own?: boolean
}) {
  return (
    <article className="flex gap-3 sm:gap-4">
      <UserAvatar name={name} className="size-10 shrink-0 sm:size-11" />
      <div className="min-w-0 flex-1">
        <div className="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-xs font-semibold sm:text-sm">{name}</p>
          <time
            dateTime={createdAt}
            className="text-[11px] text-muted-foreground"
          >
            {formatDateTime(createdAt)}
          </time>
        </div>
        <div
          className={cn(
            'rounded-lg border border-border/40 px-4 py-3.5 sm:px-5',
            own ? 'bg-primary/8' : 'bg-muted',
          )}
        >
          <MarkdownContent>{message}</MarkdownContent>
        </div>
      </div>
    </article>
  )
}

export function TicketConversation({
  workspace,
  message,
  onMessage,
  beforeComposer,
}: TicketConversationProps) {
  if (!workspace.data) return null
  const { ticket, comments, history } = workspace.data

  return (
    <section className="min-w-0">
      <Tabs defaultValue="conversation">
        <TabsList
          variant="line"
          className="mb-6 h-12! w-full justify-start gap-2 border-b p-0 sm:gap-6"
        >
          <TabsTrigger
            value="conversation"
            className="h-full flex-none px-1 text-sm normal-case tracking-normal data-active:text-foreground after:bg-primary after:bottom-0!"
          >
            Conversation{' '}
            <span className="text-[10px] font-normal text-muted-foreground">
              {comments.length + 1}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="h-full flex-none px-3 text-sm normal-case tracking-normal data-active:text-foreground after:bg-primary after:bottom-0!"
          >
            History
          </TabsTrigger>
        </TabsList>
        <TabsContent value="conversation" className="space-y-7">
          <ConversationMessage
            name={ticket.createdByFullName}
            message={ticket.description}
            createdAt={ticket.createdAt}
          />
          {[...comments]
            .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
            .map((comment) => {
              const own = comment.userId === workspace.user?.id
              return (
                <ConversationMessage
                  key={comment.id}
                  name={own ? 'You' : `Member #${comment.userId}`}
                  message={comment.message}
                  createdAt={comment.createdAt}
                  own={own}
                />
              )
            })}
          {beforeComposer}
          <TicketReplyComposer
            workspace={workspace}
            message={message}
            onMessage={onMessage}
          />
        </TabsContent>
        <TabsContent value="history">
          {history.length === 0 ? (
            <div className="rounded-lg border border-dashed px-5 py-12 text-center">
              <p className="text-sm">No status changes yet</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Updates to this ticket will appear here.
              </p>
            </div>
          ) : (
            <ol className="divide-y">
              {[...history]
                .sort(
                  (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
                )
                .map((item) => (
                  <li key={item.id} className="py-5">
                    <p className="text-sm">
                      {formatTicketStatus(item.oldStatus)}{' '}
                      <span className="mx-2 text-muted-foreground">to</span>{' '}
                      {formatTicketStatus(item.newStatus)}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {workspace.user?.role === 'Customer'
                        ? 'Support team'
                        : item.actorEmail || `Member #${item.actorUserId}`}{' '}
                      · {formatDateTime(item.createdAt)}
                    </p>
                  </li>
                ))}
            </ol>
          )}
        </TabsContent>
      </Tabs>
    </section>
  )
}
