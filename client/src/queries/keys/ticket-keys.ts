export const ticketKeys = {
  all: ['tickets'] as const,
  list: (sessionKey: string | null) =>
    [...ticketKeys.all, 'list', sessionKey] as const,
}
