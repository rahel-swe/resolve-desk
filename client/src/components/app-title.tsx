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
        'font-heading text-[30px] leading-none tracking-tight text-foreground',
        className,
      )}
    >
      Resolve<span className="text-primary">Desk</span>
    </Link>
  )
}

export default AppTitle
