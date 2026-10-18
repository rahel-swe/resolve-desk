import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw/http'
import { API_BASE_URL } from '#/lib/http-client'
import { saveSession } from '#/services/auth-storage'
import * as tickets from '#/services/ticket-service'
import { server } from '#/test/mocks/server'
import { article, envelope, session, ticket } from '#/test/fixtures'

describe('ticket service HTTP contracts', () => {
  const payload = {
    title: 'Cannot login',
    description: 'Please help with this login issue.',
    category: 'IT Support',
    priority: 2,
  }
  const comment = {
    id: 7,
    ticketId: 1,
    userId: 2,
    message: 'Investigating now.',
    createdAt: '2026-10-01T12:00:00Z',
  }
  const history = {
    id: 1,
    ticketId: 1,
    actorUserId: 2,
    actorEmail: session.email,
    oldStatus: 0,
    newStatus: 1,
    createdAt: comment.createdAt,
  }
  const cases = [
    {
      name: 'ticket detail',
      method: 'get',
      path: '/api/tickets/1',
      body: undefined,
      data: ticket(1),
      call: () => tickets.getTicketByIdApi(1),
    },
    {
      name: 'knowledge list',
      method: 'get',
      path: '/api/knowledge',
      body: undefined,
      data: [article],
      call: () => tickets.getKnowledgeArticles(),
    },
    {
      name: 'create ticket',
      method: 'post',
      path: '/api/tickets',
      body: payload,
      data: ticket(1, payload),
      call: () => tickets.createTicket(payload),
    },
    {
      name: 'status update',
      method: 'patch',
      path: '/api/tickets/1',
      body: { status: 1 },
      data: ticket(1, { status: 1 }),
      call: () => tickets.updateTicketStatus(1, 1),
    },
    {
      name: 'assignment',
      method: 'patch',
      path: '/api/tickets/1/assignment',
      body: { assignedAgentId: 2 },
      data: ticket(1),
      call: () => tickets.assignTicket(1, 2),
    },
    {
      name: 'comments',
      method: 'get',
      path: '/api/tickets/1/comments',
      body: undefined,
      data: [comment],
      call: () => tickets.getTicketComments(1),
    },
    {
      name: 'history',
      method: 'get',
      path: '/api/tickets/1/history',
      body: undefined,
      data: [history],
      call: () => tickets.getTicketHistory(1),
    },
    {
      name: 'create article',
      method: 'post',
      path: '/api/knowledge',
      body: {
        title: article.title,
        content: article.content,
        category: article.category,
        tags: article.tags,
      },
      data: article,
      call: () =>
        tickets.createKnowledgeArticle({
          title: article.title,
          content: article.content,
          category: article.category,
          tags: article.tags,
        }),
    },
    {
      name: 'priority suggestion',
      method: 'post',
      path: '/api/tickets/1/priority-suggestion',
      body: undefined,
      data: { suggestedPriority: 2, rationale: 'Login issue.' },
      call: () => tickets.getTicketPrioritySuggestion(1),
    },
    {
      name: 'response suggestion',
      method: 'post',
      path: '/api/tickets/1/response-suggestion',
      body: undefined,
      data: {
        suggestedReply: 'Please retry.',
        suggestedSteps: ['Check credentials.'],
        escalationRecommendation: 'Normal triage.',
      },
      call: () => tickets.getTicketResponseSuggestion(1),
    },
  ] as const

  for (const item of cases) {
    it(`sends and decodes ${item.name} using the real route contract`, async () => {
      saveSession(session)
      let calls = 0
      server.use(
        http[item.method](
          `${API_BASE_URL}${item.path}`,
          async ({ request }) => {
            calls++
            expect(request.headers.get('authorization')).toBe(
              `Bearer ${session.token}`,
            )
            if (item.body) {
              expect(request.headers.get('content-type')).toBe(
                'application/json',
              )
              expect(await request.json()).toEqual(item.body)
            } else expect(await request.text()).toBe('')
            return HttpResponse.json(envelope(item.data))
          },
        ),
      )
      expect(await item.call()).toEqual(item.data)
      expect(calls).toBe(1)
    })
  }

  it('adds a comment when the server returns an empty 200 body, then reads it back', async () => {
    let saved = false
    server.use(
      http.post(
        `${API_BASE_URL}/api/tickets/1/comments`,
        async ({ request }) => {
          expect(await request.json()).toEqual({ message: comment.message })
          saved = true
          return new HttpResponse(null, { status: 200 })
        },
      ),
      http.get(`${API_BASE_URL}/api/tickets/1/comments`, () =>
        HttpResponse.json(envelope(saved ? [comment] : [])),
      ),
    )
    await tickets.createTicketComment(1, comment.message)
    expect(await tickets.getTicketComments(1)).toEqual([comment])
  })

  it('collects every backend page beyond the 50-item limit', async () => {
    const all = Array.from({ length: 123 }, (_, index) => ticket(index + 1))
    const pages: number[] = []
    server.use(
      http.get(`${API_BASE_URL}/api/tickets`, ({ request }) => {
        const params = new URL(request.url).searchParams
        const page = Number(params.get('page'))
        expect(params.get('pageSize')).toBe('50')
        pages.push(page)
        return HttpResponse.json(
          envelope({
            items: all.slice((page - 1) * 50, page * 50),
            page,
            pageSize: 50,
            totalCount: 123,
            totalPages: 3,
          }),
        )
      }),
    )
    expect(await tickets.getTickets()).toEqual(all)
    expect(pages).toEqual([1, 2, 3])
  })

  it('does not return a misleading partial queue if a later page fails', async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/tickets`, ({ request }) => {
        return new URL(request.url).searchParams.get('page') === '1'
          ? HttpResponse.json(
              envelope({
                items: [ticket(1)],
                page: 1,
                pageSize: 50,
                totalCount: 51,
                totalPages: 2,
              }),
            )
          : HttpResponse.json(
              { title: 'Queue unavailable', detail: 'Please retry later.' },
              { status: 503 },
            )
      }),
    )
    await expect(tickets.getTickets()).rejects.toThrow('Please retry later.')
  })

  it('handles an empty queue without requesting another page', async () => {
    let calls = 0
    server.use(
      http.get(`${API_BASE_URL}/api/tickets`, () => {
        calls++
        return HttpResponse.json(
          envelope({
            items: [],
            page: 1,
            pageSize: 50,
            totalCount: 0,
            totalPages: 0,
          }),
        )
      }),
    )
    expect(await tickets.getTickets()).toEqual([])
    expect(calls).toBe(1)
  })

  it('cancels list and detail reads through AbortSignal', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(tickets.getTickets(controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    })
    await expect(
      tickets.getTicketByIdApi(1, controller.signal),
    ).rejects.toMatchObject({ name: 'AbortError' })
  })
})
