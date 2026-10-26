import { apiRequest } from '#/lib/api-request'
import type { TicketPriority, TicketStatus } from '#/types/ticket-enums'

export type ApiTicket = {
  id: number
  title: string
  description: string
  category: string
  priority: TicketPriority
  status: TicketStatus
  createdAt: string
  createdByEmail: string
  assignedAgentEmail?: string | null
}

export type ApiTicketComment = {
  id: number
  message: string
  createdAt: string
  ticketId: number
  userId: number
}

export type ApiTicketHistory = {
  id: number
  ticketId: number
  actorUserId: number
  actorEmail: string
  oldStatus: TicketStatus
  newStatus: TicketStatus
  createdAt: string
}

type PageResult<T> = {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export type ApiKnowledgeArticle = {
  id: number
  title: string
  content: string
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
  createdByUserId: number
  createdByEmail: string
}

export async function getTickets(signal?: AbortSignal) {
  const firstPage = await apiRequest<PageResult<ApiTicket>>(
    '/api/tickets?page=1&pageSize=50',
    { signal },
  )

  const tickets = [...firstPage.items]

  for (let page = 2; page <= firstPage.totalPages; page += 1) {
    const result = await apiRequest<PageResult<ApiTicket>>(
      `/api/tickets?page=${page}&pageSize=50`,
      { signal },
    )

    tickets.push(...result.items)
  }
  return tickets
}

export async function getTicketByIdApi(id: number, signal?: AbortSignal) {
  return apiRequest<ApiTicket>(`/api/tickets/${id}`, { signal })
}

export async function getKnowledgeArticles(signal?: AbortSignal) {
  return apiRequest<ApiKnowledgeArticle[]>('/api/knowledge', { signal })
}

export async function createTicket(payload: {
  title: string
  description: string
  category: string
  priority: TicketPriority
}) {
  return apiRequest<ApiTicket>('/api/tickets', {
    method: 'POST',
    data: payload,
  })
}

export async function updateTicketStatus(
  ticketId: number,
  status: TicketStatus,
) {
  return apiRequest<ApiTicket>(`/api/tickets/${ticketId}`, {
    method: 'PATCH',
    data: { status },
  })
}

export async function assignTicket(ticketId: number, assignedAgentId: number) {
  return apiRequest<ApiTicket>(`/api/tickets/${ticketId}/assignment`, {
    method: 'PATCH',
    data: { assignedAgentId },
  })
}

export async function getTicketComments(
  ticketId: number,
  signal?: AbortSignal,
) {
  return apiRequest<ApiTicketComment[]>(`/api/tickets/${ticketId}/comments`, {
    signal,
  })
}

export async function createTicketComment(ticketId: number, message: string) {
  return apiRequest<void>(`/api/tickets/${ticketId}/comments`, {
    method: 'POST',
    data: { message },
  })
}

export async function getTicketHistory(ticketId: number, signal?: AbortSignal) {
  return apiRequest<ApiTicketHistory[]>(`/api/tickets/${ticketId}/history`, {
    signal,
  })
}

export async function createKnowledgeArticle(payload: {
  title: string
  content: string
  category: string
  tags: string[]
}) {
  return apiRequest<ApiKnowledgeArticle>('/api/knowledge', {
    method: 'POST',
    data: payload,
  })
}

export async function getTicketPrioritySuggestion(ticketId: number) {
  return apiRequest<{ suggestedPriority: TicketPriority; rationale: string }>(
    `/api/tickets/${ticketId}/priority-suggestion`,
    { method: 'POST' },
  )
}

export async function getTicketResponseSuggestion(ticketId: number) {
  return apiRequest<{
    suggestedReply: string
    suggestedSteps: string[]
    escalationRecommendation: string
  }>(`/api/tickets/${ticketId}/response-suggestion`, { method: 'POST' })
}
