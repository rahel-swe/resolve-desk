import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight01Icon,
  BubbleChatIcon,
  File02Icon,
  Search01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Input } from '#/components/ui/input'
import { UserIdentity } from '#/components/workspace/user-identity'
import { useAuth } from '#/providers/auth-provider'
import { useWorkspace } from '#/providers/workspace-provider'
import { formatRelativeTime } from '#/lib/ticket-utils'

export function WorkspaceSummary() {
  const { user } = useAuth()
  const { queue, library } = useWorkspace()
  const [query, setQuery] = useState('')
  const assigned = queue.data.filter(
    (ticket) => ticket.assignedAgentEmail === user?.email && ticket.status < 3,
  )

  const recent = [...queue.data]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 3)
  const articles = library.data
    .filter((article) =>
      article.title.toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, 2)

  return (
    <aside className="min-w-0 border-t pt-7 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-7">
      <h2 className="mb-5 font-heading text-3xl">My workspace</h2>
      <Link to="/profile" className="block rounded-md hover:bg-muted/30">
        <UserIdentity user={user} />
      </Link>
      <Link
        to="/tickets"
        search={{ scope: 'mine', q: '' }}
        className="mt-5 flex items-center justify-between border-y py-4 text-sm hover:text-primary"
      >
        <span>
          <span className="block text-xs text-muted-foreground">
            Assigned to me
          </span>
          <span className="mt-1 block">
            {queue.loading || queue.error ? '—' : assigned.length} active
            tickets
          </span>
        </span>
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          className="size-4 text-muted-foreground"
        />
      </Link>
      <section className="border-b py-5">
        <h3 className="mb-4 text-sm font-medium">Recent requests</h3>
        {queue.loading ? (
          <p className="text-xs text-muted-foreground">Loading requests…</p>
        ) : queue.error ? (
          <p className="text-xs text-muted-foreground">
            Recent requests are unavailable.
          </p>
        ) : recent.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            New requests will appear here.
          </p>
        ) : (
          <ul className="space-y-4">
            {recent.map((ticket) => (
              <li key={ticket.id}>
                <Link
                  to="/tickets/$ticketId"
                  params={{ ticketId: String(ticket.id) }}
                  className="flex gap-3 hover:text-primary"
                >
                  <HugeiconsIcon
                    icon={BubbleChatIcon}
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-xs">
                      {ticket.title}
                    </span>
                    <span className="mt-1 block text-[11px] text-muted-foreground">
                      Created {formatRelativeTime(ticket.createdAt)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="pt-5">
        <h3 className="mb-3 font-heading text-2xl">Knowledge spotlight</h3>
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground"
          />
          <Input
            aria-label="Search help articles"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search help articles…"
            className="pl-9 text-xs"
          />
        </div>
        <ul className="mt-4 space-y-4">
          {articles.map((article) => (
            <li key={article.id}>
              <Link
                to="/knowledge"
                search={{ q: article.title }}
                className="flex items-start gap-3 hover:text-primary"
              >
                <HugeiconsIcon
                  icon={File02Icon}
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                />
                <span className="min-w-0">
                  <span className="block text-xs leading-5">
                    {article.title}
                  </span>
                  <span className="mt-1 block text-[11px] text-muted-foreground">
                    {article.category}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {library.loading ? (
          <p className="mt-4 text-xs text-muted-foreground">
            Loading articles…
          </p>
        ) : (
          articles.length === 0 && (
            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              {library.error
                ? 'The library is temporarily unavailable.'
                : query
                  ? 'No matching articles.'
                  : 'Published guides will appear here.'}
            </p>
          )
        )}
        <Link
          to="/knowledge"
          className="mt-4 inline-block text-xs text-primary hover:underline"
        >
          Browse the library
        </Link>
      </section>
    </aside>
  )
}
