import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Textarea } from '#/components/ui/textarea'
import {
  TicketPriorityBadge,
  TicketStatusBadge,
} from '#/components/tickets/ticket-badges'
import { TicketLoadingList } from '#/components/tickets/ticket-loading-list'

import {
  Link,
  createFileRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { getCurrentUserProfile } from '#/services/auth-service'
import { useAuth } from '#/providers/auth-provider'
import type { User } from '#/providers/auth-provider'
import {
  getTicketByIdApi,
  getTicketComments,
  getTicketHistory,
  getTicketPrioritySuggestion,
  updateTicketStatus,
  assignTicket,
  createTicketComment,
  getTicketResponseSuggestion,
} from '#/services/ticket-service'
import type {
  ApiTicket,
  ApiTicketComment,
  ApiTicketHistory,
} from '#/services/ticket-service'
import {
  formatTicketPriority,
  formatDateTime,
  formatTicketStatus,
} from '#/lib/ticket-utils'

const statusOptions = [
  { value: '0', label: 'Open' },
  { value: '1', label: 'In Progress' },
  { value: '2', label: 'Waiting' },
  { value: '3', label: 'Resolved' },
  { value: '4', label: 'Closed' },
]

export const Route = createFileRoute('/tickets/$ticketId')({
  component: TicketDetailPage,
})

function TicketDetailPage() {
  const navigate = useNavigate()
  const { ticketId } = useParams({ from: '/tickets/$ticketId' })
  const ticketIdNumber = Number(ticketId)

  const [ticket, setTicket] = useState<ApiTicket | null>(null)
  const [comments, setComments] = useState<ApiTicketComment[]>([])
  const [history, setHistory] = useState<ApiTicketHistory[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [prioritySuggestion, setPrioritySuggestion] = useState('')
  const [responseSuggestion, setResponseSuggestion] = useState('')
  const [commentMessage, setCommentMessage] = useState('')
  const [assignedAgentId, setAssignedAgentId] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyAction, setBusyAction] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/sign-in' })
      return
    }

    let isMounted = true

    const loadTicketWorkspace = async () => {
      try {
        const [profile, details, ticketComments, ticketHistory] =
          await Promise.all([
            getCurrentUserProfile(),
            getTicketByIdApi(ticketIdNumber),
            getTicketComments(ticketIdNumber),
            getTicketHistory(ticketIdNumber),
          ])

        if (!isMounted) return

        setCurrentUser(profile)
        setTicket(details)
        setSelectedStatus(String(details.status))
        setComments(ticketComments)
        setHistory(ticketHistory)

        const suggestion = await getTicketPrioritySuggestion(ticketIdNumber)

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (isMounted) {
          setPrioritySuggestion(
            `${formatTicketPriority(suggestion.suggestedPriority)} - ${suggestion.rationale}`,
          )
        }
      } catch (caughtError) {
        if (isMounted) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : 'Unable to load ticket.',
          )
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void loadTicketWorkspace()

    return () => {
      isMounted = false
    }
  }, [navigate, ticketIdNumber])

  const reloadTimeline = async () => {
    const [freshComments, freshHistory] = await Promise.all([
      getTicketComments(ticketIdNumber),
      getTicketHistory(ticketIdNumber),
    ])

    setComments(freshComments)
    setHistory(freshHistory)
  }

  const runAction = async (actionName: string, action: () => Promise<void>) => {
    setError('')
    setNotice('')
    setBusyAction(actionName)

    try {
      await action()
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'The action could not be completed.',
      )
    } finally {
      setBusyAction('')
    }
  }

  const handleStatusChange = async () => {
    await runAction('status', async () => {
      const updatedTicket = await updateTicketStatus(
        ticketIdNumber,
        Number(selectedStatus),
      )
      setTicket(updatedTicket)
      setSelectedStatus(String(updatedTicket.status))
      await reloadTimeline()
      setNotice('Ticket status updated.')
    })
  }

  const handleAssignment = async (agentId: number) => {
    await runAction('assign', async () => {
      const updatedTicket = await assignTicket(ticketIdNumber, agentId)
      setTicket(updatedTicket)
      setAssignedAgentId('')
      setNotice('Ticket assignment updated.')
    })
  }

  const handleCommentSubmit = async () => {
    const message = commentMessage.trim()

    if (message.length < 5) {
      setError('Comment must be at least 5 characters.')
      return
    }

    await runAction('comment', async () => {
      await createTicketComment(ticketIdNumber, message)
      setCommentMessage('')
      await reloadTimeline()
      setNotice('Comment added.')
    })
  }

  const refreshPrioritySuggestion = async () => {
    await runAction('priority-ai', async () => {
      const suggestion = await getTicketPrioritySuggestion(ticketIdNumber)
      setPrioritySuggestion(
        `${formatTicketPriority(suggestion.suggestedPriority)} - ${suggestion.rationale}`,
      )
    })
  }

  const refreshResponseSuggestion = async () => {
    await runAction('response-ai', async () => {
      const suggestion = await getTicketResponseSuggestion(ticketIdNumber)
      setResponseSuggestion(
        [
          suggestion.suggestedReply,
          '',
          ...suggestion.suggestedSteps.map((step) => `- ${step}`),
          '',
          suggestion.escalationRecommendation,
        ].join('\n'),
      )
    })
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <TicketLoadingList />
      </div>
    )
  }

  if (error && !ticket) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="p-6 text-center">
            <h1 className="font-heading text-2xl font-semibold uppercase tracking-wider text-foreground">
              {error}
            </h1>
            <Link
              to="/tickets"
              className="mt-4 inline-block text-primary underline-offset-4 hover:underline"
            >
              Return to queue
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!ticket) return null

  const currentUserId = currentUser ? Number(currentUser.id) : null
  const canUseSelfAssignment =
    currentUser?.role === 'SupportAgent' && currentUserId !== null

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="mt-2 max-w-4xl font-heading text-4xl font-semibold uppercase tracking-wider text-foreground">
            {ticket.title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.priority} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to="/tickets">
            <Button variant="secondary">Back to queue</Button>
          </Link>
          <Link to="/tickets/new">
            <Button>New ticket</Button>
          </Link>
        </div>
      </div>

      {error ? (
        <div className="mb-4 border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {notice ? (
        <div className="mb-4 border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary">
          {notice}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle>Issue details</CardTitle>
              <CardDescription>
                Customer report and context for the support workflow.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="border border-border bg-background p-4">
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Description
                </div>
                <p className="leading-7 text-foreground/90">
                  {ticket.description}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <MetadataBlock label="Category" value={ticket.category} />
                <MetadataBlock
                  label="Requested by"
                  value={ticket.createdByEmail || 'Unknown'}
                />
                <MetadataBlock
                  label="Created"
                  value={formatDateTime(ticket.createdAt)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
              <CardDescription>
                Add notes and replies connected to this ticket.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Textarea
                value={commentMessage}
                onChange={(event) => setCommentMessage(event.target.value)}
                placeholder="Write a customer update or internal support note."
                className="min-h-30"
              />
              <div className="flex justify-end">
                <Button
                  onClick={() => void handleCommentSubmit()}
                  disabled={busyAction === 'comment'}
                >
                  {busyAction === 'comment' ? 'Adding...' : 'Add comment'}
                </Button>
              </div>

              <div className="space-y-3">
                {comments.length === 0 ? (
                  <EmptyPanel text="No comments yet." />
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="border border-border bg-background p-3"
                    >
                      <div className="mb-2 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                        <span>User #{comment.userId}</span>
                        <span>{formatDateTime(comment.createdAt)}</span>
                      </div>
                      <p className="leading-7 text-foreground">
                        {comment.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle>History</CardTitle>
              <CardDescription>
                Status changes recorded by the backend.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {history.length === 0 ? (
                <EmptyPanel text="No status history yet." />
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="border border-border bg-background p-3"
                  >
                    <div className="text-sm font-medium text-foreground">
                      {formatTicketStatus(item.oldStatus)} to{' '}
                      {formatTicketStatus(item.newStatus)}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {item.actorEmail || `User #${item.actorUserId}`} -{' '}
                      {formatDateTime(item.createdAt)}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle>Workflow</CardTitle>
              <CardDescription>
                Assignment and status actions backed by authorization rules.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <MetadataBlock
                label="Assigned agent"
                value={ticket.assignedAgentEmail || 'Unassigned'}
              />
              <MetadataBlock
                label="Priority"
                value={formatTicketPriority(ticket.priority)}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Update status
                </label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => setSelectedStatus(String(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  className="w-full"
                  onClick={() => void handleStatusChange()}
                  disabled={
                    busyAction === 'status' ||
                    selectedStatus === String(ticket.status)
                  }
                >
                  {busyAction === 'status' ? 'Updating...' : 'Update status'}
                </Button>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="assigned-agent-id"
                  className="text-sm font-medium text-foreground"
                >
                  Assign by agent id
                </label>
                <Input
                  id="assigned-agent-id"
                  value={assignedAgentId}
                  onChange={(event) => setAssignedAgentId(event.target.value)}
                  inputMode="numeric"
                  placeholder="Example: 2"
                />
                <Button
                  variant="secondary"
                  className="w-full"
                  disabled={
                    busyAction === 'assign' ||
                    Number.isNaN(Number(assignedAgentId)) ||
                    assignedAgentId.trim().length === 0
                  }
                  onClick={() => void handleAssignment(Number(assignedAgentId))}
                >
                  {busyAction === 'assign' ? 'Assigning...' : 'Assign ticket'}
                </Button>

                {canUseSelfAssignment ? (
                  <Button
                    variant="secondary"
                    className="w-full"
                    disabled={busyAction === 'assign'}
                    onClick={() => void handleAssignment(currentUserId)}
                  >
                    Assign to me
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle>AI assistance</CardTitle>
              <CardDescription>
                Backend suggestions for priority and response work.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <SuggestionPanel
                title="Priority"
                text={prioritySuggestion || 'No priority suggestion yet.'}
                buttonLabel="Refresh priority"
                busy={busyAction === 'priority-ai'}
                onRefresh={refreshPrioritySuggestion}
              />
              <SuggestionPanel
                title="Response"
                text={responseSuggestion || 'No response suggestion loaded.'}
                buttonLabel="Generate response"
                busy={busyAction === 'response-ai'}
                onRefresh={refreshResponseSuggestion}
              />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function MetadataBlock({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border border-border bg-background p-3">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-sm font-medium text-foreground">{value}</div>
    </div>
  )
}

function EmptyPanel({ text }: { text: string }) {
  return (
    <div className="border border-border bg-background p-4 text-sm text-muted-foreground">
      {text}
    </div>
  )
}

function SuggestionPanel({
  title,
  text,
  buttonLabel,
  busy,
  onRefresh,
}: {
  title: string
  text: string
  buttonLabel: string
  busy: boolean
  onRefresh: () => Promise<void>
}) {
  return (
    <div className="border border-primary/20 bg-primary/5 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        {title}
      </div>
      <p className="mt-3 whitespace-pre-line leading-7 text-foreground">
        {text}
      </p>
      <Button
        className="mt-4 w-full"
        variant="secondary"
        size="sm"
        disabled={busy}
        onClick={() => void onRefresh()}
      >
        {busy ? 'Working...' : buttonLabel}
      </Button>
    </div>
  )
}
