import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketKeys } from '#/queries/keys/ticket-keys'
import { createTicket } from '#/services/ticket-service'

export function useCreateTicketMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTicket,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ticketKeys.all }),
  })
}
