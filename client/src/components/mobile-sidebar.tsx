import { Cancel01Icon, Menu01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link, Navigate } from '@tanstack/react-router'
import { useState } from 'react'

import SidebarNav from './sidebar-nav'
import { getCurrentUser, getAuthToken } from '#/lib/api'
import { Button } from './ui/button'

const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const openSidebar = () => setIsOpen(true)
  const closeSidebar = () => setIsOpen(false)
  const [sessionUser] = useState(() => getCurrentUser())

  const isAuthenticated = Boolean(getAuthToken()) || Boolean(sessionUser)

  if (!isAuthenticated) return null

  return (
    <>
      <Button
        aria-label="Open navigation"
        aria-expanded={isOpen}
        onClick={openSidebar}
        variant={'secondary'}
        className="md:hidden px-3"
      >
        <HugeiconsIcon icon={Menu01Icon} className="size-6" />
      </Button>

      {isOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-secondary/45 backdrop-blur-sm md:hidden"
        />
      ) : null}

      <aside
        className={`
          fixed inset-y-0 h-min bg-card border left-0 z-50 flex w-[90%] flex-col border-r
          transition-transform duration-200 ease-out md:hidden
          ${isOpen ? '-translate-x-1/2 top-10 left-1/2' : '-translate-x-full'}
        `}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Link
            to="/dashboard"
            onClick={closeSidebar}
            className="text-lg font-semibold tracking-tight text-foreground"
          >
            ResolveDesk
          </Link>

          <Button
            type="button"
            variant={'secondary'}
            aria-label="Close navigation"
            onClick={closeSidebar}
            className="flex px-3 items-center"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="size-5" />
          </Button>
        </div>

        <div className="flex-1 p-3">
          <SidebarNav onNavigate={closeSidebar} />
        </div>
      </aside>
    </>
  )
}

export default MobileSidebar
