import { useCallback, useEffect, useRef, useState } from 'react'
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
import { useQuery } from '@tanstack/react-query'
import {
  ticketCommentsOptions,
  ticketDetailsOptions,
  ticketHistoryOptions,
  ticketListOptions,
} from '#/queries/ticket-queries'
import { useTicketActions } from './use-ticket-actions'

type TicketWorkspaceData = {
  ticket: ApiTicket
  comments: ApiTicketComment[]
  history: ApiTicketHistory[]
}

export type ResourceType = {
  data: TicketWorkspaceData | null
  loading: boolean
  error?: string
  refresh: () => Promise<void>
}

export function useTicketWorkspace(ticketId: number) {
  const { user } = useAuth()

  const ticketDetailsQuery = useQuery(
    ticketDetailsOptions(user!.email, ticketId),
  )
  const ticketCommentsQuery = useQuery(
    ticketCommentsOptions(user!.email, ticketId),
  )
  const ticketHistoryQuery = useQuery(
    ticketHistoryOptions(user!.email, ticketId),
  )

  const ticketActions = useTicketActions(ticketId)

  const data: TicketWorkspaceData | null =
    ticketDetailsQuery.data !== undefined &&
    ticketCommentsQuery.data !== undefined &&
    ticketHistoryQuery.data !== undefined
      ? {
          ticket: ticketDetailsQuery.data,
          comments: ticketCommentsQuery.data,
          history: ticketHistoryQuery.data,
        }
      : null

  const resource: ResourceType = {
    data,
    loading:
      ticketDetailsQuery.isLoading ||
      ticketCommentsQuery.isLoading ||
      ticketHistoryQuery.isLoading,
    error:
      ticketDetailsQuery.error?.message ||
      ticketCommentsQuery.error?.message ||
      ticketHistoryQuery.error?.message,
    refresh: async () => {
      if (!user || !Number.isSafeInteger(ticketId) || ticketId < 1) return

      await Promise.all([
        ticketDetailsQuery.refetch(),
        ticketCommentsQuery.refetch(),
        ticketHistoryQuery.refetch(),
      ])
    },
  }

  return {
    user,
    ...resource,
    ...ticketActions,
  }
}

export type TicketWorkspace = ReturnType<typeof useTicketWorkspace>
