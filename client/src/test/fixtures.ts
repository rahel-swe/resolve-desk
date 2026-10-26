import type { ApiTicket, ApiKnowledgeArticle } from '#/services/ticket-service'
import type { StoredSession } from '#/services/auth-storage'

export const session: StoredSession = {
  token: 'test-access-token',
  refreshToken: 'test-refresh-token',
  email: 'seed.admin@example.test',
  role: 'Admin',
}

export function ticket(
  id: number,
  overrides: Partial<ApiTicket> = {},
): ApiTicket {
  return {
    id,
    title: `Sample request ${String(id).padStart(3, '0')}`,
    description: 'Please help with this sample login issue.',
    category: 'IT Support',
    priority: 'Medium',
    status: 'Open',
    createdAt: new Date(Date.UTC(2026, 9, 1, 12, id)).toISOString(),
    createdByEmail: 'seed.customer@example.test',
    assignedAgentEmail: id % 3 === 0 ? null : session.email,
    ...overrides,
  }
}

export const article: ApiKnowledgeArticle = {
  id: 1,
  title: 'Login troubleshooting',
  content: 'Confirm the account is active and retry signing in.',
  category: 'IT Support',
  tags: ['login'],
  createdAt: '2026-10-01T12:00:00Z',
  updatedAt: '2026-10-01T12:00:00Z',
  createdByUserId: 1,
  createdByEmail: session.email,
}

export function envelope<T>(data: T) {
  return { isSuccess: true, message: 'Data fetched successfully.', data }
}
