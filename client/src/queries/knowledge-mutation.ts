import { createKnowledgeArticle } from '#/services/ticket-service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { knowledgeKeys } from './keys/knowledge-keys'

export const useKnowledgeArticaleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createKnowledgeArticle,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.all }),
  })
}
