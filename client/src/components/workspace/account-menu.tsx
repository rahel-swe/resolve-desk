import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { UserIdentity } from '#/components/workspace/user-identity'
import { useAuth } from '#/providers/auth-provider'

export function AccountMenu({ expanded = false }: { expanded?: boolean }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  async function handleSignOut() {
    setBusy(true)
    try {
      await signOut()
    } catch {
      /* The auth service clears the local session. */
    } finally {
      setBusy(false)
      await navigate({ to: '/sign-in', replace: true })
    }
  }

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
        <UserIdentity user={user} compact={!expanded} />
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
            disabled={busy}
            onClick={() => void handleSignOut()}
            className="text-sm normal-case tracking-normal"
          >
            {busy ? 'Signing out…' : 'Sign out'}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
