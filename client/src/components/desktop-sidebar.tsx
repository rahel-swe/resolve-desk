import { useState } from 'react'
import SidebarNav from './sidebar-nav'
import AppTitle from './app-title'
import { getCurrentUser, getAuthToken } from './services/auth-service'

const DesktopSidebar = () => {
  const [sessionUser, setSessionUser] = useState(() => getCurrentUser())

  const isAuthenticated = Boolean(getAuthToken()) || Boolean(sessionUser)

  if (!isAuthenticated) return null

  return (
    <aside className="hidden h-screen w-64 shrink-0 border-r bg-background md:sticky md:top-0 md:flex md:flex-col">
      <div className="flex h-16 items-center border-b px-5">
        <AppTitle isAuthenticated={isAuthenticated} className="mt-12 mb-10" />
      </div>

      <div className="flex-1 p-3">
        <SidebarNav onSetSession={setSessionUser} />
      </div>
    </aside>
  )
}

export default DesktopSidebar
