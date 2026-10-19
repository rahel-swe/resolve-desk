import { useAuth } from '#/providers/auth-provider'
import {
  useAssignTicketMutation,
  useCreateTicketCommentMutation,
  useTicketPrioritySuggestionMutation,
  useTicketResponseSuggestionMutation,
  useUpdateTicketStatusMutation,
} from '#/queries/ticket-mutations'
import type {
  getTicketPrioritySuggestion,
  getTicketResponseSuggestion,
} from '#/services/ticket-service'
import { useRef, useState } from 'react'

export const useTicketActions = (ticketId: number) => {
  const { user } = useAuth()

  const assignTicket = useAssignTicketMutation(user!.email, ticketId)
  const updateTicketStatus = useUpdateTicketStatusMutation(
    user!.email,
    ticketId,
  )
  const ticketPrioritySuggestion = useTicketPrioritySuggestionMutation(
    user!.email,
    ticketId,
  )
  const ticketResponseSuggestion = useTicketResponseSuggestionMutation(
    user!.email,
    ticketId,
  )
  const createTicketComment = useCreateTicketCommentMutation(
    user!.email,
    ticketId,
  )

  const [busy, setBusy] = useState('')
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')

  const actionLocked = useRef(false)

  const [prioritySuggestion, setPrioritySuggestion] = useState<Awaited<
    ReturnType<typeof getTicketPrioritySuggestion>
  > | null>(null)
  const [responseSuggestion, setResponseSuggestion] = useState<Awaited<
    ReturnType<typeof getTicketResponseSuggestion>
  > | null>(null)

  async function runAction(name: string, action: () => Promise<void>) {
    if (actionLocked.current) return false
    actionLocked.current = true
    setBusy(name)

    setActionError('')
    setNotice('')

    try {
      await action()
      return true
    } catch (cause) {
      setActionError(
        cause instanceof Error
          ? cause.message
          : 'The action could not be completed.',
      )
      return false
    } finally {
      actionLocked.current = false
      setBusy('')
    }
  }

  return {
    busy,
    actionError,
    notice,
    prioritySuggestion,
    responseSuggestion,
    updateStatus: (status: number) =>
      runAction('status', async () => {
        await updateTicketStatus.mutateAsync(status, {
          onSuccess() {
            setNotice('Ticket status updated.')
          },
        })
      }),
    assign: (agentId: number) =>
      runAction('assign', async () => {
        await assignTicket.mutateAsync(agentId, {
          onSuccess() {
            setNotice('Ticket assignment updated.')
          },
        })
      }),
    addComment: (message: string) =>
      runAction('comment', async () => {
        if (message.trim().length < 5 || message.trim().length > 1000)
          throw new Error(
            'A comment must contain between 5 and 1,000 characters.',
          )

        await createTicketComment.mutateAsync(message.trim(), {
          onSuccess() {
            setNotice('Comment added to the conversation.')
          },
        })
      }),

    suggestPriority: () =>
      runAction('priority-ai', async () => {
        const result = await ticketPrioritySuggestion.mutateAsync(ticketId)
        setPrioritySuggestion(result)
      }),

    suggestResponse: () =>
      runAction('response-ai', async () => {
        const result = await ticketResponseSuggestion.mutateAsync(ticketId)
        setResponseSuggestion(result)
      }),
  }
}
