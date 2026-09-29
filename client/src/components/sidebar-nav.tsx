import { navItems } from '#/constants/nav-items'
import { logoutFromApi } from '#/lib/api'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from './ui/button'

type SidebarNavProps = {
  onNavigate?: () => void
  onSetSession?: (
    userSesssion: {
      email: string
      role: string
    } | null,
  ) => void
}

const SidebarNav = ({ onNavigate, onSetSession }: SidebarNavProps) => {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logoutFromApi()
    if (onSetSession) onSetSession(null)
    navigate({
      to: '/sign-in',
    })
  }

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground mx-auto max-w-42 w-full"
          activeProps={{
            className: 'bg-muted text-foreground',
          }}
        >
          {'icon' in item ? (
            <HugeiconsIcon icon={item.icon} className="size-9 shrink-0" />
          ) : null}

          <span className="text-base">{item.label}</span>
        </Link>
      ))}

      <Button
        variant={'destructive'}
        className={'mt-16 max-w-42 mx-auto w-full'}
        onClick={handleLogout}
      >
        Log out
      </Button>
    </nav>
  )
}

export default SidebarNav
