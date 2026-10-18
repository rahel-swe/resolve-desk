import { queryOptions } from '@tanstack/react-query'
import { ticketKeys } from '#/queries/keys/ticket-keys'
import { getTickets } from '#/services/ticket-service'

export const ticketListOptions = (sessionKey: string | null) =>
  queryOptions({
    queryKey: ticketKeys.list(sessionKey),
    queryFn: ({ signal }) => getTickets(signal),
    enabled: sessionKey !== null,
  })
