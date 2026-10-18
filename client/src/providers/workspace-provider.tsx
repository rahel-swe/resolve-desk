import { createContext, useContext, useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { useAuth } from '#/providers/auth-provider'
import type { ApiKnowledgeArticle, ApiTicket } from '#/services/ticket-service'
import { ticketListOptions } from '#/queries/ticket-queries'
import { ticketKeys } from '#/queries/keys/ticket-keys'
import { knowledgeKeys } from '#/queries/keys/knowledge-keys'
import { knowledgeListOptions } from '#/queries/knowledge-queries'

const emptyTickets: ApiTicket[] = []
const emptyArticles: ApiKnowledgeArticle[] = []

type Resource<T> = {
  data: T[]
  loading: boolean
  error: string
  refresh: () => Promise<void>
}

type Workspace = {
  queue: Resource<ApiTicket>
  library: Resource<ApiKnowledgeArticle>
}

const WorkspaceContext = createContext<Workspace | null>(null)

export function WorkspaceProvider({ children }: PropsWithChildren) {
  const { user, isAuthenticated } = useAuth()

  const sessionKey =
    isAuthenticated && user ? `${user.email}:${user.role}` : null

  const queryClient = useQueryClient()
  const previousSession = useRef(sessionKey)
  const ticketQuery = useQuery(ticketListOptions(sessionKey))

  const knowledgeQuery = useQuery(knowledgeListOptions(sessionKey))

  useEffect(() => {
    if (previousSession.current === sessionKey) return

    // Remove the old account's data on sign-out, account switch, or role change.
    queryClient.removeQueries({
      queryKey: ticketKeys.list(previousSession.current),
      exact: true,
    })
    queryClient.removeQueries({
      queryKey: knowledgeKeys.list(previousSession.current),
      exact: true,
    })

    previousSession.current = sessionKey
  }, [queryClient, sessionKey])

  const queue: Resource<ApiTicket> = {
    data: ticketQuery.data ?? emptyTickets,
    loading: ticketQuery.isLoading,
    error: ticketQuery.error?.message ?? '',
    refresh: async () => {
      if (sessionKey) await ticketQuery.refetch()
    },
  }

  const library: Resource<ApiKnowledgeArticle> = {
    data: knowledgeQuery.data ?? emptyArticles,
    error: knowledgeQuery.error?.message ?? '',
    loading: knowledgeQuery.isLoading,
    refresh: async () => {
      if (sessionKey) await knowledgeQuery.refetch()
    },
  }

  return (
    <WorkspaceContext.Provider value={{ queue, library }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const value = useContext(WorkspaceContext)

  if (!value)
    throw new Error('useWorkspace must be used within WorkspaceProvider.')
  return value
}
