import { Avatar, AvatarFallback } from '#/components/ui/avatar'
import { initials, roleLabel } from '#/lib/user-utils'
import { cn } from '#/lib/utils'
import type { UserProfile } from '#/types/user-types'

export function UserAvatar({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  return (
    <Avatar aria-hidden="true" className={cn('size-11', className)}>
      <AvatarFallback className="bg-popover text-sm font-medium text-foreground">
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  )
}

export function UserIdentity({
  userProfile: profile,
  compact = false,
}: {
  userProfile: Pick<UserProfile, 'fullName' | 'role'>
  compact?: boolean
}) {
  return (
    <span className="flex min-w-0 items-center gap-3 text-left">
      <UserAvatar name={profile.fullName} />
      {!compact && (
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-foreground">
            {profile.fullName}
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {roleLabel(profile.role)}
          </span>
        </span>
      )}
    </span>
  )
}
