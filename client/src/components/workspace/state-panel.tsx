import type { ReactNode } from 'react'
import { InformationCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '#/components/ui/button'
import { Alert, AlertDescription } from '#/components/ui/alert'

export function ResourceError({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <Alert
      variant="destructive"
      className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-md border-destructive/30 bg-destructive/5 p-4 after:hidden"
    >
      <p className="text-destructive">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </Alert>
  )
}

export function PreviewNotice({ children }: { children: ReactNode }) {
  return (
    <Alert
      role="note"
      className="mb-6 flex items-start gap-3 rounded-md border-0 bg-muted/60 p-4 leading-6 after:hidden"
    >
      <HugeiconsIcon
        icon={InformationCircleIcon}
        className="mt-0.5 size-5 shrink-0 text-primary"
      />
      <AlertDescription>
        <span className="font-medium text-foreground">Preview. </span>
        {children}
      </AlertDescription>
    </Alert>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 py-10 text-center">
      <h2 className="font-heading text-2xl">{title}</h2>
      <p className="max-w-sm text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action}
    </div>
  )
}
