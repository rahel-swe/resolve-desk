import {
  getAuthToken,
  getRefreshToken,
  clearSession,
} from '#/components/services/auth-service'

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

export type ApiResponse<T> = {
  isSuccess: boolean
  message: string
  data: T
}

type PageResult<T> = {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

type ApiEnvelope<T> = {
  isSuccess: boolean
  message: string
  data: T
}

type ProblemDetails = {
  title?: string
  detail?: string
  status?: number
  traceId?: string
}

function isApiEnvelope<T>(payload: unknown): payload is ApiEnvelope<T> {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'isSuccess' in payload &&
    'data' in payload
  )
}

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:5051'

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers)
  const token = getAuthToken()

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (
    !headers.has('Content-Type') &&
    init.body &&
    typeof init.body === 'string'
  ) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get('content-type') ?? ''
  const payload =
    contentType.includes('application/json') || contentType.includes('+json')
      ? await response.json()
      : await response.text()

  if (isApiEnvelope<T>(payload) && !payload.isSuccess) {
    throw new Error(payload.message || 'Request failed.')
  }

  if (!response.ok) {
    const problem = payload as ProblemDetails

    throw new Error(
      problem.detail ||
        problem.title ||
        `Request failed with status ${response.status}`,
    )
  }

  if (isApiEnvelope<T>(payload)) {
    return payload.data
  }

  return payload as T
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

export async function logoutFromApi() {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    clearSession()
    return
  }

  try {
    await apiRequest('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
  } finally {
    clearSession()
  }
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

export function formatTicketStatus(value: number) {
  switch (value) {
    case 0:
      return 'Open'
    case 1:
      return 'In Progress'
    case 2:
      return 'Waiting'
    case 3:
      return 'Resolved'
    case 4:
      return 'Closed'
    default:
      return 'Open'
  }
}

export function formatTicketPriority(value: number) {
  switch (value) {
    case 0:
      return 'Low'
    case 1:
      return 'Medium'
    case 2:
      return 'High'
    case 3:
      return 'Critical'
    default:
      return 'Medium'
  }
}

export function formatDateTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}
