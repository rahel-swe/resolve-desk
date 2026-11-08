import { Input } from '#/components/ui/input'
import { SidebarTrigger } from '#/components/ui/sidebar'
import { AccountMenu } from '#/components/workspace/account-menu'
import { useAuth } from '#/providers/auth-provider'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import UnAuthenticatedHeader from './auth/un-authenticated-header'
import NotificationsDropdownMenu from './notifications-dropdown-menu'

const pageLabels: Record<string, string> = {
  dashboard: 'Overview',
  tickets: 'Tickets',
  knowledge: 'Knowledge',
  profile: 'Your profile',
  settings: 'Settings',
  team: 'Team',
  reports: 'Reports',
}

export function AppHeader() {
  const { isAuthenticated, user } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const segments = pathname.split('/').filter(Boolean)

  if (!isAuthenticated) return <UnAuthenticatedHeader segment={segments[0]} />

  return (
    <header className="sticky top-0 z-20 mx-2 flex h-(--app-header-height) shrink-0 items-center justify-between gap-4 rounded-b-xl border-b bg-muted/45 px-5 backdrop-blur-sm sm:px-8 md:rounded-b-2xl">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        <p className="truncate text-sm">
          <span className="hidden text-muted-foreground sm:inline">
            Workspace<span className="mx-4 text-muted-foreground/50">/</span>
          </span>
          {pageLabels[segments[0]] === 'Tickets' && user?.role === 'Customer'
            ? 'Requests'
            : pageLabels[segments[0]] || 'Workspace'}
          {segments.length > 1 && (
            <span className="ml-3 text-muted-foreground">
              / {segments[1] === 'new' ? 'New' : `#${segments[1]}`}
            </span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <form
          className="relative hidden w-64 lg:block xl:w-72"
          role="search"
          onSubmit={(event) => {
            event.preventDefault()
            void navigate({
              to: '/tickets',
              search: { q: query.trim(), scope: 'all' },
            })
          }}
        >
          <HugeiconsIcon
            icon={Search01Icon}
            className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground"
          />
          <Input
            aria-label="Search tickets"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tickets…"
            className="h-10 pl-9 text-xs"
          />
        </form>
        <NotificationsDropdownMenu />
        <AccountMenu />
      </div>
    </header>
  )
}
