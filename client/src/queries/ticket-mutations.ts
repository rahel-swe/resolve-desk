import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketKeys } from '#/queries/keys/ticket-keys'
import {
  assignTicket,
  createTicket,
  createTicketComment,
  getTicketPrioritySuggestion,
  getTicketResponseSuggestion,
  updateTicketStatus,
} from '#/services/ticket-service'
import type { TicketStatus } from '#/types/ticket-enums'

export function useCreateTicketMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTicket,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ticketKeys.all }),
  })
}

export const useTicketPrioritySuggestionMutation = (
  sessionKey: string | null,
  ticketId: number,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: getTicketPrioritySuggestion,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [ticketKeys.ticketDetails(sessionKey, ticketId)],
      }),
  })
}

export const useTicketResponseSuggestionMutation = (
  sessionKey: string | null,
  ticketId: number,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: getTicketResponseSuggestion,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ticketKeys.ticketDetails(sessionKey, ticketId),
      }),
  })
}

export const useUpdateTicketStatusMutation = (
  sessionKey: string | null,
  ticketId: number,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (status: TicketStatus) => updateTicketStatus(ticketId, status),
    onSuccess: () => {
      ;(queryClient.invalidateQueries({
        queryKey: ticketKeys.ticketDetails(sessionKey, ticketId),
      }),
        queryClient.invalidateQueries({
          queryKey: ticketKeys.list(sessionKey),
        }))

      queryClient.invalidateQueries({
        queryKey: ticketKeys.history(sessionKey, ticketId),
      })
    },
  })
}

export const useAssignTicketMutation = (
  sessionKey: string | null,
  ticketId: number,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (assignedAgentId: number) =>
      assignTicket(ticketId, assignedAgentId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ticketKeys.ticketDetails(sessionKey, ticketId),
      }),
  })
}

export const useCreateTicketCommentMutation = (
  sessionKey: string | null,
  ticketId: number,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (message: string) => createTicketComment(ticketId, message),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ticketKeys.comments(sessionKey, ticketId),
      }),
  })
}
