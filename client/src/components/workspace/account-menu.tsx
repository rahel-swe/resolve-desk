import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { UserAvatar } from '#/components/workspace/user-identity'
import { useRequireAuth } from '#/hooks/use-require-auth'
import { useAuth } from '#/providers/auth-provider'
import { roleLabel } from '#/lib/user-utils'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from '@tanstack/react-router'

export function AccountMenu({ expanded = false }: { expanded?: boolean }) {
  const { user, signOut, isSigningOutPending } = useAuth()
  const isAuthenticated = useRequireAuth()

  if (!isAuthenticated) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open account menu"
        className={
          expanded
            ? 'flex w-full items-center justify-between gap-3 rounded-md px-3 py-3 hover:bg-sidebar-accent'
            : 'rounded-full focus-visible:ring-2 focus-visible:ring-ring'
        }
      >
        {user ? (
          <span className="flex min-w-0 items-center gap-3 text-left">
            <UserAvatar name={user.email} />
            {expanded && (
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-foreground">
                  {user.email}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {roleLabel(user.role)}
                </span>
              </span>
            )}
          </span>
        ) : (
          <span className="truncate text-sm text-muted-foreground">
            Loading account…
          </span>
        )}
        {expanded && (
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            className="size-4 shrink-0 text-muted-foreground"
          />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={expanded ? 'start' : 'end'}
        side={expanded ? 'top' : 'bottom'}
        className="w-60"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate normal-case tracking-normal">
            <h2 className="text-lg text-foreground">Your account</h2>
            {user?.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            render={<Link to="/profile" />}
            className="text-sm normal-case tracking-normal"
          >
            Your profile
          </DropdownMenuItem>
          <DropdownMenuItem
            render={<Link to="/settings" />}
            className="text-sm normal-case tracking-normal"
          >
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={isSigningOutPending}
            variant="destructive"
            onClick={async () => await signOut()}
            className="text-sm normal-case tracking-normal"
          >
            {isSigningOutPending ? 'Signing out…' : 'Sign out'}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
