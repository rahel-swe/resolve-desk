import { cn } from '#/lib/utils'
import { displayName, initials, roleLabel } from '#/lib/user-utils'
import type { User } from '#/providers/auth-provider'

export function UserAvatar({ name, className }: { name: string; className?: string }) {
  return <span aria-hidden="true" className={cn('flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-foreground', className)}>{initials(name)}</span>
}

export function UserIdentity({ user, compact = false }: { user: User | null; compact?: boolean }) {
  const name = displayName(user?.email)
  return (
    <span className="flex min-w-0 items-center gap-3 text-left">
      <UserAvatar name={name} />
      {!compact && <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-foreground">{name}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{roleLabel(user?.role)}</span>
      </span>}
    </span>
  )
}
