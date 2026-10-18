import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'

import TanstackDevTools from '#/providers/tanstack-dev-tools'
import { AppHeader } from '#/components/app-header'

import appCss from '../globals.css?url'
import DesktopSidebar from '#/components/desktop-sidebar'
import { AuthProvider } from '#/providers/auth-provider'
import { QueryProvider } from '#/providers/query-provider'
import RootError from '#/pages/root-error'
import NotFound from '#/pages/not-found'
import { WorkspaceProvider } from '#/providers/workspace-provider'
import { SidebarProvider } from '#/components/ui/sidebar'
import { TooltipProvider } from '#/components/ui/tooltip'
import type { CSSProperties } from 'react'
import { Toaster } from '#/components/ui/toast'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'ResolveDesk · Support workspace',
      },
      {
        name: 'description',
        content:
          'Manage customer support, knowledge, tickets, and AI-assisted workflows in one focused workspace.',
      },
    ],

    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  errorComponent: RootError,
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
})

function RootDocument() {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>

      <body className="bg-background text-foreground">
        <Toaster />
        <QueryProvider>
          <AuthProvider>
            <WorkspaceProvider>
              <TooltipProvider>
                <SidebarProvider
                  style={{ '--sidebar-width': '15.5rem' } as CSSProperties}
                >
                  <a
                    href="#main-content"
                    className="sr-only fixed top-3 left-3 z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only"
                  >
                    Skip to content
                  </a>
                  <DesktopSidebar />

                  <div className="flex min-w-0 flex-1 flex-col">
                    <AppHeader />

                    <main id="main-content" className="flex-1">
                      <Outlet />
                    </main>
                  </div>
                </SidebarProvider>
              </TooltipProvider>
            </WorkspaceProvider>
          </AuthProvider>
        </QueryProvider>

        {import.meta.env.DEV && <TanstackDevTools />}

        <Scripts />
      </body>
    </html>
  )
}
