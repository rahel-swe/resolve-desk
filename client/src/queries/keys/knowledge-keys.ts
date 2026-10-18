export const knowledgeKeys = {
  all: ['knowledge'] as const,
  list: (sessionKey: string | null) => [
    ...knowledgeKeys.all,
    'list',
    sessionKey,
  ],
}
