import { HugeiconsIcon } from '@hugeicons/react'
import { Link, useLocation } from '@tanstack/react-router'
import { navItems } from '#/constants/nav-items'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '#/components/ui/sidebar'
import { useWorkspace } from '#/providers/workspace-provider'
import { cn } from 'cn'

export default function SidebarNav() {
  const { pathname } = useLocation()
  const { setOpenMobile } = useSidebar()
  const { queue } = useWorkspace()
  const openCount = queue.data.filter((ticket) => ticket.status === 0).length

  return (
    <nav aria-label="Workspace navigation">
      <SidebarMenu className="gap-2">
        {navItems.map((item) => (
          <SidebarMenuItem
            key={item.to}
            className={cn('', item.to === '/team' ? 'mt-5 border-t pt-5' : '')}
          >
            <SidebarMenuButton
              render={<Link to={item.to} />}
              isActive={
                pathname === item.to || pathname.startsWith(`${item.to}/`)
              }
              onClick={() => setOpenMobile(false)}
              className="h-12 gap-3 border-l-2 border-transparent px-4 text-sm text-muted-foreground data-active:border-primary data-active:bg-sidebar-accent/65 data-active:text-foreground [&_svg]:size-5 data-active:[&_svg]:text-primary"
            >
              <HugeiconsIcon icon={item.icon} strokeWidth={1.8} />

              <span>{item.label}</span>
              {item.preview && (
                <span className="ml-auto rounded-full bg-muted px-2 py-1 text-[10px] text-muted-foreground">
                  Preview
                </span>
              )}
              {item.to === '/tickets' &&
                !queue.loading &&
                !queue.error &&
                openCount > 0 && (
                  <span className="ml-auto rounded-full bg-muted px-2 py-1 text-xs">
                    {openCount}
                  </span>
                )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </nav>
  )
}
