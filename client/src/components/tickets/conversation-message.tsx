import { formatDateTime } from '#/lib/ticket-utils'
import { cn } from 'cn'
import { MarkdownContent } from '../markdown-content'
import { UserAvatar } from '../workspace/user-identity'

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

export default ConversationMessage
