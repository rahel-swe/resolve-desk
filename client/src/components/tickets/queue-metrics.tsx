import { Skeleton } from '#/components/ui/skeleton'
import { ticketCounts } from '#/lib/ticket-utils'
import type { ApiTicket } from '#/services/ticket-service'

export function QueueMetrics({
  tickets,
  loading,
  unavailable = false,
}: {
  tickets: ApiTicket[]
  loading: boolean
  unavailable?: boolean
}) {
  return (
    <section
      aria-label="Ticket queue summary"
      className="grid grid-cols-2 gap-y-6 border-y py-7 sm:grid-cols-4"
    >
      {ticketCounts(tickets).map((stat, index) => (
        <div
          key={stat.label}
          className={index === 0 ? 'pr-5' : 'border-l px-5 sm:px-7'}
        >
          <p className="text-sm text-muted-foreground">{stat.label}</p>
          {loading ? (
            <Skeleton className="mt-3 h-12 w-16" />
          ) : (
            <p className="mt-1 font-heading text-5xl tabular-nums">
              {unavailable ? '—' : stat.value}
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            in your ticket queue
          </p>
        </div>
      ))}
    </section>
  )
}
