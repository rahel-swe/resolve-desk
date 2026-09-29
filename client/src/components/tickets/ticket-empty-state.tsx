import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { Link } from '@tanstack/react-router'

export function TicketEmptyState({
  title,
  description,
  showCreateAction = false,
}: {
  title: string
  description: string
  showCreateAction?: boolean
}) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardContent className="flex flex-col items-start gap-4 p-6">
        <div>
          <h2 className="font-heading text-xl font-semibold uppercase tracking-wider text-foreground">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>

        {showCreateAction ? (
          <Link to="/tickets/new">
            <Button size="sm">Create ticket</Button>
          </Link>
        ) : null}
      </CardContent>
    </Card>
  )
}
