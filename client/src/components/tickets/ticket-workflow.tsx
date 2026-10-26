import { useEffect, useState } from 'react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import {
  formatDateTime,
  formatTicketPriority,
  formatTicketStatus,
} from '#/lib/ticket-utils'
import type { TicketWorkspace } from '#/hooks/use-ticket-workspace'
import type { TicketStatus } from '#/types/ticket-enums'

// Keep available actions aligned with the server's ticket state machine.
const statusTransitions: Record<TicketStatus, TicketStatus[]> = {
  Open: ['InProgress'],
  InProgress: ['WaitingForCustomer', 'Resolved'],
  WaitingForCustomer: ['InProgress'],
  Resolved: ['Closed', 'InProgress'],
  Closed: [],
}

export function TicketWorkflow({ workspace }: { workspace: TicketWorkspace }) {
  const [agentId, setAgentId] = useState('')

  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>(
    workspace.data?.ticket.status ?? 'Open',
  )

  useEffect(() => {
    setSelectedStatus(workspace.data?.ticket.status ?? 'Open')
  }, [workspace.data?.ticket.status])

  if (!workspace.data) return null

  const { ticket } = workspace.data

  const user = workspace.user
  const isAdmin = user?.role === 'Admin'
  const isAgent = user?.role === 'SupportAgent'

  const canUpdateStatus =
    isAdmin ||
    (isAgent &&
      ticket.assignedAgentEmail?.toLowerCase() === user.email.toLowerCase())

  const nextStatuses = statusTransitions[ticket.status]
  const canAssignSelf = isAgent && !ticket.assignedAgentEmail && user.id > 0
  const validAgentId =
    Number.isSafeInteger(Number(agentId)) && Number(agentId) > 0

  return (
    <section className="space-y-6">
      <h2 className="font-heading text-3xl">Ticket details</h2>
      <dl className="space-y-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Category</dt>
          <dd className="max-w-[65%] wrap-break-word text-right">
            {ticket.category}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Priority</dt>
          <dd>{formatTicketPriority(ticket.priority)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Requester</dt>
          <dd className="mt-1 break-all">{ticket.createdByEmail}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Assignee</dt>
          <dd className="mt-1 break-all">
            {ticket.assignedAgentEmail || 'Unassigned'}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Created</dt>
          <dd className="mt-1">{formatDateTime(ticket.createdAt)}</dd>
        </div>
      </dl>
      {isAdmin || isAgent ? (
        <>
          <form
            className="space-y-3 border-t pt-5"
            onSubmit={(event) => {
              event.preventDefault()
              if (
                canUpdateStatus &&
                nextStatuses.find((s) => s === selectedStatus)
              )
                void workspace.updateStatus(selectedStatus)
            }}
          >
            <label htmlFor="ticket-status" className="text-sm font-medium">
              Status
            </label>
            <div className="flex flex-col md:flex-row lg:flex-col gap-4">
              <Select
                value={selectedStatus}
                onValueChange={(value) => {
                  if (value !== null) setSelectedStatus(value)
                }}
              >
                <SelectTrigger
                  id="ticket-status"
                  className="w-full rounded-md border-input px-3 flex-1"
                  disabled={
                    Boolean(workspace.busy) ||
                    !canUpdateStatus ||
                    nextStatuses.length === 0
                  }
                >
                  <SelectValue>
                    {formatTicketStatus(selectedStatus)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {[ticket.status, ...nextStatuses].map((status) => (
                    <SelectItem value={String(status)} key={status}>
                      {formatTicketStatus(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="submit"
                variant="outline"
                className=""
                disabled={
                  Boolean(workspace.busy) ||
                  !canUpdateStatus ||
                  !nextStatuses.find((s) => s === selectedStatus)
                }
              >
                {workspace.busy === 'status' ? 'Updating…' : 'Update status'}
              </Button>
              {!canUpdateStatus && (
                <p className="text-xs leading-5 text-muted-foreground">
                  Only the assigned agent or an administrator can update this
                  ticket.
                </p>
              )}
            </div>
          </form>
          {isAdmin && (
            <form
              className="space-y-3 border-t pt-5"
              onSubmit={(event) => {
                event.preventDefault()
                if (validAgentId)
                  void workspace.assign(Number(agentId)).then((success) => {
                    if (success) setAgentId('')
                  })
              }}
            >
              <label htmlFor="agent-id" className="text-sm font-medium">
                Assign to an agent
              </label>
              <div className="flex flex-col md:flex-row lg:flex-col gap-4">
                <Input
                  id="agent-id"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  value={agentId}
                  onChange={(event) => setAgentId(event.target.value)}
                  placeholder="Agent ID"
                  disabled={Boolean(workspace.busy)}
                />

                <Button
                  type="submit"
                  variant="outline"
                  className=""
                  disabled={Boolean(workspace.busy) || !validAgentId}
                >
                  {workspace.busy === 'assign' ? 'Assigning…' : 'Assign ticket'}
                </Button>
              </div>
              <p className="text-xs leading-5 text-muted-foreground">
                An agent directory is coming soon. Use an existing agent's ID
                for now.
              </p>
            </form>
          )}
          {canAssignSelf && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={Boolean(workspace.busy)}
              onClick={() => void workspace.assign(user.id)}
            >
              {workspace.busy === 'assign' ? 'Assigning…' : 'Assign to me'}
            </Button>
          )}
        </>
      ) : (
        <p className="border-t pt-5 text-xs leading-5 text-muted-foreground">
          Your support team manages this ticket's assignment and status.
        </p>
      )}
    </section>
  )
}
