import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight01Icon,
  BookOpen01Icon,
  File02Icon,
  Tag01Icon,
  UserIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '#/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { UserAvatar } from '#/components/workspace/user-identity'
import { TicketPriorityIcon } from '#/components/tickets/ticket-badges'
import { formatTicketPriority, formatTicketStatus } from '#/lib/ticket-utils'
import { cn } from '#/lib/utils'
import type { TicketWorkspace } from '#/hooks/use-ticket-workspace'
import type { ApiKnowledgeArticle } from '#/services/ticket-service'
import type { TicketPriority, TicketStatus } from '#/types/ticket-enums'

const statusTransitions: Record<TicketStatus, TicketStatus[]> = {
  Open: ['InProgress'],
  InProgress: ['WaitingForCustomer', 'Resolved'],
  WaitingForCustomer: ['InProgress'],
  Resolved: ['Closed', 'InProgress'],
  Closed: [],
}

// Preview choices have no server IDs and never call the assignment endpoint.
const previewStaff = ['Noah Ellis', 'Jordan Lee', 'Sam Rivera']
const priorities: TicketPriority[] = ['Low', 'Medium', 'High', 'Critical']
const statusColors: Record<TicketStatus, string> = {
  Open: 'bg-chart-2',
  InProgress: 'bg-chart-1',
  WaitingForCustomer: 'bg-primary',
  Resolved: 'bg-chart-3',
  Closed: 'bg-muted-foreground',
}

export function TicketWorkflow({
  workspace,
  relatedArticles = [],
  onOpenArticle,
}: {
  workspace: TicketWorkspace
  relatedArticles?: ApiKnowledgeArticle[]
  onOpenArticle?: (article: ApiKnowledgeArticle) => void
}) {
  const ticket = workspace.data?.ticket
  const [previewPriority, setPriority] = useState<TicketPriority | null>(null)
  const [previewAssignee, setAssignee] = useState<string | null>(null)
  const [previewCategory, setCategory] = useState<string | null>(null)

  if (!ticket) return null

  const priority = previewPriority ?? ticket.priority
  const assignee =
    previewAssignee ?? ticket.assignedStaffFullName ?? 'Unassigned'
  const category = previewCategory ?? ticket.category
  const user = workspace.user
  const isTeam = user?.role === 'Admin' || user?.role === 'Staff'
  const isAdmin = user?.role === 'Admin'
  const canUpdateStatus =
    isAdmin ||
    (user?.role === 'Staff' &&
      ticket.assignedStaffEmail?.toLowerCase() === user.email.toLowerCase())
  const canAssignSelf =
    user !== null &&
    user.id > 0 &&
    (isAdmin || (user.role === 'Staff' && !ticket.assignedStaffEmail)) &&
    ticket.assignedStaffEmail?.toLowerCase() !== user.email.toLowerCase()
  const categories = [
    ...new Set([
      ticket.category,
      'Account access',
      'Billing',
      'Technical support',
      'General inquiry',
    ]),
  ]
  const assignees = [
    ...new Set([
      ticket.assignedStaffFullName || 'Unassigned',
      'Unassigned',
      ...previewStaff,
    ]),
  ]

  return (
    <section className="space-y-7" aria-labelledby="ticket-details-heading">
      <h2
        id="ticket-details-heading"
        className="font-heading text-4xl leading-none"
      >
        Ticket details
      </h2>
      <div className="space-y-5">
        <div className="space-y-2.5">
          <label htmlFor="ticket-status" className="text-sm font-medium">
            Status
          </label>
          <Select
            value={ticket.status}
            onValueChange={(status) => {
              if (
                status &&
                canUpdateStatus &&
                statusTransitions[ticket.status].includes(status)
              )
                void workspace.updateStatus(status)
            }}
          >
            <SelectTrigger
              id="ticket-status"
              className="h-12 w-full px-3.5"
              disabled={
                !canUpdateStatus ||
                Boolean(workspace.busy) ||
                statusTransitions[ticket.status].length === 0
              }
            >
              <SelectValue>
                <span
                  className={`size-2.5 shrink-0 rounded-full ${statusColors[ticket.status]}`}
                />
                {formatTicketStatus(ticket.status)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {[ticket.status, ...statusTransitions[ticket.status]].map(
                (status) => (
                  <SelectItem key={status} value={status}>
                    {formatTicketStatus(status)}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
          {isTeam && !canUpdateStatus && (
            <p className="text-[11px] leading-5 text-muted-foreground">
              The assigned staff member or an administrator can change the
              status.
            </p>
          )}
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="ticket-priority" className="text-sm font-medium">
              Priority
            </label>
            {isTeam && (
              <span className="rounded-md bg-secondary px-2 py-1 text-[10px] text-muted-foreground">
                Preview
              </span>
            )}
          </div>
          <Select
            value={priority}
            onValueChange={(value) => value && setPriority(value)}
          >
            <SelectTrigger
              id="ticket-priority"
              className="h-12 w-full px-3.5"
              disabled={!isTeam}
            >
              <SelectValue>
                <TicketPriorityIcon priority={priority} className="size-4" />
                {formatTicketPriority(priority)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {priorities.map((value) => (
                <SelectItem key={value} value={value}>
                  <TicketPriorityIcon priority={value} />
                  {formatTicketPriority(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isTeam && (
            <>
              <button
                type="button"
                className="text-[11px] text-muted-foreground underline-offset-4 hover:text-primary hover:underline disabled:opacity-50"
                disabled={Boolean(workspace.busy)}
                onClick={() => void workspace.suggestPriority()}
              >
                {workspace.busy === 'priority-ai'
                  ? 'Thinking…'
                  : 'Suggest priority with AI'}
              </button>
              {workspace.prioritySuggestion && (
                <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-xs leading-5">
                  <p className="font-medium">
                    Suggested:{' '}
                    {formatTicketPriority(
                      workspace.prioritySuggestion.suggestedPriority,
                    )}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {workspace.prioritySuggestion.rationale}
                  </p>
                  <button
                    type="button"
                    className="mt-2 text-primary underline underline-offset-4"
                    onClick={() =>
                      setPriority(
                        workspace.prioritySuggestion!.suggestedPriority,
                      )
                    }
                  >
                    Preview this priority
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="ticket-assignee" className="text-sm font-medium">
              Assignee
            </label>
            {isTeam && (
              <span className="rounded-md bg-secondary px-2 py-1 text-[10px] text-muted-foreground">
                Preview
              </span>
            )}
          </div>
          <Select
            value={assignee}
            onValueChange={(value) => value && setAssignee(value)}
          >
            <SelectTrigger
              id="ticket-assignee"
              className={cn(
                'h-12 w-full px-3.5',
                assignee === 'Unassigned' &&
                  'border-dashed bg-transparent text-muted-foreground',
              )}
              disabled={!isTeam}
            >
              <SelectValue>
                <HugeiconsIcon
                  icon={UserIcon}
                  className="size-4 text-muted-foreground"
                />
                {assignee}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {assignees.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isTeam && (
            <p className="text-[11px] leading-5 text-muted-foreground">
              Priority and assignee previews are not saved.
            </p>
          )}
          {canAssignSelf && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              disabled={Boolean(workspace.busy)}
              onClick={() => void workspace.assign(user.id)}
            >
              {workspace.busy === 'assign' ? 'Assigning…' : 'Assign to me'}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6 border-t pt-7">
        <div>
          <p className="mb-4 text-sm font-medium">Requester</p>
          <div className="flex items-center gap-3">
            <UserAvatar
              name={ticket.createdByFullName}
              className="size-12 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium">{ticket.createdByFullName}</p>
              <p
                className="mt-1 truncate text-xs text-muted-foreground"
                title={ticket.createdByEmail}
              >
                {ticket.createdByEmail}
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="ticket-category" className="text-sm font-medium">
              Category
            </label>
            {isTeam && (
              <span className="text-[10px] text-muted-foreground">Preview</span>
            )}
          </div>
          <Select
            value={category}
            onValueChange={(value) => value && setCategory(value)}
          >
            <SelectTrigger
              id="ticket-category"
              className="h-12 w-full px-3.5"
              disabled={!isTeam}
            >
              <SelectValue>
                <HugeiconsIcon
                  icon={Tag01Icon}
                  className="size-4 text-muted-foreground"
                />
                {category}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {categories.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isTeam && category !== ticket.category && (
            <p className="text-[11px] text-muted-foreground">
              Category preview is not saved.
            </p>
          )}
        </div>
      </div>

      <div className="border-t pt-7">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-medium">
          <HugeiconsIcon icon={BookOpen01Icon} className="size-4" />
          Related knowledge
        </h3>
        {relatedArticles.length > 0 ? (
          <div className="space-y-3">
            {relatedArticles.map((article) => (
              <button
                key={article.id}
                type="button"
                onClick={() => onOpenArticle?.(article)}
                className="flex w-full gap-3 rounded-lg border bg-muted/35 p-4 text-left transition-colors hover:border-foreground/25 hover:bg-muted"
              >
                <HugeiconsIcon
                  icon={File02Icon}
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs leading-5 font-medium">
                    {article.title}
                  </span>
                  <span className="mt-1 block line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {article.content}
                  </span>
                </span>
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                />
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs leading-6 text-muted-foreground">
            No related articles yet.
          </p>
        )}
        <Link
          to="/knowledge"
          className="mt-4 inline-block text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Browse the knowledge base
        </Link>
      </div>
    </section>
  )
}
