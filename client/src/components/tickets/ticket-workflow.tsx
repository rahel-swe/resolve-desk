import { useEffect, useState } from 'react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/ui/select'
import { formatDateTime, formatTicketPriority, formatTicketStatus } from '#/lib/ticket-utils'
import type { TicketWorkspace } from '#/hooks/use-ticket-workspace'

export function TicketWorkflow({ workspace }: { workspace: TicketWorkspace }) {
  const [agentId, setAgentId] = useState('')
  const [selectedStatus, setSelectedStatus] = useState(String(workspace.data?.ticket.status ?? 0))
  useEffect(() => { setSelectedStatus(String(workspace.data?.ticket.status ?? 0)) }, [workspace.data?.ticket.status])
  if (!workspace.data) return null
  const { ticket } = workspace.data
  const canManage = workspace.user?.role === 'Admin' || workspace.user?.role === 'SupportAgent'
  const validAgentId = Number.isSafeInteger(Number(agentId)) && Number(agentId) > 0
  return (
    <section className="space-y-6">
      <h2 className="font-heading text-3xl">Ticket details</h2>
      <dl className="space-y-4 text-sm">
        <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Category</dt><dd className="max-w-[65%] break-words text-right">{ticket.category}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Priority</dt><dd>{formatTicketPriority(ticket.priority)}</dd></div>
        <div><dt className="text-muted-foreground">Requester</dt><dd className="mt-1 break-all">{ticket.createdByEmail}</dd></div>
        <div><dt className="text-muted-foreground">Assignee</dt><dd className="mt-1 break-all">{ticket.assignedAgentEmail || 'Unassigned'}</dd></div>
        <div><dt className="text-muted-foreground">Created</dt><dd className="mt-1">{formatDateTime(ticket.createdAt)}</dd></div>
      </dl>
      {canManage ? <>
        <form className="space-y-3 border-t pt-5" onSubmit={(event) => { event.preventDefault(); void workspace.updateStatus(Number(selectedStatus)) }}>
          <label htmlFor="ticket-status" className="text-sm font-medium">Status</label>
          <Select value={selectedStatus} onValueChange={(value) => { if (value !== null) setSelectedStatus(value) }}><SelectTrigger id="ticket-status" className="w-full rounded-md border-input px-3" disabled={Boolean(workspace.busy)}><SelectValue /></SelectTrigger><SelectContent>{[0, 1, 2, 3, 4].map((status) => <SelectItem value={String(status)} key={status}>{formatTicketStatus(status)}</SelectItem>)}</SelectContent></Select>
          <Button type="submit" variant="outline" className="w-full" disabled={Boolean(workspace.busy) || selectedStatus === String(ticket.status)}>{workspace.busy === 'status' ? 'Updating…' : 'Update status'}</Button>
        </form>
        <form className="space-y-3 border-t pt-5" onSubmit={(event) => { event.preventDefault(); if (validAgentId) void workspace.assign(Number(agentId)).then((success) => { if (success) setAgentId('') }) }}>
          <label htmlFor="agent-id" className="text-sm font-medium">Assign to an agent</label><Input id="agent-id" type="number" inputMode="numeric" min={1} step={1} value={agentId} onChange={(event) => setAgentId(event.target.value)} placeholder="Agent ID" disabled={Boolean(workspace.busy)} /><p className="text-xs leading-5 text-muted-foreground">An agent directory is coming soon. Use an existing agent's ID for now.</p>
          <Button type="submit" variant="outline" className="w-full" disabled={Boolean(workspace.busy) || !validAgentId}>{workspace.busy === 'assign' ? 'Assigning…' : 'Assign ticket'}</Button>
          {workspace.user?.role === 'SupportAgent' && workspace.user.id > 0 && <Button type="button" variant="ghost" className="w-full" disabled={Boolean(workspace.busy)} onClick={() => void workspace.assign(workspace.user!.id)}>Assign to me</Button>}
        </form>
      </> : <p className="border-t pt-5 text-xs leading-5 text-muted-foreground">Your support team manages this ticket's assignment and status.</p>}
    </section>
  )
}
