export const ticketKeys = {
  all: ['tickets'] as const,
  list: (sessionKey: string | null) =>
    [...ticketKeys.all, 'list', sessionKey] as const,
  ticketDetails: (sessionKey: string | null, ticketId: number) => [
    ...ticketKeys.all,
    'ticket-details',
    sessionKey,
    ticketId,
  ],
  comments: (sessionKey: string | null, ticketId: number) => [
    ...ticketKeys.all,
    'comments',
    sessionKey,
    ticketId,
  ],
  history: (sessiionKey: string | null, ticketId: number) => [
    ...ticketKeys.all,
    'history',
    sessiionKey,
    ticketId,
  ],
}
