export const profileKeys = {
  all: ['profile'] as const,
  me: (userId: number | null) => [...profileKeys.all, 'me', userId] as const,
}
