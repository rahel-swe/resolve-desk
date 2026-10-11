import { afterEach, describe, expect, it } from 'vitest'
import { apiRequest } from '#/lib/api'
import {
  getCurrentUserProfile,
  logoutFromApi,
  registerWithApi,
  signInWithApi,
} from '#/services/auth-service'
import {
  getAuthToken,
  getRefreshToken,
  saveSession,
} from '#/services/auth-storage'
import {
  assignTicket,
  createKnowledgeArticle,
  createTicket,
  createTicketComment,
  getKnowledgeArticles,
  getTicketByIdApi,
  getTicketComments,
  getTicketHistory,
  getTicketPrioritySuggestion,
  getTicketResponseSuggestion,
  getTickets,
  updateTicketStatus,
} from '#/services/ticket-service'

const password = process.env.RESOLVEDESK_TEST_PASSWORD!
const runId = Date.now().toString(36)
const seedPrefix = '[ResolveDesk seed v1]'

async function login(name: string) {
  if (getAuthToken()) await logoutFromApi()
  const session = await signInWithApi(`seed.${name}@example.test`, password)
  saveSession(session)
  return getCurrentUserProfile()
}

afterEach(async () => {
  if (getRefreshToken()) await logoutFromApi()
})

describe('client services against the local seeded backend', () => {
  it.each([
    ['admin', 'Admin'],
    ['agent', 'SupportAgent'],
    ['agent-other', 'SupportAgent'],
    ['customer', 'Customer'],
    ['customer-other', 'Customer'],
    ['user', 'User'],
  ])('signs in %s and reads the matching profile', async (name, role) => {
    const profile = await login(name)
    expect(profile).toMatchObject({ email: `seed.${name}@example.test`, role })
    expect(profile.id).toBeGreaterThan(0)
  })

  it('loads all seed tickets over multiple backend pages without duplicate IDs', async () => {
    await login('admin')
    const tickets = await getTickets()
    expect(
      tickets.filter((ticket) => ticket.title.startsWith(seedPrefix)),
    ).toHaveLength(72)
    expect(new Set(tickets.map((ticket) => ticket.id)).size).toBe(
      tickets.length,
    )
    expect(tickets.length).toBeGreaterThan(50)
    for (let index = 1; index < tickets.length; index++)
      expect(Date.parse(tickets[index - 1].createdAt)).toBeGreaterThanOrEqual(
        Date.parse(tickets[index].createdAt),
      )
  })

  it.each([
    ['customer', 40],
    ['customer-other', 24],
    ['user', 8],
  ])('shows %s only its own tickets', async (name, count) => {
    const profile = await login(name)
    const tickets = await getTickets()
    expect(
      tickets.filter((ticket) => ticket.title.startsWith(seedPrefix)),
    ).toHaveLength(count)
    expect(
      tickets.every((ticket) => ticket.createdByEmail === profile.email),
    ).toBe(true)
  })

  it('creates a ticket, persists a comment, assigns an agent, records status history, and returns suggestions', async () => {
    await login('customer')
    const created = await createTicket({
      title: `[ResolveDesk smoke ${runId}] Cannot login`,
      description:
        'Please investigate this isolated client smoke test login issue.',
      category: 'IT Support',
      priority: 2,
    })
    expect(created.id).toBeGreaterThan(0)
    expect((await getTicketByIdApi(created.id)).createdByEmail).toBe(
      'seed.customer@example.test',
    )

    const message = `Client comment persistence check ${runId}.`
    await createTicketComment(created.id, message)
    expect(await getTicketComments(created.id)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message, ticketId: created.id }),
      ]),
    )
    await expect(createTicketComment(created.id, 'tiny')).rejects.toThrow()

    await login('customer-other')
    await expect(getTicketByIdApi(created.id)).rejects.toThrow()
    await expect(getTicketComments(created.id)).rejects.toThrow()
    await expect(
      createTicketComment(
        created.id,
        'An unrelated customer must not save this.',
      ),
    ).rejects.toThrow()

    const agent = await login('agent')
    await expect(updateTicketStatus(created.id, 1)).rejects.toThrow()
    expect((await assignTicket(created.id, agent.id)).assignedAgentEmail).toBe(
      agent.email,
    )
    expect((await updateTicketStatus(created.id, 1)).status).toBe(1)
    expect(await getTicketHistory(created.id)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          oldStatus: 0,
          newStatus: 1,
          actorUserId: agent.id,
        }),
      ]),
    )
    const priority = await getTicketPrioritySuggestion(created.id)
    expect(priority.suggestedPriority).toBe(2)
    expect(priority.rationale.length).toBeGreaterThan(0)
    const response = await getTicketResponseSuggestion(created.id)
    expect(response.suggestedReply.length).toBeGreaterThan(0)
    expect(response.suggestedSteps.length).toBeGreaterThan(0)
    expect(response.escalationRecommendation.length).toBeGreaterThan(0)

    await login('agent-other')
    await expect(updateTicketStatus(created.id, 3)).rejects.toThrow()
    await expect(assignTicket(created.id, agent.id)).rejects.toThrow()

    await login('admin')
    expect((await assignTicket(created.id, agent.id)).assignedAgentEmail).toBe(
      agent.email,
    )
    expect((await updateTicketStatus(created.id, 3)).status).toBe(3)
    const comments = await getTicketComments(created.id)
    expect(
      comments.filter((comment) => comment.message === message),
    ).toHaveLength(1)
    expect((await getTicketHistory(created.id)).length).toBe(2)
  })

  it('creates and reads an administrator article and surfaces a forbidden agent write', async () => {
    await login('admin')
    const payload = {
      title: `[ResolveDesk smoke ${runId}] Guide`,
      content: 'An isolated guide created through the real client service.',
      category: 'IT Support',
      tags: ['smoke', 'client'],
    }
    const article = await createKnowledgeArticle(payload)
    expect(article.id).toBeGreaterThan(0)
    expect(await getKnowledgeArticles()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: article.id, ...payload }),
      ]),
    )
    await login('agent')
    const before = getAuthToken()
    await expect(createKnowledgeArticle(payload)).rejects.toThrow('403')
    expect(getAuthToken()).toBe(before)
    expect(
      (await getKnowledgeArticles()).some((item) => item.id === article.id),
    ).toBe(true)
  })

  it('rotates an expired client access token and retries the requested service', async () => {
    const profile = await login('admin')
    const refreshToken = getRefreshToken()!
    saveSession({
      token: 'expired-smoke-access',
      refreshToken,
      email: profile.email,
      role: profile.role,
    })
    expect((await getCurrentUserProfile()).id).toBe(profile.id)
    expect(getRefreshToken()).not.toBe(refreshToken)
    expect(getAuthToken()).not.toBe('expired-smoke-access')
  })

  it('registers a customer with a renewable session and revokes it on logout', async () => {
    const email = `smoke.${runId}@example.test`
    const session = await registerWithApi('Smoke Customer', email, password)
    expect(session.role).toBe('Customer')
    expect(session.refreshToken.length).toBeGreaterThan(0)
    saveSession(session)
    expect((await getCurrentUserProfile()).email).toBe(email)
    await logoutFromApi()
    expect(getAuthToken()).toBeNull()
    await expect(
      apiRequest('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: session.refreshToken }),
        skipAuthRefresh: true,
      }),
    ).rejects.toThrow(/401|Unauthorized/)
  })
})
