import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Attachment01Icon,
  InformationCircleIcon,
  LeftToRightListBulletIcon,
  Link01Icon,
  SentIcon,
  TextBoldIcon,
  TextItalicIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '#/components/ui/button'
import { Textarea } from '#/components/ui/textarea'
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

function ReplyComposer({
  workspace,
  message,
  onMessage,
}: Omit<TicketConversationProps, 'beforeComposer'>) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [preview, setPreview] = useState(false)
  const busy = Boolean(workspace.busy)
  const requester = workspace.data?.ticket.createdByFullName || 'the requester'

  function insertFormatting(kind: 'bold' | 'italic' | 'link' | 'list') {
    const input = inputRef.current
    if (!input) return
    const start = input.selectionStart
    const end = input.selectionEnd
    const selected = message.slice(start, end)
    const text =
      selected ||
      (kind === 'link' ? 'link text' : kind === 'list' ? 'List item' : 'text')
    const formatted =
      kind === 'bold'
        ? `**${text}**`
        : kind === 'italic'
          ? `_${text}_`
          : kind === 'link'
            ? `[${text}](https://example.com)`
            : `${start > 0 && message[start - 1] !== '\n' ? '\n' : ''}- ${text.replaceAll('\n', '\n- ')}`
    const next = message.slice(0, start) + formatted + message.slice(end)
    if (next.length > 1000) return
    onMessage(next)
    requestAnimationFrame(() => {
      input.focus()
      input.setSelectionRange(start, start + formatted.length)
    })
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void workspace.addComment(message).then((success) => {
          if (success) {
            onMessage('')
            setPreview(false)
          }
        })
      }}
    >
      <div className="overflow-hidden rounded-lg border border-input bg-muted/55 transition-colors focus-within:border-ring/60">
        <label htmlFor="ticket-comment" className="sr-only">
          Add a comment
        </label>
        {preview ? (
          <div
            id="ticket-reply-preview"
            tabIndex={0}
            role="region"
            aria-label="Reply preview"
            className="max-h-80 min-h-32 overflow-y-scroll overscroll-y-contain px-5 py-4 [scrollbar-color:var(--muted-foreground)_transparent] [scrollbar-width:thin]"
          >
            {message.trim() ? (
              <MarkdownContent>{message}</MarkdownContent>
            ) : (
              <p className="text-muted-foreground">
                Your reply preview will appear here.
              </p>
            )}
          </div>
        ) : (
          <Textarea
            ref={inputRef}
            id="ticket-comment"
            value={message}
            onChange={(event) => onMessage(event.target.value)}
            placeholder="Write a reply…"
            rows={4}
            required
            minLength={5}
            maxLength={1000}
            disabled={busy}
            className="max-h-80 min-h-32 resize-none overflow-y-scroll overscroll-y-contain rounded-none border-0 bg-transparent px-5 py-4 shadow-none focus-visible:ring-0 [scrollbar-color:var(--muted-foreground)_transparent] [scrollbar-width:thin] md:text-sm"
          />
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 px-3 pb-3 sm:px-4">
          <div className="flex items-center gap-0.5 text-muted-foreground">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Bold"
              title="Bold"
              disabled={busy || preview}
              onClick={() => insertFormatting('bold')}
            >
              <HugeiconsIcon icon={TextBoldIcon} className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Italic"
              title="Italic"
              disabled={busy || preview}
              onClick={() => insertFormatting('italic')}
            >
              <HugeiconsIcon icon={TextItalicIcon} className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Insert link"
              title="Insert link"
              disabled={busy || preview}
              onClick={() => insertFormatting('link')}
            >
              <HugeiconsIcon icon={Link01Icon} className="size-4" />
            </Button>
            <span title="Attachments are coming soon">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Attachments coming soon"
                disabled
              >
                <HugeiconsIcon icon={Attachment01Icon} className="size-4" />
              </Button>
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Bulleted list"
              title="Bulleted list"
              disabled={busy || preview}
              onClick={() => insertFormatting('list')}
            >
              <HugeiconsIcon
                icon={LeftToRightListBulletIcon}
                className="size-4"
              />
            </Button>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              className="text-[11px] text-muted-foreground hover:text-foreground"
              aria-pressed={preview}
              aria-controls={
                preview ? 'ticket-reply-preview' : 'ticket-comment'
              }
              onClick={() => setPreview((value) => !value)}
            >
              {preview ? 'Write' : 'Preview'}
            </button>
            <Button
              type="submit"
              disabled={
                busy || message.trim().length < 5 || message.length > 1000
              }
              className="gap-2 px-4"
            >
              <HugeiconsIcon icon={SentIcon} className="size-4" />
              {workspace.busy === 'comment' ? 'Sending…' : 'Send reply'}
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-start justify-between gap-3 text-[11px] leading-5 text-muted-foreground">
        <p className="flex items-center gap-2">
          <HugeiconsIcon
            icon={InformationCircleIcon}
            className="size-3.5 shrink-0"
          />
          {workspace.user?.role === 'Customer'
            ? 'Replies are visible to the support team.'
            : `Reply visible to ${requester}.`}
        </p>
        {message.length > 800 && (
          <span className="shrink-0">{message.length}/1,000</span>
        )}
      </div>
    </form>
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
          <ReplyComposer
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
