import { Button } from '#/components/ui/button'
import { Textarea } from '#/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { UserAvatar } from '#/components/workspace/user-identity'
import { formatDateTime, formatTicketStatus } from '#/lib/ticket-utils'
import { displayName } from '#/lib/user-utils'
import type { TicketWorkspace } from '#/hooks/use-ticket-workspace'

type TicketConversationProps = {
  workspace: TicketWorkspace
  message: string
  onMessage: (value: string) => void
}

export function TicketConversation({
  workspace,
  message,
  onMessage,
}: TicketConversationProps) {
  if (!workspace.data) return null

  const { ticket, comments, history } = workspace.data

  return (
    <section className="min-w-0">
      <Tabs defaultValue="conversation">
        <TabsList variant="line" className="mb-5 gap-3">
          <TabsTrigger
            value="conversation"
            className="text-sm normal-case tracking-normal data-active:text-primary after:bg-primary"
          >
            Conversation{' '}
            <span className="text-xs text-muted-foreground">
              {comments.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="text-sm normal-case tracking-normal data-active:text-primary after:bg-primary"
          >
            History
          </TabsTrigger>
        </TabsList>
        <TabsContent value="conversation" className="space-y-6">
          <div className="flex gap-3">
            <UserAvatar name={displayName(ticket.createdByEmail)} />
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="text-sm font-medium">
                  {displayName(ticket.createdByEmail)}
                </p>
                <time
                  dateTime={ticket.createdAt}
                  className="text-xs text-muted-foreground"
                >
                  {formatDateTime(ticket.createdAt)}
                </time>
              </div>
              <p className="whitespace-pre-wrap wrap-break-word rounded-lg bg-muted p-5 text-sm leading-7">
                {ticket.description}
              </p>
            </div>
          </div>
          {[...comments]
            .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
            .map((comment) => {
              const author =
                comment.userId === workspace.user?.id
                  ? displayName(workspace.user.email)
                  : `Member #${comment.userId}`
              return (
                <div key={comment.id} className="flex gap-3">
                  <UserAvatar name={author} />
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="text-sm font-medium">{author}</p>
                      <time
                        dateTime={comment.createdAt}
                        className="text-xs text-muted-foreground"
                      >
                        {formatDateTime(comment.createdAt)}
                      </time>
                    </div>
                    <p className="whitespace-pre-wrap wrap-break-word rounded-lg bg-muted p-5 text-sm leading-7">
                      {comment.message}
                    </p>
                  </div>
                </div>
              )
            })}
          <form
            className="space-y-3 border-t pt-6"
            onSubmit={(event) => {
              event.preventDefault()
              void workspace.addComment(message).then((success) => {
                if (success) onMessage('')
              })
            }}
          >
            <label htmlFor="ticket-comment" className="text-sm font-medium">
              Add a comment
            </label>
            <Textarea
              id="ticket-comment"
              value={message}
              onChange={(event) => onMessage(event.target.value)}
              placeholder="Write an update for this conversation…"
              rows={5}
              required
              minLength={5}
              maxLength={1000}
              disabled={Boolean(workspace.busy)}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Comments are visible to people with access to this ticket.
              </p>
              <Button
                type="submit"
                disabled={Boolean(workspace.busy) || message.trim().length < 5}
              >
                {workspace.busy === 'comment' ? 'Adding…' : 'Add comment'}
              </Button>
            </div>
          </form>
        </TabsContent>
        <TabsContent value="history">
          {history.length === 0 ? (
            <p className="py-8 text-sm text-muted-foreground">
              No status changes yet.
            </p>
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
                      <span className="text-muted-foreground">to</span>{' '}
                      {formatTicketStatus(item.newStatus)}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {item.actorEmail || `Member #${item.actorUserId}`} ·{' '}
                      {formatDateTime(item.createdAt)}
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
