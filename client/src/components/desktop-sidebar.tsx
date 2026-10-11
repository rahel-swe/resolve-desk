import { Link, useLocation } from '@tanstack/react-router'
import { Settings01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import SidebarNav from './sidebar-nav'
import AppTitle from './app-title'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '#/components/ui/sidebar'
import { AccountMenu } from '#/components/workspace/account-menu'
import { useAuth } from '#/providers/auth-provider'

export default function DesktopSidebar() {
  const { isAuthenticated } = useAuth()
  const { pathname } = useLocation()
  const { setOpenMobile } = useSidebar()
  if (!isAuthenticated) return null
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="gap-8 px-6 pt-7 pb-5"><AppTitle isAuthenticated /><p className="text-xs text-muted-foreground">Support workspace</p></SidebarHeader>
      <SidebarContent className="px-2"><SidebarNav /></SidebarContent>
      <SidebarFooter className="gap-5 p-2 pb-3">
        <SidebarMenu><SidebarMenuItem><SidebarMenuButton render={<Link to="/settings" />} isActive={pathname === '/settings'} onClick={() => setOpenMobile(false)} className="h-11 gap-3 rounded-md px-4 text-muted-foreground"><HugeiconsIcon icon={Settings01Icon} className="size-5" /><span>Settings</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu>
        <div className="border-t pt-2"><AccountMenu expanded /></div>
      </SidebarFooter>
    </Sidebar>
  )
}
