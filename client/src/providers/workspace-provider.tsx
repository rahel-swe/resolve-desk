import { createContext, useContext } from 'react'
import type { PropsWithChildren } from 'react'
import { useApiResource } from '#/hooks/use-api-resource'
import { useAuth } from '#/providers/auth-provider'
import { getKnowledgeArticles, getTickets } from '#/services/ticket-service'
import type { ApiKnowledgeArticle, ApiTicket } from '#/services/ticket-service'

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
  const sessionKey = isAuthenticated && user ? user.email : null
  const queue = useApiResource(getTickets, emptyTickets, sessionKey)
  const library = useApiResource(
    getKnowledgeArticles,
    emptyArticles,
    sessionKey,
  )
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
