import { Button } from '#/components/ui/button'
import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import AppTitle from './app-title'
import MobileSidebar from './mobile-sidebar'
import { getCurrentUser, getAuthToken } from './services/auth-service'

export function AppHeader() {
  const [sessionUser, setSessionUser] = useState(() => getCurrentUser())

  useEffect(() => {
    setSessionUser(getCurrentUser())
  }, [])

  const isAuthenticated = Boolean(getAuthToken()) || Boolean(sessionUser)

  return (
    <header className="backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl justify-between py-3 px-4 sm:px-6 lg:px-8 pt-7">
        <AppTitle
          isAuthenticated={isAuthenticated}
          className={isAuthenticated ? 'md:hidden' : ''}
        />

        <nav className="flex items-center gap-2">
          {isAuthenticated ? (
            <MobileSidebar />
          ) : (
            <div className="flex gap-2 flex-col items-end self-end">
              <Link to="/sign-up">
                <Button variant="outline">Create account</Button>
              </Link>

              <Link to="/sign-in">
                <Button variant="secondary">Sign in</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
