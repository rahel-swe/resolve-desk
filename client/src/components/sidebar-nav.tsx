import { navItems } from '#/constants/nav-items'
import { useAuth } from '#/providers/auth-provider'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from './ui/button'

type SidebarNavProps = {
  onNavigate?: () => void
}

const SidebarNav = ({ onNavigate }: SidebarNavProps) => {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
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
