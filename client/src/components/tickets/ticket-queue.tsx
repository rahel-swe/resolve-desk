import { useId, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { UserAvatar } from '#/components/workspace/user-identity'
import { formatRelativeTime } from '#/lib/ticket-utils'
import { cn } from '#/lib/utils'
import type { ApiTicket } from '#/services/ticket-service'

type TicketQueueProps = {
  tickets: ApiTicket[]
  selectedTicketId: number
  loading: boolean
  error: string
  isCustomer: boolean
  onRetry: () => void
  onSelect?: () => void
  className?: string
}

export function TicketQueue({
  tickets,
  selectedTicketId,
  loading,
  error,
  isCustomer,
  onRetry,
  onSelect,
  className,
}: TicketQueueProps) {
  const searchId = useId()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('newest')
  const normalizedQuery = query.trim().toLowerCase()
  const visibleTickets = tickets
    .filter((ticket) =>
      [ticket.title, ticket.createdByFullName, String(ticket.id)].some(
        (value) => value.toLowerCase().includes(normalizedQuery),
      ),
    )
    .sort((a, b) =>
      sort === 'oldest'
        ? Date.parse(a.createdAt) - Date.parse(b.createdAt)
        : Date.parse(b.createdAt) - Date.parse(a.createdAt),
    )
  const activeCount = tickets.filter(
    (ticket) => ticket.status !== 'Resolved' && ticket.status !== 'Closed',
  ).length

  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      <div className="space-y-5 px-5 pt-7 pb-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">
            {isCustomer ? 'My requests' : 'My queue'}
          </h2>
          <Button size={'xs'} variant={'secondary'}>
            <Link to="/tickets" className="text-xs " onClick={onSelect}>
              View all
            </Link>
          </Button>
        </div>
        <div className="relative">
          <label htmlFor={searchId} className="sr-only">
            Search requests
          </label>
          <HugeiconsIcon
            icon={Search01Icon}
            className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground"
          />
          <Input
            id={searchId}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search requests…"
            className="h-11 pl-9 text-xs"
          />
        </div>
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-muted-foreground">
            {loading ? 'Loading queue…' : `${activeCount} active requests`}
          </span>
          <Select
            value={sort}
            onValueChange={(value) => value && setSort(value)}
          >
            <SelectTrigger
              aria-label="Sort requests"
              size="sm"
              className="h-7 border-0 bg-transparent px-1 text-xs shadow-none"
            >
              <SelectValue>
                {sort === 'newest' ? 'Newest' : 'Oldest'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <nav
        aria-label="Ticket queue"
        className="min-h-0 flex-1 overflow-y-auto px-2 pb-6 [scrollbar-color:var(--input)_transparent] [scrollbar-width:thin]"
      >
        {loading && tickets.length === 0 ? (
          <div className="space-y-3 px-3" aria-label="Loading tickets">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-21 animate-pulse rounded-md bg-muted"
              />
            ))}
          </div>
        ) : error ? (
          <div className="space-y-3 px-3 py-5 text-xs text-muted-foreground">
            <p>The queue could not be loaded.</p>
            <Button variant="outline" size="sm" onClick={onRetry}>
              Try again
            </Button>
          </div>
        ) : visibleTickets.length === 0 ? (
          <div className="px-3 py-8 text-xs leading-6 text-muted-foreground">
            {query ? 'No requests match your search.' : 'Your queue is clear.'}
            {query && (
              <button
                type="button"
                className="mt-2 block text-foreground underline underline-offset-4"
                onClick={() => setQuery('')}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <ul>
            {visibleTickets.map((ticket) => {
              const selected = ticket.id === selectedTicketId
              return (
                <li key={ticket.id}>
                  <Link
                    to="/tickets/$ticketId"
                    params={{ ticketId: String(ticket.id) }}
                    aria-current={selected ? 'page' : undefined}
                    onClick={onSelect}
                    className={cn(
                      'flex gap-3 rounded-md border-l-3 px-3 py-5 transition-colors',
                      selected
                        ? 'border-primary bg-primary/10'
                        : 'border-transparent hover:bg-muted/70',
                    )}
                  >
                    <UserAvatar
                      name={ticket.createdByFullName}
                      className="size-10 shrink-0"
                    />
                    <span className="min-w-0 flex-1 border-b border-border/70 pb-3">
                      <span className="line-clamp-2 text-xs leading-5 font-medium">
                        {ticket.title}
                      </span>
                      <span className="mt-1.5 block truncate text-[11px] text-muted-foreground">
                        {ticket.createdByFullName} ·{' '}
                        {formatRelativeTime(ticket.createdAt)}
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </nav>
    </div>
  )
}
