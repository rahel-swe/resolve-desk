import { Skeleton } from '#/components/ui/skeleton'

export function TicketLoadingList() {
  return (
    <div role="status" aria-label="Loading tickets" className="divide-y">
      <span className="sr-only">Loading tickets…</span>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-6 py-5">
          <Skeleton className="h-4 w-16" /><div className="flex-1 space-y-3"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div><Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  )
}
