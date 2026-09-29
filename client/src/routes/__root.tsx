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
        title: 'ResolveDesk',
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

  shellComponent: RootDocument,
})

function RootDocument() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>

      <body className="bg-background text-foreground">
        <div className="min-h-screen bg-background flex">
          <DesktopSidebar />

          <div className="flex flex-col w-full">
            <AppHeader />

            <main>
              <Outlet />
            </main>
          </div>
        </div>

        <TanstackDevTools />

        <Scripts />
      </body>
    </html>
  )
}
