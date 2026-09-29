import { Link } from '@tanstack/react-router'
import { cn } from 'cn'

const AppTitle = ({
  isAuthenticated,
  className,
}: {
  isAuthenticated: boolean
  className?: string
}) => {
  return (
    <Link
      to={isAuthenticated ? '/dashboard' : '/sign-in'}
      className={cn(
        'text-2xl uppercase text-foreground font-semibold',
        className,
      )}
    >
      Resolve_Desk
    </Link>
  )
}

export default AppTitle
