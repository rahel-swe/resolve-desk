import { useCallback, useEffect, useRef, useState } from 'react'
import { useApiResource } from '#/hooks/use-api-resource'
import { useAuth } from '#/providers/auth-provider'
import { useWorkspace } from '#/providers/workspace-provider'
import {
  assignTicket,
  createTicketComment,
  getTicketByIdApi,
  getTicketComments,
  getTicketHistory,
  getTicketPrioritySuggestion,
  getTicketResponseSuggestion,
  updateTicketStatus,
} from '#/services/ticket-service'
import type {
  ApiTicket,
  ApiTicketComment,
  ApiTicketHistory,
} from '#/services/ticket-service'

type TicketWorkspaceData = {
  ticket: ApiTicket
  comments: ApiTicketComment[]
  history: ApiTicketHistory[]
}
const initialWorkspace: TicketWorkspaceData | null = null

export function useTicketWorkspace(ticketId: number) {
  const { user } = useAuth()
  const { queue } = useWorkspace()

  const [busy, setBusy] = useState('')
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')

  const [prioritySuggestion, setPrioritySuggestion] = useState<Awaited<
    ReturnType<typeof getTicketPrioritySuggestion>
  > | null>(null)
  const [responseSuggestion, setResponseSuggestion] = useState<Awaited<
    ReturnType<typeof getTicketResponseSuggestion>
  > | null>(null)

  const actionLocked = useRef(false)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const load = useCallback(
    async (signal: AbortSignal): Promise<TicketWorkspaceData | null> => {
      if (!Number.isSafeInteger(ticketId) || ticketId < 1)
        throw new Error('This ticket address is not valid.')
      const [ticket, comments, history] = await Promise.all([
        getTicketByIdApi(ticketId, signal),
        getTicketComments(ticketId, signal),
        getTicketHistory(ticketId, signal),
      ])
      return { ticket, comments, history }
    },
    [ticketId],
  )
  const resource = useApiResource(
    load,
    initialWorkspace,
    user ? `${user.email}/${ticketId}` : null,
  )

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
      if (mounted.current)
        setActionError(
          cause instanceof Error
            ? cause.message
            : 'The action could not be completed.',
        )
      return false
    } finally {
      actionLocked.current = false
      if (mounted.current) setBusy('')
    }
  }

  async function afterMutation(message: string) {
    if (!mounted.current) return
    await Promise.all([resource.refresh(), queue.refresh()])
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Either refresh can unmount the hook while awaiting.
    if (mounted.current) setNotice(message)
  }

  return {
    ...resource,
    user,
    busy,
    actionError,
    notice,
    prioritySuggestion,
    responseSuggestion,
    updateStatus: (status: number) =>
      runAction('status', async () => {
        await updateTicketStatus(ticketId, status)
        await afterMutation('Ticket status updated.')
      }),
    assign: (agentId: number) =>
      runAction('assign', async () => {
        await assignTicket(ticketId, agentId)
        await afterMutation('Ticket assignment updated.')
      }),
    addComment: (message: string) =>
      runAction('comment', async () => {
        if (message.trim().length < 5 || message.trim().length > 1000)
          throw new Error(
            'A comment must contain between 5 and 1,000 characters.',
          )

        await createTicketComment(ticketId, message.trim())
        await afterMutation('Comment added to the conversation.')
      }),

    suggestPriority: () =>
      runAction('priority-ai', async () => {
        const result = await getTicketPrioritySuggestion(ticketId)
        if (mounted.current) setPrioritySuggestion(result)
      }),

    suggestResponse: () =>
      runAction('response-ai', async () => {
        const result = await getTicketResponseSuggestion(ticketId)
        if (mounted.current) setResponseSuggestion(result)
      }),
  }
}

export type TicketWorkspace = ReturnType<typeof useTicketWorkspace>
