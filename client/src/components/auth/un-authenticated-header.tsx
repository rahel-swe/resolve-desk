import { Link } from '@tanstack/react-router'
import AppTitle from '#/components/app-title'
import { Button } from '../ui/button'

const UnAuthenticatedHeader = ({ segment }: { segment: string }) => {
  return (
    <header className="flex h-20 items-center justify-between px-5 sm:px-9">
      <AppTitle isAuthenticated={false} />
      <nav
        aria-label="Account navigation"
        className="flex items-center gap-2 text-sm"
      >
        <Link to="/sign-in">
          <Button variant={segment === 'sign-in' ? 'secondary' : 'outline'}>
            Sign in
          </Button>
        </Link>
        <Link to="/sign-up">
          <Button variant={segment === 'sign-up' ? 'secondary' : 'outline'}>
            Create account
          </Button>
        </Link>
      </nav>
    </header>
  )
}

export default UnAuthenticatedHeader
