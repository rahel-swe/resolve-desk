import { cn } from '#/lib/utils'
import { displayName, initials, roleLabel } from '#/lib/user-utils'
import type { User } from '#/providers/auth-provider'
import { Avatar, AvatarFallback } from '#/components/ui/avatar'

export function UserAvatar({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  return (
    <Avatar aria-hidden="true" size="lg" className={cn('size-10', className)}>
      <AvatarFallback className="bg-primary/25 text-sm font-medium text-foreground">
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  )
}

export function UserIdentity({
  user,
  compact = false,
}: {
  user: User | null
  compact?: boolean
}) {
  const name = displayName(user?.email)
  return (
    <span className="flex min-w-0 items-center gap-3 text-left">
      <UserAvatar name={name} />
      {!compact && (
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-foreground">
            {name}
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {roleLabel(user?.role)}
          </span>
        </span>
      )}
    </span>
  )
}
