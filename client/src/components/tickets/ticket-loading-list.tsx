import { Card, CardContent } from '#/components/ui/card'
import { Skeleton } from '#/components/ui/skeleton'

export function TicketLoadingList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="border-border bg-card shadow-sm">
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
