import { apiRequest } from '#/lib/api'

export type ApiTicket = {
  id: number
  title: string
  description: string
  category: string
  priority: number
  status: number
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
  oldStatus: number
  newStatus: number
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

export async function getTickets() {
  const page = await apiRequest<PageResult<ApiTicket>>('/api/tickets')

  return page.items
}

export async function getTicketByIdApi(id: number) {
  return await apiRequest<ApiTicket>(`/api/tickets/${id}`)
}

export async function getKnowledgeArticles() {
  return apiRequest<ApiKnowledgeArticle[]>('/api/knowledge')
}

export async function createTicket(payload: {
  title: string
  description: string
  category: string
  priority: number
}) {
  return apiRequest<ApiTicket>('/api/tickets', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateTicketStatus(ticketId: number, status: number) {
  return apiRequest<ApiTicket>(`/api/tickets/${ticketId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export async function assignTicket(ticketId: number, assignedAgentId: number) {
  return apiRequest<ApiTicket>(`/api/tickets/${ticketId}/assignment`, {
    method: 'PATCH',
    body: JSON.stringify({ assignedAgentId }),
  })
}

export async function getTicketComments(ticketId: number) {
  return apiRequest<ApiTicketComment[]>(`/api/tickets/${ticketId}/comments`)
}

export async function createTicketComment(ticketId: number, message: string) {
  return apiRequest<void>(`/api/tickets/${ticketId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
}

export async function getTicketHistory(ticketId: number) {
  return apiRequest<ApiTicketHistory[]>(`/api/tickets/${ticketId}/history`)
}

export async function createKnowledgeArticle(payload: {
  title: string
  content: string
  category: string
  tags: string[]
}) {
  return apiRequest<ApiKnowledgeArticle>('/api/knowledge', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getTicketPrioritySuggestion(ticketId: number) {
  return apiRequest<{ suggestedPriority: number; rationale: string }>(
    `/api/tickets/${ticketId}/priority-suggestion`,
  )
}

export async function getTicketResponseSuggestion(ticketId: number) {
  return apiRequest<{
    suggestedReply: string
    suggestedSteps: string[]
    escalationRecommendation: string
  }>(`/api/tickets/${ticketId}/response-suggestion`)
}
