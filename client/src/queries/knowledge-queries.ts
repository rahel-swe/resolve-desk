import { queryOptions } from '@tanstack/react-query'
import { knowledgeKeys } from './keys/knowledge-keys'
import { getKnowledgeArticles } from '#/services/ticket-service'

export const knowledgeListOptions = (sessionKey: string | null) =>
  queryOptions({
    queryKey: knowledgeKeys.list(sessionKey),
    queryFn: ({ signal }) => getKnowledgeArticles(signal),
    enabled: sessionKey !== null,
  })
