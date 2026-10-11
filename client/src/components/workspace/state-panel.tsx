import type { ReactNode } from 'react'
import { InformationCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '#/components/ui/button'

export function ResourceError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
      <p className="text-destructive">{message}</p>
      {onRetry && <Button variant="outline" size="sm" onClick={onRetry}>Try again</Button>}
    </div>
  )
}

export function PreviewNotice({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-md bg-muted/60 p-4 text-sm leading-6 text-muted-foreground">
      <HugeiconsIcon icon={InformationCircleIcon} className="mt-0.5 size-5 shrink-0 text-primary" />
      <p><span className="font-medium text-foreground">Preview. </span>{children}</p>
    </div>
  )
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 py-10 text-center">
      <h2 className="font-heading text-2xl">{title}</h2>
      <p className="max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      {action}
    </div>
  )
}
