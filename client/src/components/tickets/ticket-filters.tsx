import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Input } from '#/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs'

type TicketFiltersProps = {
  query: string
  scope: string
  status: string
  priority: string
  onQuery: (value: string) => void
  onScope: (value: string) => void
  onStatus: (value: string) => void
  onPriority: (value: string) => void
}

export function TicketFilters({ query, scope, status, priority, onQuery, onScope, onStatus, onPriority }: TicketFiltersProps) {
  return (
    <div className="mb-4 mt-7 space-y-5">
      <Tabs value={scope} onValueChange={(value) => onScope(String(value))}><TabsList variant="line" className="max-w-full gap-1 overflow-x-auto"><TabsTrigger value="all" className="text-sm font-medium normal-case tracking-normal data-active:text-primary after:bg-primary">All tickets</TabsTrigger><TabsTrigger value="mine" className="text-sm font-medium normal-case tracking-normal data-active:text-primary after:bg-primary">Assigned to me</TabsTrigger><TabsTrigger value="unassigned" className="text-sm font-medium normal-case tracking-normal data-active:text-primary after:bg-primary">Unassigned</TabsTrigger></TabsList></Tabs>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1"><HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground" /><Input aria-label="Search ticket queue" value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Search tickets, requesters, or categories…" className="rounded-md border-input bg-muted/20 pr-3 pl-9" /></div>
        <div className="flex gap-3">
          <Select value={status} onValueChange={(value) => onStatus(value ?? 'all')}><SelectTrigger aria-label="Filter by status" className="w-40 rounded-md border-input px-3"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{['Open', 'In progress', 'Waiting', 'Resolved', 'Closed'].map((label, index) => <SelectItem key={label} value={String(index)}>{label}</SelectItem>)}</SelectContent></Select>
          <Select value={priority} onValueChange={(value) => onPriority(value ?? 'all')}><SelectTrigger aria-label="Filter by priority" className="w-36 rounded-md border-input px-3"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All priorities</SelectItem>{['Low', 'Medium', 'High', 'Critical'].map((label, index) => <SelectItem key={label} value={String(index)}>{label}</SelectItem>)}</SelectContent></Select>
        </div>
      </div>
    </div>
  )
}
