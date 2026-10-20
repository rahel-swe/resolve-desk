import { queryOptions } from '@tanstack/react-query'
import { ticketKeys } from '#/queries/keys/ticket-keys'
import {
  getTicketByIdApi,
  getTicketComments,
  getTicketHistory,
  getTickets,
} from '#/services/ticket-service'

export const ticketListOptions = (sessionKey: string | null) =>
  queryOptions({
    queryKey: ticketKeys.list(sessionKey),
    queryFn: ({ signal }) => getTickets(signal),
    enabled: sessionKey !== null,
  })

export const ticketDetailsOptions = (
  sessionKey: string | null,
  ticketId: number,
) =>
  queryOptions({
    queryKey: ticketKeys.ticketDetails(sessionKey, ticketId),
    queryFn: ({ signal }) => getTicketByIdApi(ticketId, signal),
    enabled: sessionKey !== null && Number.isSafeInteger(ticketId),
  })

export const ticketCommentsOptions = (
  sessionKey: string | null,
  ticketId: number,
) =>
  queryOptions({
    queryKey: ticketKeys.comments(sessionKey, ticketId),
    queryFn: ({ signal }) => getTicketComments(ticketId, signal),
    enabled: sessionKey !== null && Number.isSafeInteger(ticketId),
  })

export const ticketHistoryOptions = (
  sessionKey: string | null,
  ticketId: number,
) =>
  queryOptions({
    queryKey: ticketKeys.history(sessionKey, ticketId),
    queryFn: ({ signal }) => getTicketHistory(ticketId, signal),
    enabled: sessionKey !== null && Number.isSafeInteger(ticketId),
  })
