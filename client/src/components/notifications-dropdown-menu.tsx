import { Button } from '#/components/ui/button'
import { Notification02Icon } from '@hugeicons/core-free-icons'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from '#/components/ui/dropdown-menu'
import { HugeiconsIcon } from '@hugeicons/react'

const NotificationsDropdownMenu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Notifications" />
        }
      >
        <HugeiconsIcon
          icon={Notification02Icon}
          strokeWidth={1.8}
          className="size-6"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 top-1.5 p-4">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-0 text-sm normal-case tracking-normal">
            Notifications{' '}
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              Preview
            </span>
          </DropdownMenuLabel>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Your notifications will appear here when this feature is connected.
          </p>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NotificationsDropdownMenu
